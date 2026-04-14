"use client";

import { useEffect, useState } from "react";

type Team = {
  id: string;
  display_name: string;
};

export default function TeamSelect({
  playerId,
  currentTeamId,
  currentTeamName,
}: {
  playerId: string;
  currentTeamId?: string | null;
  currentTeamName?: string | null;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [selected, setSelected] = useState(currentTeamId || "");
  const [saving, setSaving] = useState(false);

  /* LOAD TEAMS */
  useEffect(() => {
    fetch("/api/admin/teams/list")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  /* AUTO SAVE ON CHANGE */
  async function handleChange(value: string) {
    setSelected(value);
    setSaving(true);

    await fetch("/api/admin/players/assign-team", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id: playerId,
        team_id: value || null,
      }),
    });

    setSaving(false);
  }

  return (
    <div className="space-y-2">

      {/* LABEL */}
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-600">Team</label>

        {saving && (
          <span className="text-xs text-gray-400">
            Saving...
          </span>
        )}
      </div>

      {/* CURRENT TEAM DISPLAY */}
      <div className="text-sm text-gray-500">
        {currentTeamName || "Unassigned"}
      </div>

      {/* SELECT */}
      <select
        value={selected}
        onChange={(e) => handleChange(e.target.value)}
        className="border p-3 rounded w-full"
      >
        <option value="">No team</option>

        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.display_name}
          </option>
        ))}
      </select>

    </div>
  );
}