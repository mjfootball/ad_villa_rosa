import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const supabase = supabaseService();
  const body = await req.json();

  const { player_id, team_id } = body;

  /* REMOVE EXISTING */
  const { error: deleteError } = await supabase
    .from("player_team")
    .delete()
    .eq("player_id", player_id);

  if (deleteError) {
    console.error("❌ delete failed", deleteError);
  }

  /* INSERT NEW */
  if (team_id) {
    const { error: insertError } = await supabase
      .from("player_team")
      .insert({
        player_id,
        team_id,
      });

    if (insertError) {
      console.error("❌ insert failed", insertError);
    }
  }

  return NextResponse.json({ success: true });
}