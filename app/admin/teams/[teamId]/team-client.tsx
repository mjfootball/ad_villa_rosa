"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/types/player";
import type { Team } from "@/types/team";

/* -------------------------
   TYPES
------------------------- */
type SavedRow = {
  slot: string;
  player_id: string;
};

type Staff = {
  staff_id: string;
  first_name: string;
  last_name: string;
  role?: string | null;
};

type StaffListItem = {
  id: string;
  first_name: string;
  last_name: string;
};

type Slots = Record<string, Player | null>;

export default function TeamClient({
  team,
  staff,
  players,
  savedLineup,
}: {
  team: Team;
  staff: Staff[];
  players: Player[];
  savedLineup: SavedRow[];
}) {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [slots, setSlots] = useState<Slots>({});

  /* -------------------------
     STAFF STATE
  ------------------------- */
  const [teamStaff, setTeamStaff] = useState<Staff[]>(staff || []);
  const [staffList, setStaffList] = useState<StaffListItem[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedRole, setSelectedRole] = useState("Head Coach");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  /* -------------------------
     DUPLICATE CHECK
  ------------------------- */
  function isDuplicate(staffId: string, role: string) {
    return teamStaff.some(
      (s) => s.staff_id === staffId && s.role === role
    );
  }

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
     HYDRATE LINEUP
  ------------------------- */
  useEffect(() => {
    const mapped: Slots = {};

    savedLineup.forEach((row) => {
      const player = players.find((p) => p.id === row.player_id);
      if (player) mapped[row.slot] = player;
    });

    setSlots(mapped);
  }, [savedLineup, players]);

  /* -------------------------
     LOAD STAFF LIST
  ------------------------- */
  useEffect(() => {
    async function loadStaff() {
      const res = await fetch("/api/admin/staff/list");
      const data: StaffListItem[] = await res.json();
      setStaffList(data);
    }

    loadStaff();
  }, []);

  /* -------------------------
     ASSIGN COACH
  ------------------------- */
  async function assignCoach() {
    if (!selectedStaffId) return;

    if (isDuplicate(selectedStaffId, selectedRole)) {
      setMessage("Coach already has this role");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/admin/teams/assign-staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_id: team.id,
          staff_id: selectedStaffId,
          role: selectedRole,
        }),
      });

      if (!res.ok) {
        setMessage("Failed to assign ❌");
        return;
      }

      const selected = staffList.find(
        (s) => s.id === selectedStaffId
      );

      if (!selected) return;

      setTeamStaff((prev) => [
        ...prev,
        {
          staff_id: selected.id,
          first_name: selected.first_name,
          last_name: selected.last_name,
          role: selectedRole,
        },
      ]);

      setSelectedStaffId("");
      setMessage("Coach assigned ✅");

    } catch {
      setMessage("Error assigning coach ❌");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 2500);
    }
  }

  /* -------------------------
     REMOVE COACH
  ------------------------- */
  async function removeCoach(staff_id: string) {
    await fetch("/api/admin/teams/remove-staff", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        team_id: team.id,
        staff_id,
      }),
    });

    setTeamStaff((prev) =>
      prev.filter((s) => s.staff_id !== staff_id)
    );
  }

  /* -------------------------
     PLAYER ASSIGN
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

  const subs = players.filter((p) => !assignedIds.includes(p.id));

  /* -------------------------
     SAVE LINEUP
  ------------------------- */
  async function saveLineup() {
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

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="space-y-6">

      {/* COACHING */}
      <div className="border p-4 rounded-xl space-y-3">

        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold">Coaching Staff</h2>

          <div className="flex gap-2">
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="border p-2"
            >
              <option value="">Select coach</option>

              {staffList.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name}
                </option>
              ))}
            </select>

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="border p-2"
            >
              <option>Head Coach</option>
              <option>Assistant</option>
              <option>Coach</option>
            </select>

            <button
              onClick={assignCoach}
              disabled={
                loading ||
                !selectedStaffId ||
                isDuplicate(selectedStaffId, selectedRole)
              }
              className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
            >
              {loading ? "..." : "Assign"}
            </button>
          </div>
        </div>

        {message && (
          <div className="text-sm text-gray-600">{message}</div>
        )}

        {teamStaff.length > 0 ? (
          teamStaff.map((s) => (
            <div key={s.staff_id + s.role} className="flex justify-between">
              <span>
                {s.first_name} {s.last_name}
              </span>

              <div className="flex gap-3">
                <span className="text-xs text-gray-500">
                  {s.role}
                </span>

                <button
                  onClick={() => removeCoach(s.staff_id)}
                  className="text-red-500 text-xs"
                >
                  remove
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">
            No coaches assigned
          </p>
        )}
      </div>

      {/* LINEUP */}
      <h2 className="text-xl font-semibold">
        Lineup ({team.format})
      </h2>

      {selectedPlayer && (
        <div className="p-2 bg-blue-100 text-sm rounded">
          Selected: {selectedPlayer.first_name}
        </div>
      )}

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
   SLOT COMPONENT (RESTORED)
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