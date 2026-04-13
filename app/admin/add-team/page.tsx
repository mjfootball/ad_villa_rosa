"use client";

import { useEffect, useState } from "react";

type AgeGroup = {
  id: string;
  name_es: string;
};

export default function AddTeam() {
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);

  const [ageGroupId, setAgeGroupId] = useState("");
  const [teamName, setTeamName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [format, setFormat] = useState("F7");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/age-groups/list")
      .then((res) => res.json())
      .then(setAgeGroups);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/teams/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        age_group_id: ageGroupId,
        team_name: teamName,
        display_name: displayName,
        format,
      }),
    });

    if (!res.ok) {
      alert("Failed to create team");
      setLoading(false);
      return;
    }

    alert("Team created ✅");

    setTeamName("");
    setDisplayName("");
    setAgeGroupId("");
    setFormat("F7");

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold">Create Team</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          className="border p-3 w-full rounded"
          value={ageGroupId}
          onChange={(e) => setAgeGroupId(e.target.value)}
        >
          <option value="">Select age group</option>
          {ageGroups.map((g) => (
            <option key={g.id} value={g.id}>
              {g.name_es}
            </option>
          ))}
        </select>

        <input
          placeholder="Team letter (A, B, C...)"
          className="border p-3 w-full rounded"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          required
        />

        <input
          placeholder="Display name (Alevín A)"
          className="border p-3 w-full rounded"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          required
        />

        <select
          className="border p-3 w-full rounded"
          value={format}
          onChange={(e) => setFormat(e.target.value)}
        >
          <option value="F7">F7</option>
          <option value="F11">F11</option>
        </select>

        <button
          disabled={loading}
          className="bg-black text-white py-3 w-full rounded"
        >
          {loading ? "Creating…" : "Create Team"}
        </button>
      </form>
    </div>
  );
}