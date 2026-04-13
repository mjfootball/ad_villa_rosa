import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

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
        status
      )
    `);

  if (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }

  const result = data.map((p) => {
    const team =
  p.player_team?.[0]?.team?.[0]?.display_name || "No team";

    const sub = p.subscriptions?.find(
      (s) => s.status === "active"
    );

    return {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      team_name: team,
      next_due_date: sub?.next_due_date || null,
    };
  });

  return NextResponse.json(result);
}