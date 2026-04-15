"use client";

import { useEffect, useState } from "react";

type Team = {
  id: string;
  display_name: string;
};

export default function StaffTeamSelect({
  staffId,
}: {
  staffId: string;
}) {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [role, setRole] = useState("Head Coach");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/admin/teams/list")
      .then((r) => r.json())
      .then(setTeams);
  }, []);

  async function assign() {
    if (!teamId) return;

    setSaving(true);

    await fetch("/api/admin/teams/assign-staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: teamId,
        staff_id: staffId,
        role,
      }),
    });

    setSaving(false);
    setTeamId("");
  }

  return (
    <div className="space-y-2">

      {saving && (
        <span className="text-xs text-gray-400">
          Saving...
        </span>
      )}

      {/* TEAM */}
      <select
        value={teamId}
        onChange={(e) => setTeamId(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select team</option>

        {teams.map((t) => (
          <option key={t.id} value={t.id}>
            {t.display_name}
          </option>
        ))}
      </select>

      {/* ROLE */}
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option>Head Coach</option>
        <option>Assistant</option>
        <option>Coach</option>
      </select>

      <button
        onClick={assign}
        className="bg-black text-white px-4 py-2 rounded w-full"
      >
        Assign
      </button>

    </div>
  );
}