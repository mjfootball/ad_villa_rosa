import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(req: Request) {
  const supabase = supabaseService();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.toLowerCase();
  const team = searchParams.get("team");
  const position = searchParams.get("position");

  let query = supabase
    .from("players")
    .select(`
      id,
      first_name,
      last_name,
      parent_email,
      position,
      date_of_birth,
      avatar_url,
      emergency_contact_name,
      emergency_contact_phone,
      player_team (
        team_id,
        team:teams (
          id,
          display_name
        )
      )
    `)
    .order("first_name");

  /* 🔍 SEARCH */
  if (search) {
    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,parent_email.ilike.%${search}%`
    );
  }

  /* 🎯 POSITION FILTER */
  if (position && position !== "all") {
    query = query.eq("position", position);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ players fetch error:", error);
    return NextResponse.json([], { status: 500 });
  }

  /* 🔄 NORMALISE */
  let result = data.map((p: any) => {
    const link = p.player_team?.[0];

    const teamObj = link?.team;
    const teamData = Array.isArray(teamObj) ? teamObj[0] : teamObj;

    return {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      parent_email: p.parent_email,
      position: p.position || null,

      // 🔥 NEW FIELDS
      date_of_birth: p.date_of_birth || null,
      avatar_url: p.avatar_url || null,
      emergency_contact_name: p.emergency_contact_name || null,

      team_id: link?.team_id || null,
      team_name: teamData?.display_name || null,
    };
  });

  /* 🧠 TEAM FILTER */
  if (team && team !== "all") {
    result = result.filter((p) => p.team_id === team);
  }

  return NextResponse.json(result);
}