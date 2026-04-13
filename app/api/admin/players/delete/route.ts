import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    /* -------------------------
       VALIDATION
    ------------------------- */
    if (!id) {
      return NextResponse.json(
        { error: "Missing player id" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    /* -------------------------
       DELETE RELATION FIRST
       (player_team)
    ------------------------- */
    const { error: relationError } = await supabase
      .from("player_team")
      .delete()
      .eq("player_id", id);

    if (relationError) {
      console.error("❌ relation delete failed", relationError);
      return NextResponse.json(
        { error: "Failed to remove player team link" },
        { status: 500 }
      );
    }

    /* -------------------------
       DELETE PLAYER
    ------------------------- */
    const { error: playerError } = await supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (playerError) {
      console.error("❌ player delete failed", playerError);
      return NextResponse.json(
        { error: "Failed to delete player" },
        { status: 500 }
      );
    }

    /* -------------------------
       SUCCESS
    ------------------------- */
    return NextResponse.json({
      success: true,
      deleted_id: id,
    });

  } catch (err) {
    console.error("❌ server error", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}