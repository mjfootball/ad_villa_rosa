import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseService } from "@/lib/supabase/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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
    console.error("❌ Webhook signature verification failed", err);
    return new Response("Webhook Error", { status: 400 });
  }

  const supabase = supabaseService();

  /* -------------------------
     HANDLE SUCCESSFUL PAYMENT
  ------------------------- */
  if (event.type === "checkout.session.completed") {
  const session = event.data.object as Stripe.Checkout.Session;

  const playerId = session.metadata?.player_id;

  const now = new Date();

  // 👉 TEMP: monthly only for now
  const nextDue = new Date();
  nextDue.setMonth(nextDue.getMonth() + 1);

  /* -------------------------
     ACTIVATE PAYMENT
  ------------------------- */
  await supabase
    .from("subscriptions")
    .update({
      status: "active",
      paid_at: now.toISOString(),
      next_due_date: nextDue.toISOString(),
    })
    .eq("stripe_session_id", session.id);

  /* -------------------------
     CLEAN OLD PENDING
  ------------------------- */
  if (playerId) {
    await supabase
      .from("subscriptions")
      .delete()
      .eq("player_id", playerId)
      .eq("status", "pending")
      .neq("stripe_session_id", session.id);
  }
}

  return NextResponse.json({ received: true });
}