import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      id,
      first_name,
      last_name,
      parent_email,
      team_id,
      position,
      date_of_birth,
      notes,
      medical_notes,
      avatar_url,
      emergency_contact_name,
      emergency_contact_phone,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing player ID" },
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
       BUILD SAFE UPDATE OBJECT
    ------------------------- */
    const updateData: any = {
      first_name,
      last_name,
      parent_email: cleanEmail,
      position,
      date_of_birth: date_of_birth
        ? new Date(date_of_birth).toISOString().split("T")[0]
        : null,
      notes,
      medical_notes,
      avatar_url,
      emergency_contact_name,
      emergency_contact_phone,
    };

    // ✅ REMOVE undefined fields (CRITICAL)
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    /* -------------------------
       UPDATE PLAYER
    ------------------------- */
    const { error: playerError } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", id);

    if (playerError) {
      console.error("❌ player update failed", playerError);
      return NextResponse.json(
        { error: "Player update failed" },
        { status: 500 }
      );
    }

    /* -------------------------
       TEAM UPDATE (ONLY IF SENT)
    ------------------------- */
    if (team_id !== undefined) {
      // delete existing
      await supabase
        .from("player_team")
        .delete()
        .eq("player_id", id);

      // insert new
      if (team_id) {
        await supabase.from("player_team").insert({
          player_id: id,
          team_id,
        });
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ server error", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}