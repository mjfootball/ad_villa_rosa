// app/admin/teams/[teamId]/page.tsx

import { supabaseAuthServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
  params: Promise<{ teamId: string }>;
};

export default async function TeamDetailPage({ params }: Props) {
  const { teamId } = await params;

  const supabase = await supabaseAuthServer();

  /* -------------------------
     GET TEAM
  ------------------------- */
  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select("*")
    .eq("id", teamId)
    .single();

  if (teamError || !team) {
    console.error("Team fetch error:", teamError);
    return notFound();
  }

  /* -------------------------
     GET PLAYERS (UPDATED)
  ------------------------- */
  const { data: players, error: playersError } = await supabase
    .from("player_team")
    .select(`
      player:players (
        id,
        first_name,
        last_name,
        position,
        created_at
      )
    `)
    .eq("team_id", teamId);

  if (playersError) {
    console.error("Players fetch error:", playersError);
  }

  return (
    <div className="p-10 space-y-6 max-w-6xl mx-auto">

      {/* BACK */}
      <Link
        href="/admin/teams"
        className="text-sm text-muted-foreground hover:underline"
      >
        ← Back to teams
      </Link>

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">
          {team.display_name}
        </h1>
        <p className="text-sm text-muted-foreground">
          {team.format}
        </p>
      </div>

      {/* PLAYERS TABLE */}
      <div className="border rounded-xl">
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Position</th>
              <th className="text-left p-3">Joined</th>
            </tr>
          </thead>

          <tbody>
            {players && players.length > 0 ? (
              players.map((row: any) => {
                const p = row.player;

                return (
                  <tr key={p.id} className="border-b">
                    <td className="p-3">
                      {p.first_name} {p.last_name}
                    </td>

                    {/* ✅ UPDATED POSITION */}
                    <td className="p-3">
                      {p.position || "—"}
                    </td>

                    <td className="p-3">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={3} className="p-6 text-center">
                  No players in this team
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}