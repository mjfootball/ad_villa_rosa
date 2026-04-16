import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

/* -------------------------
   TYPES
------------------------- */
type TeamData =
  | { display_name: string }
  | { display_name: string }[]
  | null;

type Charge = {
  player_id: string;
  amount: number;
  month: string;
  status: string | null;
};

type Payment = {
  player_id: string;
  amount: number;
  created_at: string;
};

export async function GET() {
  console.log("📊 ADMIN PAYMENTS FETCH START");

  const supabase = supabaseService();

  try {
    /* -------------------------
       FETCH ALL DATA (ONCE)
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

    const { data: charges } = await supabase
      .from("charges")
      .select("player_id, amount, month, status");

    const { data: payments } = await supabase
      .from("payments")
      .select("player_id, amount, created_at");

    /* -------------------------
       GROUP DATA
    ------------------------- */
    const chargesByPlayer = new Map<string, Charge[]>();
    const paymentsByPlayer = new Map<string, Payment[]>();

    charges?.forEach((c) => {
      const list = chargesByPlayer.get(c.player_id) || [];
      list.push(c);
      chargesByPlayer.set(c.player_id, list);
    });

    payments?.forEach((p) => {
      const list = paymentsByPlayer.get(p.player_id) || [];
      list.push(p);
      paymentsByPlayer.set(p.player_id, list);
    });

    const now = new Date();

    /* -------------------------
       BUILD RESULTS
    ------------------------- */
    const results = (players || []).map((player) => {
      const playerId = player.id;

      const playerCharges =
        chargesByPlayer.get(playerId) || [];

      const playerPayments =
        paymentsByPlayer.get(playerId) || [];

      /* -------------------------
         TEAM FIX
      ------------------------- */
      const teamData =
        player.player_team?.[0]?.team as TeamData;

      let team: string | null = null;

      if (Array.isArray(teamData)) {
        team = teamData[0]?.display_name || null;
      } else if (teamData) {
        team = teamData.display_name;
      }

      /* -------------------------
         TOTALS (MATCH PARENT LOGIC)
      ------------------------- */
      const totalCharges = playerCharges.reduce(
        (sum, c) => sum + c.amount,
        0
      );

      const totalPayments = playerPayments.reduce(
        (sum, p) => sum + p.amount,
        0
      );

      const balance = totalCharges - totalPayments;

      /* -------------------------
         PENDING + OVERDUE
      ------------------------- */
      const pendingCharges = playerCharges
        .filter((c) => c.status === "pending")
        .sort(
          (a, b) =>
            new Date(a.month).getTime() -
            new Date(b.month).getTime()
        );

      const overdueCharges = pendingCharges.filter(
        (c) => new Date(c.month) < now
      );

      const monthsOverdue = overdueCharges.length;

      /* -------------------------
         DATES
      ------------------------- */
      const nextDue = pendingCharges[0]?.month || null;

      const lastPaid =
        playerPayments
          .sort(
            (a, b) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0]?.created_at || null;

      /* -------------------------
         STATUS (MATCH PARENT)
      ------------------------- */
      const status =
        monthsOverdue > 0
          ? "overdue"
          : balance > 0
          ? "pending"
          : "paid";

      return {
        id: playerId,
        first_name: player.first_name,
        last_name: player.last_name,
        team_name: team,

        amount: balance > 0 ? balance : 0,
        status,
        last_paid: lastPaid,
        next_due_date: nextDue,
        months_overdue: monthsOverdue, // 🔥 useful for UI
      };
    });

    console.log("✅ ADMIN PAYMENTS READY:", results.length);

    return NextResponse.json(results);

  } catch (err) {
    console.error("❌ ADMIN PAYMENTS FAILED", err);
    return NextResponse.json([], { status: 500 });
  }
}