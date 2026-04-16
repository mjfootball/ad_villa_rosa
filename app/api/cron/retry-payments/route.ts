import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: Request) {
  console.log("🔁 RETRY JOB START");

  /* =====================================================
     🔐 AUTH PROTECTION (CRITICAL)
  ===================================================== */
  const authHeader = req.headers.get("authorization");

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn("❌ Unauthorized cron attempt");
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = supabaseService();

  try {
    /* -------------------------
       FIND FAILED CHARGES
    ------------------------- */
    const { data: charges, error } = await supabase
      .from("charges")
      .select(`
        id,
        player_id,
        amount,
        retry_count,
        player:players(parent_email)
      `)
      .eq("status", "pending")
      .lte("last_attempt_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    if (error) {
      console.error("❌ Failed to fetch charges:", error);
      return NextResponse.json({ success: false });
    }

    console.log(`📊 Charges to retry: ${charges?.length || 0}`);

    for (const charge of charges || []) {
      console.log("🔄 Retrying charge:", charge.id);

      try {
        /* -------------------------
           CREATE STRIPE SESSION
        ------------------------- */
        const session = await stripe.checkout.sessions.create({
          mode: "payment",

          line_items: [
            {
              price_data: {
                currency: "eur",
                product_data: {
                  name: "Academy Fees (Outstanding)",
                },
                unit_amount: charge.amount,
              },
              quantity: 1,
            },
          ],

          success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?paid=true`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,

          metadata: {
  player_id: charge.player_id,
  retry_charge_id: charge.id,
  expected_amount: charge.amount,
},
        });

        /* -------------------------
           SEND EMAIL (SAFE CALL)
        ------------------------- */
        const player = Array.isArray(charge.player)
  ? charge.player[0]
  : charge.player;

if (player?.parent_email && session.url) {
  console.log("📧 Sending retry email to:", player.parent_email);

  await fetch(
  `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/send-retry-email`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: player.parent_email,
      url: session.url,
      amount: charge.amount,
    }),
  }
);
}

        /* -------------------------
           UPDATE RETRY STATE
        ------------------------- */
        await supabase
          .from("charges")
          .update({
            retry_count: (charge.retry_count || 0) + 1,
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", charge.id);

      } catch (err) {
        console.error("❌ Retry failed for charge:", charge.id, err);
      }
    }

    console.log("✅ RETRY JOB COMPLETE");

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ CRON JOB FAILED:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}