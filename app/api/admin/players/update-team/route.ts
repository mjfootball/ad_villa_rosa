import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const supabase = supabaseService();
  const body = await req.json();

  const { player_id, team_id } = body;

  // remove existing team
  await supabase
    .from("player_team")
    .delete()
    .eq("player_id", player_id);

  // add new team
  if (team_id) {
    await supabase.from("player_team").insert({
      player_id,
      team_id,
    });
  }

  return NextResponse.json({ success: true });
}