import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

function getCurrentSeason() {
  const year = new Date().getFullYear();
  const month = new Date().getMonth();

  return month >= 7
    ? `${year}/${year + 1}`
    : `${year - 1}/${year}`;
}

export async function POST(req: Request) {
  const supabase = supabaseService();
  const body = await req.json();

  const { player_id, team_id } = body;

  console.log("🔥 ===============================");
  console.log("🔥 ASSIGN TEAM START");
  console.log("➡️ player_id:", player_id);
  console.log("➡️ team_id:", team_id);

  if (!player_id) {
    console.error("❌ Missing player_id");
    return NextResponse.json({ error: "Missing player_id" }, { status: 400 });
  }

  const season = getCurrentSeason();
  const now = new Date().toISOString();

  console.log("📅 CURRENT SEASON:", season);
  console.log("⏱️ TIMESTAMP:", now);

  /* -------------------------
     🧠 CHECK CURRENT ACTIVE HISTORY
  ------------------------- */
  const { data: current, error: currentError } = await supabase
    .from("player_history")
    .select("id, team_id, from_date, to_date")
    .eq("player_id", player_id)
    .is("to_date", null)
    .maybeSingle();

  console.log("📊 CURRENT ACTIVE HISTORY:", current);

  if (currentError) {
    console.error("❌ FAILED TO CHECK CURRENT HISTORY", currentError);
  }

  /* -------------------------
     🧠 DETERMINE EVENT TYPE (IMPROVED)
  ------------------------- */
  let event_type: string | null = null;

  if (!current?.team_id && team_id) {
    event_type = "assigned"; // first team assignment
  } else if (current?.team_id && team_id && current.team_id !== team_id) {
    event_type = "transferred"; // moving teams
  } else if (current?.team_id && !team_id) {
    event_type = "removed"; // removed from team
  }

  console.log("🏷️ EVENT TYPE:", event_type);

  /* 🚫 PREVENT DUPLICATE ACTION */
  if (current?.team_id === team_id) {
    console.warn("⚠️ SAME TEAM SELECTED - NO ACTION TAKEN");
    return NextResponse.json({ success: true });
  }

  /* -------------------------
     UPDATE PLAYER_TEAM LINK
  ------------------------- */
  console.log("🧹 REMOVING EXISTING TEAM LINK...");

  const { error: deleteError } = await supabase
    .from("player_team")
    .delete()
    .eq("player_id", player_id);

  if (deleteError) {
    console.error("❌ FAILED TO DELETE OLD TEAM", deleteError);
  } else {
    console.log("✅ OLD TEAM REMOVED");
  }

  if (team_id) {
    console.log("➕ INSERTING NEW TEAM LINK...");

    const { error: insertError } = await supabase
      .from("player_team")
      .insert({
        player_id,
        team_id,
      });

    if (insertError) {
      console.error("❌ TEAM INSERT FAILED", insertError);
    } else {
      console.log("✅ TEAM LINKED SUCCESSFULLY");
    }
  } else {
    console.warn("⚠️ PLAYER NOW HAS NO TEAM");
  }

  /* -------------------------
     🔥 CLOSE PREVIOUS HISTORY
  ------------------------- */
  console.log("🧹 CLOSING PREVIOUS HISTORY...");

  const { data: closedRows, error: closeError } = await supabase
    .from("player_history")
    .update({
      to_date: now,
    })
    .eq("player_id", player_id)
    .is("to_date", null)
    .select();

  if (closeError) {
    console.error("❌ FAILED TO CLOSE PREVIOUS HISTORY", closeError);
  } else {
    console.log("✅ CLOSED HISTORY ROWS:", closedRows);
  }

  /* -------------------------
     🔥 CREATE NEW HISTORY ENTRY
  ------------------------- */
  if (event_type) {
    console.log("➕ CREATING NEW HISTORY ENTRY...");

    const { data: newHistory, error: historyError } = await supabase
      .from("player_history")
      .insert({
        player_id,
        team_id: team_id || null,
        season,
        from_date: now,
        to_date: null,
        event_type,
      })
      .select()
      .single();

    if (historyError) {
      console.error("❌ HISTORY INSERT FAILED", historyError);
    } else {
      console.log("✅ NEW HISTORY CREATED:", newHistory);
    }
  } else {
    console.warn("⚠️ NO EVENT TYPE - HISTORY NOT CREATED");
  }

  console.log("🔥 ASSIGN TEAM COMPLETE");
  console.log("🔥 ===============================");

  return NextResponse.json({ success: true });
}