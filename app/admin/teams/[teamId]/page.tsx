import { supabaseAuthServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import TeamClient from "./team-client";

/* -------------------------
   TYPES
------------------------- */
type Props = {
  params: Promise<{ teamId: string }>; // ✅ FIX
};

export default async function TeamDetailPage({ params }: Props) {
  console.log("🔥 ===============================");
  console.log("🔥 TEAM DETAIL PAGE START");

  const { teamId } = await params; // ✅ FIX

  console.log("🆔 TEAM ID:", teamId);

  const supabase = await supabaseAuthServer();

  /* -------------------------
     TEAM
  ------------------------- */
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  console.log("📦 TEAM:", team);
  console.log("❌ TEAM ERROR:", teamError);

  if (!team) {
    console.error("❌ TEAM NOT FOUND");
    return notFound();
  }

  /* -------------------------
     PLAYERS
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

  console.log("👥 RAW PLAYERS:", playersRaw);

  type PlayerRow = {
    player: {
      id: string;
      first_name: string;
      last_name: string;
      preferred_position?: string | null;
      preferred_foot?: string | null;
      created_at: string;
    };
  };

  const players =
    playersRaw?.map((row: PlayerRow) => {
      const p = row.player;

      return {
        id: p.id,
        first_name: p.first_name,
        last_name: p.last_name,
        preferred_position: p.preferred_position || null,
        preferred_foot: p.preferred_foot || null,
        created_at: p.created_at,
      };
    }) || [];

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
        players={players}
        savedLineup={savedLineup || []}
      />
    </div>
  );
}