import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { age_group_id, team_name, display_name, format } = body;

    if (!age_group_id || !team_name || !display_name) {
      return NextResponse.json(
        { error: "Missing fields" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    const { error } = await supabase.from("teams").insert({
      age_group_id,
      team_name,
      display_name,
      format: format || "F7",
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to create team" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}