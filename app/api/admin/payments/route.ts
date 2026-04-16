import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  console.log("📊 ADMIN PAYMENTS FETCH START");

  const supabase = supabaseService();

  try {
    /* -------------------------
       GET PLAYERS
    ------------------------- */
    const { data: players, error: playerError } = await supabase
      .from("players")
      .select(`
        id,
        first_name,
        last_name,
        player_team (
          team:teams (
            display_name
          )
        )
      `);

    if (playerError) {
      console.error("❌ Player fetch failed", playerError);
      return NextResponse.json([], { status: 500 });
    }

    const results = [];

    for (const player of players || []) {
      const playerId = player.id;

      /* -------------------------
         CHARGES
      ------------------------- */
      const { data: charges } = await supabase
        .from("charges")
        .select("amount, month, status")
        .eq("player_id", playerId)
        .order("month", { ascending: true });

      /* -------------------------
         PAYMENTS
      ------------------------- */
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, created_at")
        .eq("player_id", playerId)
        .order("created_at", { ascending: false });

      /* -------------------------
         CALCULATIONS
      ------------------------- */
      const totalCharges =
        charges?.reduce((sum, c) => sum + c.amount, 0) || 0;

      const totalPayments =
        payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

      const balance = totalCharges - totalPayments;

      const lastPaid = payments?.[0]?.created_at || null;

      const nextDue = charges?.find(c => c.status === "pending")?.month || null;

      const team =
        player.player_team?.[0]?.team?.display_name || null;

      results.push({
        id: playerId,
        first_name: player.first_name,
        last_name: player.last_name,
        team_name: team,

        amount: balance > 0 ? balance : 0,
        last_paid: lastPaid,
        next_due_date: nextDue,
      });
    }

    console.log("✅ ADMIN PAYMENTS READY:", results.length);

    return NextResponse.json(results);

  } catch (err) {
    console.error("❌ ADMIN PAYMENTS FAILED", err);
    return NextResponse.json([], { status: 500 });
  }
}