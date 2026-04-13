"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AddPlayer() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/players/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
      }),
    });

    if (!res.ok) {
      alert("Failed to create player");
      setLoading(false);
      return;
    }

    // redirect back to dashboard
    router.push("/dashboard");
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold">Add Child</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          placeholder="First name"
          className="border p-3 w-full rounded"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <input
          placeholder="Last name"
          className="border p-3 w-full rounded"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

        <button
          disabled={loading}
          className="bg-black text-white py-3 w-full rounded"
        >
          {loading ? "Creating…" : "Add Player"}
        </button>
      </form>
    </div>
  );
}