import { supabaseAuthServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import TeamClient from "./team-client";

/* -------------------------
   TYPES
------------------------- */
type Props = {
  params: Promise<{ teamId: string }>;
};

/* STAFF */
type StaffRow = {
  staff_id: string;
  role: string | null;
  staff: {
    id: string;
    first_name: string;
    last_name: string;
  } | null;
};

/* ✅ FIXED PLAYER TYPE (OBJECT, NOT ARRAY) */
type PlayerTeamRow = {
  player: {
    id: string;
    first_name: string;
    last_name: string;
    preferred_position?: string | null;
    preferred_foot?: string | null;
    created_at: string;
  } | null;
};

export default async function TeamDetailPage({ params }: Props) {
  console.log("🔥 ===============================");
  console.log("🔥 TEAM DETAIL PAGE START");

  const { teamId } = await params;

  console.log("🆔 TEAM ID:", teamId);

  const supabase = await supabaseAuthServer();

  /* -------------------------
     TEAM + STAFF
  ------------------------- */
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(`
      *,
      team_staff (
        staff_id,
        role,
        staff:staff (
          id,
          first_name,
          last_name
        )
      )
    `)
    .eq("id", teamId)
    .single();

  if (!team) {
    console.error("❌ TEAM NOT FOUND", teamError);
    return notFound();
  }

  console.log("📦 TEAM:", team);

  /* -------------------------
     NORMALISE STAFF
  ------------------------- */
  const staff =
    (team.team_staff as StaffRow[] | null)?.map((s) => ({
      staff_id: s.staff_id,
      first_name: s.staff?.first_name || "",
      last_name: s.staff?.last_name || "",
      role: s.role,
    })) || [];

  console.log("👨‍🏫 STAFF:", staff);

  /* -------------------------
     PLAYERS (FIXED)
  ------------------------- */
  const { data: playersRaw, error: playersError } = await supabase
    .from("player_team")
    .select(`
      player:players (
        id,
        first_name,
        last_name,
        preferred_position,
        preferred_foot,
        created_at
      )
    `)
    .eq("team_id", teamId);

  if (playersError) {
    console.error("❌ PLAYERS FETCH ERROR:", playersError);
  }

  console.log("📦 PLAYERS RAW:", playersRaw);

  const players =
    (playersRaw as PlayerTeamRow[] | null)
      ?.map((row) => {
        const p = row.player; // ✅ FIX HERE

        if (!p) return null;

        return {
          id: p.id,
          first_name: p.first_name,
          last_name: p.last_name,
          preferred_position: p.preferred_position || null,
          preferred_foot: p.preferred_foot || null,
          created_at: p.created_at,
        };
      })
      .filter((p): p is NonNullable<typeof p> => p !== null) || [];

  console.log("👥 FINAL PLAYERS:", players);
  console.log("📊 PLAYER COUNT:", players.length);

  /* -------------------------
     SAVED LINEUP
  ------------------------- */
  const { data: savedLineup, error: lineupError } = await supabase
    .from("team_lineups")
    .select("slot, player_id")
    .eq("team_id", teamId);

  if (lineupError) {
    console.error("❌ LINEUP FETCH ERROR:", lineupError);
  }

  console.log("💾 SAVED LINEUP:", savedLineup);

  console.log("🔥 TEAM DETAIL PAGE COMPLETE");
  console.log("🔥 ===============================");

  return (
    <div className="p-10 space-y-8 max-w-6xl mx-auto">
      <Link href="/admin/teams" className="text-sm hover:underline">
        ← Back
      </Link>

      <h1 className="text-3xl font-semibold">
        {team.display_name}
      </h1>

      <TeamClient
        team={team}
        staff={staff}
        players={players}
        savedLineup={savedLineup || []}
      />
    </div>
  );
}