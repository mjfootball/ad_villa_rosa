import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase/service";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("❌ Webhook signature failed", err);
    return new Response("Webhook Error", { status: 400 });
  }

  const supabase = supabaseService();

  console.log("📩 Stripe event:", event.type);

  /* =====================================================
     ✅ CHECKOUT COMPLETED
  ===================================================== */
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const playerId = session.metadata?.player_id;
    const amount = session.amount_total;
    const expectedAmount = Number(session.metadata?.expected_amount);

    if (!playerId || !amount) {
      console.error("❌ Missing metadata");
      return NextResponse.json({ received: true });
    }

    /* -------------------------
       1. IDEMPOTENCY
    ------------------------- */
    const { data: existing } = await supabase
      .from("payments")
      .select("id")
      .eq("stripe_session_id", session.id)
      .maybeSingle();

    if (existing) {
      console.log("⚠️ Duplicate webhook ignored:", session.id);
      return NextResponse.json({ received: true });
    }

    /* -------------------------
       2. VALIDATE AMOUNT
    ------------------------- */
    if (expectedAmount && expectedAmount !== amount) {
      console.error("❌ Amount mismatch", {
        expected: expectedAmount,
        actual: amount,
      });
      return NextResponse.json({ received: true });
    }

    console.log("💰 PAYMENT CONFIRMED:", playerId, amount);

    /* -------------------------
       3. INSERT PAYMENT (GET ID)
    ------------------------- */
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        player_id: playerId,
        amount,
        method: "stripe",
        stripe_session_id: session.id,
      })
      .select()
      .single();

    if (paymentError || !payment) {
      console.error("❌ Payment insert failed", paymentError);
      return NextResponse.json({ received: true });
    }

    /* -------------------------
       4. APPLY PAYMENT (REAL ALLOCATION)
    ------------------------- */
    const { data: charges } = await supabase
      .from("charges")
      .select("id, amount")
      .eq("player_id", playerId)
      .eq("status", "pending")
      .order("month", { ascending: true });

    let remaining = amount;

    for (const charge of charges || []) {
      if (remaining <= 0) break;

      const allocationAmount = Math.min(remaining, charge.amount);

      /* ✅ RECORD ALLOCATION */
      await supabase.from("payment_allocations").insert({
        payment_id: payment.id,
        charge_id: charge.id,
        amount: allocationAmount,
      });

      /* ✅ UPDATE CHARGE IF FULLY PAID */
      if (allocationAmount === charge.amount) {
        await supabase
          .from("charges")
          .update({ status: "paid" })
          .eq("id", charge.id);
      }

      remaining -= allocationAmount;
    }

    if (remaining > 0) {
      console.warn("⚠️ Overpayment detected:", remaining);
    }

    /* -------------------------
       5. FETCH PLAYER
    ------------------------- */
    const { data: player } = await supabase
      .from("players")
      .select("first_name, last_name, parent_email")
      .eq("id", playerId)
      .single();

    /* -------------------------
       6. EMAIL CONFIRMATION
    ------------------------- */
    if (player?.parent_email) {
      try {
        await resend.emails.send({
          from: "Academy <payments@mjfootball.com>",
          to: player.parent_email,
          subject: "Payment received ✅",
          html: `
            <div style="font-family:sans-serif">
              <h2>Payment received</h2>

              <p>
                We’ve received a payment for 
                <strong>${player.first_name} ${player.last_name}</strong>.
              </p>

              <p style="font-size:18px;">
                <strong>€${(amount / 100).toFixed(2)}</strong>
              </p>

              <p>Your account has been updated.</p>
            </div>
          `,
        });

        console.log("📧 Confirmation email sent");
      } catch (err) {
        console.error("❌ Email failed", err);
      }
    }

    console.log("✅ PAYMENT FULLY PROCESSED");
  }

  /* =====================================================
     ❌ PAYMENT FAILED
  ===================================================== */
  if (event.type === "payment_intent.payment_failed") {
    const intent = event.data.object as Stripe.PaymentIntent;

    const playerId = intent.metadata?.player_id;

    if (!playerId) {
      return NextResponse.json({ received: true });
    }

    console.log("❌ PAYMENT FAILED:", playerId);

    const { data: charge } = await supabase
      .from("charges")
      .select("id, retry_count")
      .eq("player_id", playerId)
      .eq("status", "pending")
      .order("month", { ascending: true })
      .limit(1)
      .single();

    if (!charge) return NextResponse.json({ received: true });

    await supabase
      .from("charges")
      .update({
        retry_count: (charge.retry_count || 0) + 1,
        last_attempt_at: new Date().toISOString(),
        failure_reason:
          intent.last_payment_error?.message || "Unknown",
      })
      .eq("id", charge.id);

    const { data: player } = await supabase
      .from("players")
      .select("parent_email, first_name")
      .eq("id", playerId)
      .single();

    if (player?.parent_email) {
      try {
        await resend.emails.send({
          from: "Academy <payments@mjfootball.com>",
          to: player.parent_email,
          subject: "Payment failed ❌",
          html: `
            <div style="font-family:sans-serif">
              <h2>Payment failed</h2>

              <p>
                We couldn’t process your recent payment for 
                ${player.first_name}.
              </p>

              <p>Please log in to retry.</p>
            </div>
          `,
        });
      } catch (err) {
        console.error("❌ Failure email error", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}