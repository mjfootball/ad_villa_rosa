"use client";

import { useEffect, useState } from "react";
import type { Team } from "@/types/team";

export default function BillingPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamId, setTeamId] = useState("");
  const [amount, setAmount] = useState("");
  const [interval, setInterval] = useState("monthly");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/admin/teams/list")
      .then((res) => res.json())
      .then(setTeams);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/billing/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: teamId,
        amount: Number(amount) * 100, // € → cents
        interval,
      }),
    });

    if (!res.ok) {
      alert("Failed to save billing");
      setLoading(false);
      return;
    }

    alert("Billing saved ✅");

    setTeamId("");
    setAmount("");
    setInterval("monthly");

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold">Billing Setup</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          required
          className="border p-3 w-full rounded"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.display_name}
            </option>
          ))}
        </select>

        <input
          placeholder="Amount (€)"
          className="border p-3 w-full rounded"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
        />

        <select
          className="border p-3 w-full rounded"
          value={interval}
          onChange={(e) => setInterval(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="one_off">One-off</option>
        </select>

        <button
          disabled={loading}
          className="bg-black text-white py-3 w-full rounded"
        >
          {loading ? "Saving…" : "Save Billing"}
        </button>
      </form>
    </div>
  );
}