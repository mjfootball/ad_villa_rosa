"use client";

import { useEffect, useState } from "react";

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  parent_email: string;
  player_team?: {
    team?: {
      id: string;
      display_name: string;
    };
  }[];
};

type Team = {
  id: string;
  display_name: string;
};

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    fetch("/api/admin/players/list")
      .then((res) => res.json())
      .then(setPlayers);

    fetch("/api/admin/teams/list")
      .then((res) => res.json())
      .then(setTeams);
  }, []);

  async function updateTeam(playerId: string, teamId: string) {
    await fetch("/api/admin/players/update-team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id: playerId,
        team_id: teamId,
      }),
    });

    // refresh
    const res = await fetch("/api/admin/players/list");
    setPlayers(await res.json());
  }

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Players</h1>

      <div className="space-y-4">
        {players.map((p) => (
          <div key={p.id} className="border p-4 rounded">
            <div className="font-medium">
              {p.first_name} {p.last_name}
            </div>

            <div className="text-sm text-gray-500">
              {p.parent_email || "No parent assigned"}
            </div>

            <select
              className="mt-2 border p-2 rounded"
              value={p.player_team?.[0]?.team?.id || ""}
              onChange={(e) => updateTeam(p.id, e.target.value)}
            >
              <option value="">No team</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.display_name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
}