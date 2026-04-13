import { NextResponse } from "next/server";
import Stripe from "stripe";
import { supabaseAuthServer } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { player_id } = body;

    const supabase = await supabaseAuthServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(null, { status: 401 });
    }

    const supabaseAdmin = supabaseService();

    /* -------------------------
       GET INTERNAL USER
    ------------------------- */
    const { data: internalUser, error: userError } = await supabaseAdmin
      .from("users")
      .select("id")
      .eq("auth_user_id", user.id)
      .single();

    if (userError || !internalUser) {
      console.error("❌ internalUser fetch failed", userError);
      return NextResponse.json(null, { status: 400 });
    }

    /* -------------------------
       PREVENT DUPLICATE PAYMENTS
    ------------------------- */
    const { data: existingSubs } = await supabaseAdmin
      .from("subscriptions")
      .select("status")
      .eq("player_id", player_id)
      .eq("user_id", internalUser.id);

    const hasActive = existingSubs?.some((s) => s.status === "active");
    const hasPending = existingSubs?.some((s) => s.status === "pending");

    if (hasActive) {
      return NextResponse.json(
        { error: "Already subscribed" },
        { status: 400 }
      );
    }

    if (hasPending) {
      return NextResponse.json(
        { error: "Payment already in progress" },
        { status: 400 }
      );
    }

    /* -------------------------
       GET PLAYER TEAM
    ------------------------- */
    const { data: player } = await supabaseAdmin
      .from("players")
      .select(`
        id,
        player_team (
          team_id
        )
      `)
      .eq("id", player_id)
      .single();

    const teamId = player?.player_team?.[0]?.team_id;

    if (!teamId) {
      return NextResponse.json(
        { error: "Player has no team" },
        { status: 400 }
      );
    }

    /* -------------------------
       GET BILLING PLAN
    ------------------------- */
    const { data: plan } = await supabaseAdmin
      .from("billing_plans")
      .select("*")
      .eq("team_id", teamId)
      .eq("active", true)
      .single();

    if (!plan) {
      return NextResponse.json(
        { error: "No billing plan set for this team" },
        { status: 400 }
      );
    }

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
              name: `Subscription - ${plan.interval}`,
            },
            unit_amount: plan.amount,
          },
          quantity: 1,
        },
      ],

      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,

      metadata: {
        player_id,
        user_id: internalUser.id,
        team_id: teamId,
      },
    });

    /* -------------------------
       SAVE RECORD
    ------------------------- */
    await supabaseAdmin.from("subscriptions").insert({
      user_id: internalUser.id,
      player_id,
      amount: plan.amount,
      status: "pending",
      stripe_session_id: session.id,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("❌ checkout error:", err);
    return NextResponse.json(null, { status: 500 });
  }
}