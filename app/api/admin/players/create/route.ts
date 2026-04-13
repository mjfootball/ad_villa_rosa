import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      first_name,
      last_name,
      parent_email,
      team_id,
      position,

      // 🔥 OPTIONAL NEW FIELDS
      date_of_birth,
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
      return NextResponse.json(
        { error: "Missing player name" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    /* -------------------------
       CLEAN EMAIL
    ------------------------- */
    const cleanEmail = parent_email
      ? parent_email.toLowerCase().trim()
      : null;

    /* -------------------------
       CREATE PLAYER
    ------------------------- */
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        first_name,
        last_name,
        parent_email: cleanEmail,
        position: position || null,

        // 🔥 SAFE OPTIONAL INSERTS
    date_of_birth: date_of_birth
  ? new Date(date_of_birth).toISOString().split("T")[0]
  : null,
        notes: notes || null,
        medical_notes: medical_notes || null,
        avatar_url: avatar_url || null,
        emergency_contact_name: emergency_contact_name || null,
        emergency_contact_phone: emergency_contact_phone || null,
      })
      .select("id")
      .single();

    if (playerError || !player) {
      console.error("❌ player insert failed", playerError);
      return NextResponse.json(
        { error: "Player create failed" },
        { status: 500 }
      );
    }

    /* -------------------------
       TEAM LINK (OPTIONAL)
    ------------------------- */
    if (team_id) {
      const { error: teamError } = await supabase
        .from("player_team")
        .insert({
          player_id: player.id,
          team_id,
        });

      if (teamError) {
        console.error("❌ team link failed", teamError);

        // rollback (good practice)
        await supabase
          .from("players")
          .delete()
          .eq("id", player.id);

        return NextResponse.json(
          { error: "Team assignment failed" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      player_id: player.id,
    });

  } catch (err) {
    console.error("❌ server error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}