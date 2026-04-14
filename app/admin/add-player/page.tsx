"use client";

import { useState } from "react";

/* ✅ POSITION OPTIONS */
const POSITIONS = [
  "GK",
  "RB",
  "CB",
  "LB",
  "CDM",
  "CM",
  "CAM",
  "RW",
  "LW",
  "ST",
];

export default function AddPlayerAdmin() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [dob, setDob] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");

  const [loading, setLoading] = useState(false);

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
        parent_email: parentEmail || null,
        date_of_birth: dob || null,
        preferred_position: preferredPosition || null,
      }),
    });

    if (!res.ok) {
      alert("Failed to create player");
      setLoading(false);
      return;
    }

    alert("Player created ✅");

    setFirstName("");
    setLastName("");
    setParentEmail("");
    setDob("");
    setPreferredPosition("");

    setLoading(false);
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-6">
      <h1 className="text-2xl font-semibold">Add Player</h1>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* FIRST NAME */}
        <div>
          <label className="text-sm text-gray-600">First name</label>
          <input
            className="border p-3 w-full rounded"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>

        {/* LAST NAME */}
        <div>
          <label className="text-sm text-gray-600">Last name</label>
          <input
            className="border p-3 w-full rounded"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>

        {/* DOB */}
        <div>
          <label className="text-sm text-gray-600">Date of birth</label>
          <input
            type="date"
            className="border p-3 w-full rounded"
            value={dob || ""}
            onChange={(e) => setDob(e.target.value)}
          />
        </div>

        {/* PREFERRED POSITION (CHIPS) */}
        <div>
          <label className="text-sm text-gray-600">
            Preferred position
          </label>

          <div className="flex flex-wrap gap-2 mt-2">
            {POSITIONS.map((pos) => (
              <button
                key={pos}
                type="button"
                onClick={() => setPreferredPosition(pos)}
                className={`px-3 py-1 rounded text-sm border ${
                  preferredPosition === pos
                    ? "bg-black text-white"
                    : "bg-white"
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* EMAIL */}
        <div>
          <label className="text-sm text-gray-600">
            Parent email (optional)
          </label>
          <input
            className="border p-3 w-full rounded"
            value={parentEmail}
            onChange={(e) => setParentEmail(e.target.value)}
          />
        </div>

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