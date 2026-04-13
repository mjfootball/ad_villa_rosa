import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

type Subscription = {
  next_due_date: string | null;
  status: string;
  paid_at?: string | null;
  amount?: number | null;
  created_at?: string;
};

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;

  player_team?: {
    team?: {
      display_name?: string;
    } | {
      display_name?: string;
    }[];
  }[];

  subscriptions?: Subscription[];
};

export async function GET() {
  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("players")
    .select(`
      id,
      first_name,
      last_name,
      player_team (
        team:teams (
          display_name
        )
      ),
      subscriptions (
        next_due_date,
        status,
        paid_at,
        amount,
        created_at
      )
    `);

  if (error) {
    console.error("❌ payments fetch error:", error);
    return NextResponse.json(null, { status: 500 });
  }

  const now = new Date();

  const result = (data as PlayerRow[])
    .map((p) => {
      /* -------------------------
         TEAM
      ------------------------- */
      const teamObj = p.player_team?.[0]?.team;

      const team =
        Array.isArray(teamObj)
          ? teamObj[0]?.display_name
          : teamObj?.display_name || "No team";

      /* -------------------------
         GET LATEST SUBSCRIPTION
      ------------------------- */
      const sub = p.subscriptions
        ?.sort((a, b) =>
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        )[0];

      // ❌ remove players with NO subscription
      if (!sub) return null;

      /* -------------------------
         STATUS
      ------------------------- */
      let payment_status: "active" | "overdue" = "active";

      if (
        sub.next_due_date &&
        new Date(sub.next_due_date) < now
      ) {
        payment_status = "overdue";
      }

      return {
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        team_name: team,

        payment_status,

        // ✅ MATCH FRONTEND
        last_paid: sub.paid_at || null,
        next_due_date: sub.next_due_date || null,
        amount: sub.amount || null,
      };
    })
    .filter(Boolean);

  return NextResponse.json(result);
}