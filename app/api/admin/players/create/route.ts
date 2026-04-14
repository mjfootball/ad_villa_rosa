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
  try {
    console.log("🔥 ===============================");
    console.log("🔥 CREATE PLAYER START");

    const body = await req.json();

    console.log("📦 RAW BODY:", body);

    const {
      first_name,
      last_name,
      parent_email,
      preferred_position,
      date_of_birth,
      preferred_foot,
      notes,
      medical_notes,
      avatar_url,
      emergency_contact_name,
      emergency_contact_phone,
    } = body;

    /* -------------------------
       VALIDATION
    ------------------------- */
    if (!first_name || !last_name) {
      console.error("❌ Missing player name");
      return NextResponse.json(
        { error: "Missing player name" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    /* -------------------------
       HELPERS
    ------------------------- */
    const cleanEmail = parent_email
      ? parent_email.toLowerCase().trim()
      : null;

    const formatDate = (d?: string | null) => {
      if (!d) return null;
      try {
        return new Date(d).toISOString().split("T")[0];
      } catch (err) {
        console.warn("⚠️ INVALID DATE:", d);
        return null;
      }
    };

    /* -------------------------
       CREATE PLAYER
    ------------------------- */
    console.log("➕ INSERTING PLAYER...");

    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        first_name,
        last_name,
        parent_email: cleanEmail,
        preferred_position: preferred_position || null,
        date_of_birth: formatDate(date_of_birth),
        preferred_foot: preferred_foot || null,
        notes: notes || null,
        medical_notes: medical_notes || null,
        avatar_url: avatar_url || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
      })
      .select("id")
      .single();

    if (playerError || !player) {
      console.error("❌ PLAYER INSERT FAILED:", playerError);
      return NextResponse.json(
        { error: "Player create failed" },
        { status: 500 }
      );
    }

    console.log("✅ PLAYER CREATED:", player);

    /* -------------------------
       🔥 CREATE INITIAL HISTORY
    ------------------------- */
    console.log("🧠 CREATING INITIAL HISTORY ENTRY...");

    const season = getCurrentSeason();
    const now = new Date().toISOString();

    console.log("📅 SEASON:", season);
    console.log("⏱️ TIMESTAMP:", now);

    const { data: existingHistory } = await supabase
      .from("player_history")
      .select("id")
      .eq("player_id", player.id)
      .maybeSingle();

    if (existingHistory) {
      console.warn("⚠️ HISTORY ALREADY EXISTS - SKIPPING");
    } else {
      const { data: history, error: historyError } = await supabase
        .from("player_history")
        .insert({
          player_id: player.id,
          team_id: null,
          season,
          from_date: now,
          to_date: null,
          event_type: "created",
        })
        .select()
        .single();

      if (historyError) {
        console.error("❌ FAILED TO CREATE INITIAL HISTORY", historyError);
      } else {
        console.log("✅ INITIAL HISTORY CREATED:", history);
      }
    }

    console.log("🔥 CREATE PLAYER COMPLETE");
    console.log("🔥 ===============================");

    return NextResponse.json({
      success: true,
      player_id: player.id,
    });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}