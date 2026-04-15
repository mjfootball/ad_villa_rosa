import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const supabase = supabaseService();
  const body = await req.json();

  const { team_id, staff_id, role } = body;

  if (!team_id || !staff_id || !role) {
    return NextResponse.json(
      { error: "Missing data" },
      { status: 400 }
    );
  }

  /* -------------------------
     CHECK EXISTING (KEY PART)
  ------------------------- */
  const { data: existing } = await supabase
    .from("team_staff")
    .select("id")
    .eq("team_id", team_id)
    .eq("staff_id", staff_id)
    .eq("role", role)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "Already assigned with this role" },
      { status: 400 }
    );
  }

  /* -------------------------
     INSERT
  ------------------------- */
  const { error } = await supabase
    .from("team_staff")
    .insert({
      team_id,
      staff_id,
      role,
    });

  if (error) {
    console.error("❌ ASSIGN FAILED:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}