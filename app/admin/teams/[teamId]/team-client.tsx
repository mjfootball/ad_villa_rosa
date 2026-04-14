"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

type SavedRow = {
  slot: string;
  player_id: string;
};

type Slots = Record<string, Player | null>;

export default function TeamClient({
  team,
  players,
  savedLineup,
}: {
  team: Team;
  players: Player[];
  savedLineup: SavedRow[];
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [slots, setSlots] = useState<Slots>({});

  /* -------------------------
     FORMATION
  ------------------------- */
  const formation =
    team.format === "F11"
      ? [
          ["GK"],
          ["LB", "CB1", "CB2", "RB"],
          ["LM", "CM1", "CM2", "RM"],
          ["ST1", "ST2"],
        ]
      : [
          ["GK"],
          ["DF1", "DF2"],
          ["MF1", "MF2", "MF3"],
          ["ST"],
        ];

  /* -------------------------
     HYDRATE FROM DB
  ------------------------- */
  useEffect(() => {
  async function hydrate() {
    console.log("🔄 HYDRATING LINEUP");

    const mapped: Slots = {};

    savedLineup.forEach((row) => {
      const player = players.find(p => p.id === row.player_id);
      if (player) mapped[row.slot] = player;
    });

    console.log("✅ HYDRATED:", mapped);

    setSlots(mapped);
  }

  hydrate();
}, [savedLineup, players]);

  /* -------------------------
     ASSIGN
  ------------------------- */
  function assign(slot: string) {
    if (!selectedPlayer) return;

    setSlots((prev) => ({
      ...prev,
      [slot]: selectedPlayer,
    }));

    setSelectedPlayer(null);
  }

  function remove(slot: string) {
    setSlots((prev) => ({
      ...prev,
      [slot]: null,
    }));
  }

  /* -------------------------
     SUBS
  ------------------------- */
  const assignedIds = Object.values(slots)
    .filter(Boolean)
    .map((p) => (p as Player).id);

  const subs = players.filter(p => !assignedIds.includes(p.id));

  /* -------------------------
     SAVE
  ------------------------- */
  async function saveLineup() {
    console.log("💾 SAVING LINEUP:", slots);

    await fetch("/api/admin/teams/save-lineup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: team.id,
        formation: team.format === "F11" ? "442" : "231",
        format: team.format,
        slots,
      }),
    });

    alert("Saved ✅");
  }

  return (
    <div className="space-y-6">

      <h2 className="text-xl font-semibold">
        Lineup ({team.format})
      </h2>

      {selectedPlayer && (
        <div className="p-2 bg-blue-100 text-sm rounded">
          Selected: {selectedPlayer.first_name}
        </div>
      )}

      {/* PITCH */}
      <div className="bg-green-100 p-6 rounded-xl space-y-6">

        {formation.map((row, i) => (
          <div key={i} className="flex justify-center gap-6">
            {row.map((slot) => (
              <Slot
                key={slot}
                slot={slot}
                player={slots[slot] || null}
                onAssign={() => assign(slot)}
                onRemove={() => remove(slot)}
              />
            ))}
          </div>
        ))}

      </div>

      {/* SUBS */}
      <div className="border p-4 rounded-xl">
        <h3 className="text-sm mb-2">Subs</h3>

        <div className="flex flex-wrap gap-2">
          {subs.map((p) => (
            <div
              key={p.id}
              onClick={() => setSelectedPlayer(p)}
              className={`px-3 py-2 border rounded cursor-pointer ${
                selectedPlayer?.id === p.id
                  ? "bg-blue-500 text-white"
                  : ""
              }`}
            >
              <div>
                {p.first_name} {p.last_name}
              </div>

              <div className="text-xs text-gray-500">
                {p.preferred_position || "—"} · {p.preferred_foot || "-"}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={saveLineup}
        className="bg-black text-white px-4 py-2 rounded"
      >
        Save Lineup
      </button>

    </div>
  );
}

/* -------------------------
   SLOT
------------------------- */
function Slot({
  slot,
  player,
  onAssign,
  onRemove,
}: {
  slot: string;
  player: Player | null;
  onAssign: () => void;
  onRemove: () => void;
}) {
  return (
    <div
      onClick={onAssign}
      className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-xs border cursor-pointer"
    >
      {player ? (
        <div className="text-center">
          <div>{player.first_name}</div>

          <div className="text-[10px] text-gray-500">
            {player.preferred_position} · {player.preferred_foot}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="text-red-500 text-[10px]"
          >
            remove
          </button>
        </div>
      ) : (
        <span className="text-gray-400">{slot}</span>
      )}
    </div>
  );
}