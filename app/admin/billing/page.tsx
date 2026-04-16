"use client";

import { useEffect, useState } from "react";

export default function ClubSettingsPage() {
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------
     LOAD SETTINGS
  ------------------------- */
  useEffect(() => {
    fetch("/api/admin/club-settings")
      .then((res) => res.json())
      .then((data) => {
        if (data?.monthly_price) {
          setPrice((data.monthly_price / 100).toString());
        }
      });
  }, []);

  /* -------------------------
     SAVE SETTINGS
  ------------------------- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/admin/club-settings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        monthly_price: Number(price) * 100,
      }),
    });

    if (!res.ok) {
      alert("Failed to update settings");
      setLoading(false);
      return;
    }

    alert("Settings updated ✅");
    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold">Set Academy Player Price €</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="Monthly price (€)"
          className="border p-3 w-full rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-black text-white py-3 w-full rounded"
        >
          {loading ? "Saving…" : "Save Settings"}
        </button>
      </form>
    </div>
  );
}