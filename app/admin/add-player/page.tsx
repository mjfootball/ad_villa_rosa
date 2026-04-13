"use client";

import { useEffect, useState } from "react";

type Team = {
  id: string;
  display_name: string;
};

export default function AddPlayerAdmin() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [teamId, setTeamId] = useState("");
  const [position, setPosition] = useState(""); // ✅ NEW

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/teams/list")
      .then((res) => res.json())
      .then(setTeams);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/players/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        parent_email: parentEmail,
        team_id: teamId || null,
        position, // ✅ NEW
      }),
    });

    if (!res.ok) {
      alert("Failed to create player");
      setLoading(false);
      return;
    }

    alert("Player created ✅");

    // ✅ reset form
    setFirstName("");
    setLastName("");
    setParentEmail("");
    setTeamId("");
    setPosition(""); // ✅ NEW

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold">Add Player (Admin)</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* FIRST NAME */}
        <input
          placeholder="First name"
          className="border p-3 w-full rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        {/* LAST NAME */}
        <input
          placeholder="Last name"
          className="border p-3 w-full rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        {/* POSITION (NEW) */}
        <input
          placeholder="Position (e.g. CM, GK)"
          className="border p-3 w-full rounded"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
        />

        {/* PARENT EMAIL */}
        <input
          placeholder="Parent email"
          className="border p-3 w-full rounded"
          value={parentEmail}
          onChange={(e) => setParentEmail(e.target.value)}
        />

        {/* TEAM SELECT */}
        <select
          className="border p-3 w-full rounded"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">No team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.display_name}
            </option>
          ))}
        </select>

        {/* SUBMIT */}
        <button
          disabled={loading}
          className="bg-black text-white py-3 w-full rounded"
        >
          {loading ? "Creating…" : "Create Player"}
        </button>

      </form>
    </div>
  );
}