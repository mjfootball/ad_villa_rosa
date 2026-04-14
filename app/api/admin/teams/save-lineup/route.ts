import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  console.log("🔥 SAVE LINEUP START");

  const supabase = supabaseService();
  const body = await req.json();

  const { team_id, formation, format, slots } = body;

  console.log("📦 PAYLOAD:", body);

  if (!team_id || !slots) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  /* -------------------------
     DELETE EXISTING
  ------------------------- */
  await supabase
    .from("team_lineups")
    .delete()
    .eq("team_id", team_id);

  console.log("🧹 OLD LINEUP CLEARED");

  /* -------------------------
     BUILD INSERT
  ------------------------- */
  const rows = Object.entries(slots)
    .filter(([_, player]) => player !== null)
    .map(([slot, player]: any) => ({
      team_id,
      formation,
      format,
      slot,
      player_id: player.id,
    }));

  console.log("📥 INSERT ROWS:", rows);

  const { error } = await supabase
    .from("team_lineups")
    .insert(rows);

  if (error) {
    console.error("❌ SAVE FAILED", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  console.log("✅ LINEUP SAVED");

  return NextResponse.json({ success: true });
}