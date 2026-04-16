import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    console.log("📥 CREATE CHECKOUT START");

    const { player_id } = await req.json();

    if (!player_id) {
      return NextResponse.json(
        { error: "Missing player_id" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    /* -------------------------
       GET UNPAID CHARGES
    ------------------------- */
    const { data: charges, error } = await supabase
      .from("charges")
      .select("amount")
      .eq("player_id", player_id)
      .eq("status", "pending");

    if (error) {
      console.error("❌ Charge fetch error:", error);
      return NextResponse.json(null, { status: 500 });
    }

    const total =
      charges?.reduce((sum, c) => sum + c.amount, 0) || 0;

    if (total <= 0) {
      return NextResponse.json(
        { error: "Nothing to pay" },
        { status: 400 }
      );
    }

    console.log("💰 Creating session for:", player_id, total);

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
              name: "Academy Fees",
            },
            unit_amount: total,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,

      metadata: {
        player_id,
        expected_amount: total.toString(),
      },
    });

    console.log("✅ Checkout session created:", session.id);

    return NextResponse.json({ url: session.url });

  } catch (err) {
    console.error("❌ Checkout error:", err);
    return NextResponse.json(null, { status: 500 });
  }
}