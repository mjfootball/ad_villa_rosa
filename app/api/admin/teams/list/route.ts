import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      display_name,
      team_name,
      format,
      age_group:age_groups (
        name_es
      )
    `)
    .order("display_name");

  if (error) {
    console.error("Teams fetch error:", error);
    return NextResponse.json(null, { status: 500 });
  }

  // ✅ format data for frontend
  const formatted = data.map((t: any) => ({
    id: t.id,
    display_name: t.display_name,
    team_name: t.team_name,
    format: t.format,
    age_group_name: t.age_group?.name_es || null,
  }));

  return NextResponse.json(formatted);
}