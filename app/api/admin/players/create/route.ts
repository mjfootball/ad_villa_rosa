import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { first_name, last_name, parent_email, team_id } = body;

    if (!first_name || !last_name) {
      return NextResponse.json(
        { error: "Missing player name" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    /* -------------------------
       CREATE PLAYER
    ------------------------- */
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        first_name,
        last_name,
        parent_email: parent_email?.toLowerCase() || null,
      })
      .select("id")
      .single();

    if (playerError) {
      console.error(playerError);
      return NextResponse.json({ error: "Player create failed" }, { status: 500 });
    }

    /* -------------------------
       LINK TEAM (optional)
    ------------------------- */
    if (team_id) {
      const { error: teamError } = await supabase
        .from("player_team")
        .insert({
          player_id: player.id,
          team_id,
        });

      if (teamError) {
        console.error(teamError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}