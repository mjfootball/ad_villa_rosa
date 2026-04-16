import { supabaseAuthServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PlayerProfileClient from "./player-profile-client";

type Props = {
  params: Promise<{ playerId: string }>;
};

export default async function Page({ params }: Props) {
  const { playerId } = await params;

  console.log("🔥 ===============================");
  console.log("🔥 FETCH PLAYER PAGE START");
  console.log("🆔 PLAYER ID:", playerId);

  const supabase = await supabaseAuthServer();

  /* -------------------------
     FETCH PLAYER + RELATIONS
  ------------------------- */
  const { data, error } = await supabase
    .from("players")
    .select(`
      *,
      
      player_history (
        id,
        season,
        position,
        notes,
        from_date,
        to_date,
        event_type,
        team:teams (
          id,
          display_name
        )
      ),

      player_team (
        team_id,
        team:teams (
          id,
          display_name
        )
      )
    `)
    .eq("id", playerId)
    .single();

  if (error || !data) {
    console.error("❌ PLAYER FETCH ERROR:", error);
    return notFound();
  }

  console.log("📦 RAW PLAYER DATA:", data);
  console.log("📊 RAW PLAYER HISTORY:", data.player_history);

  /* -------------------------
     NORMALISE TEAM
  ------------------------- */
  const link = data.player_team?.[0];

  const teamData = Array.isArray(link?.team)
    ? link.team[0]
    : link?.team;

  console.log("🔗 TEAM LINK:", link);
  console.log("🏷️ TEAM DATA:", teamData);

  /* -------------------------
     SORT HISTORY (LATEST FIRST)
  ------------------------- */
  const sortedHistory =
    data.player_history?.sort((a: any, b: any) => {
      const dateA = new Date(a.from_date || 0).getTime();
      const dateB = new Date(b.from_date || 0).getTime();
      return dateB - dateA;
    }) || [];

  console.log("📊 SORTED HISTORY:", sortedHistory);

  /* -------------------------
     FINAL PLAYER OBJECT
  ------------------------- */
  const player = {
    ...data,
    player_history: sortedHistory,

    team_id: link?.team_id || null,
    team_name: teamData?.display_name || null,
  };

  console.log("✅ FINAL PLAYER OBJECT:", player);
  console.log("🔥 FETCH PLAYER PAGE COMPLETE");
  console.log("🔥 ===============================");

  return <PlayerProfileClient player={player} />;
}