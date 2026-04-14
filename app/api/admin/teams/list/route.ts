import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = supabaseService();

  console.log("🔥 ===============================");
  console.log("🔥 FETCH TEAMS START");

  /* -------------------------
     FETCH FROM DB
  ------------------------- */
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
    console.error("❌ TEAMS FETCH ERROR:", error);
    return NextResponse.json(null, { status: 500 });
  }

  console.log("📦 RAW TEAMS DATA:", data);

  if (!data || data.length === 0) {
    console.warn("⚠️ NO TEAMS FOUND IN DATABASE");
  }

  /* -------------------------
     FORMAT DATA
  ------------------------- */
  const formatted = data.map((t: any) => {
    const formattedTeam = {
      id: t.id,
      display_name: t.display_name,
      team_name: t.team_name,
      format: t.format,
      age_group_name: t.age_group?.name_es || null,
    };

    console.log("🔄 FORMATTED TEAM:", formattedTeam);

    return formattedTeam;
  });

  console.log("✅ FINAL TEAMS RESPONSE:", formatted);
  console.log("🔥 FETCH TEAMS COMPLETE");
  console.log("🔥 ===============================");

  return NextResponse.json(formatted);
}