import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

/* ✅ IMPORT SHARED TYPE */
import type { PlayerRow } from "@/types/db";

export async function GET(req: Request) {
  const supabase = supabaseService();

  console.log("🔥 ===============================");
  console.log("🔥 FETCH PLAYERS LIST START");

  const { searchParams } = new URL(req.url);

  const search = searchParams.get("search")?.toLowerCase();
  const team = searchParams.get("team");
  const position = searchParams.get("position");

  console.log("🔍 FILTERS:", { search, team, position });

  /* -------------------------
     QUERY
  ------------------------- */
  let query = supabase
    .from("players")
    .select(`
      id,
      first_name,
      last_name,
      parent_email,
      preferred_position,
      preferred_foot,
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
    console.log("🔎 APPLYING SEARCH FILTER");

    query = query.or(
      `first_name.ilike.%${search}%,last_name.ilike.%${search}%,parent_email.ilike.%${search}%`
    );
  }

  /* 🎯 POSITION FILTER */
  if (position && position !== "all") {
    console.log("🎯 APPLYING POSITION FILTER:", position);

    query = query.eq("preferred_position", position);
  }

  const { data, error } = await query;

  if (error) {
    console.error("❌ PLAYERS FETCH ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }

  console.log("📦 RAW PLAYERS DATA:", data);

  /* -------------------------
     NORMALISE
  ------------------------- */
  let result = (data as PlayerRow[]).map((p) => {
    const link = p.player_team?.[0];

    const teamObj = link?.team;
    const teamData = Array.isArray(teamObj)
      ? teamObj[0]
      : teamObj;

    const formatted = {
      id: p.id,
      first_name: p.first_name,
      last_name: p.last_name,
      parent_email: p.parent_email,
      preferred_position: p.preferred_position || null,
      preferred_foot: p.preferred_foot || null,

      date_of_birth: p.date_of_birth || null,
      avatar_url: p.avatar_url || null,
      emergency_contact_name:
        p.emergency_contact_name || null,

      team_id: link?.team_id || null,
      team_name: teamData?.display_name || null,
    };

    console.log("🔄 FORMATTED PLAYER:", formatted);

    return formatted;
  });

  /* 🧠 TEAM FILTER (POST QUERY) */
  if (team && team !== "all") {
    console.log("🏷️ APPLYING TEAM FILTER:", team);

    result = result.filter((p) => p.team_id === team);
  }

  console.log("✅ FINAL PLAYERS RESPONSE:", result);
  console.log("🔥 FETCH PLAYERS LIST COMPLETE");
  console.log("🔥 ===============================");

  return NextResponse.json(result);
}