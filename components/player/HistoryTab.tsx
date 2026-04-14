"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHeader,
  TableHead,
} from "@/components/ui/table";

/* ✅ SHARED TYPES */
import type { Player, PlayerHistory } from "@/types/player";

type Props = {
  player: Player;
  onUpdate: () => void;
};

export default function HistoryTab({ player, onUpdate }: Props) {
  const [editing, setEditing] = useState<PlayerHistory | null>(null);

  const [season, setSeason] = useState("");
  const [position, setPosition] = useState("");
  const [notes, setNotes] = useState("");

  /* -------------------------
     UPDATE HISTORY
  ------------------------- */
  async function updateHistory() {
    if (!editing) return;

    await fetch("/api/admin/player-history/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: editing.id,
        season,
        position,
        notes,
      }),
    });

    alert("Updated ✅");
    onUpdate(); // ✅ FIXED
    setEditing(null);
  }

  /* -------------------------
     DELETE HISTORY
  ------------------------- */
  async function deleteHistory(id: string) {
    if (!confirm("Delete?")) return;

    await fetch("/api/admin/player-history/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });

    alert("Deleted ✅");
    onUpdate(); // ✅ FIXED
  }

  /* -------------------------
     HELPER LABELS
  ------------------------- */
  function getEventLabel(event?: string | null) {
    switch (event) {
      case "created":
        return "Player Created";
      case "assigned":
        return "Assigned to Team";
      case "transferred":
        return "Transferred";
      default:
        return event || "-";
    }
  }

  return (
    <div className="space-y-4">

      {/* EDIT PANEL */}
      {editing && (
        <div className="border p-4 space-y-2">
          <Input
            placeholder="Season"
            value={season}
            onChange={(e) => setSeason(e.target.value)}
          />
          <Input
            placeholder="Position"
            value={position}
            onChange={(e) => setPosition(e.target.value)}
          />
          <Input
            placeholder="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="space-x-2">
            <button
              onClick={updateHistory}
              className="bg-black text-white px-4 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={() => setEditing(null)}
              className="border px-4 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Season</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>From</TableHead>
            <TableHead>To</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {player.player_history && player.player_history.length > 0 ? (
            player.player_history.map((h) => (
              <TableRow key={h.id}>

                <TableCell className="font-medium">
                  {getEventLabel(h.event_type)}
                </TableCell>

                <TableCell>{h.season}</TableCell>

                <TableCell>
                  {h.team?.display_name || "—"}
                </TableCell>

                <TableCell>
                  {h.from_date
                    ? new Date(h.from_date).toLocaleDateString()
                    : "—"}
                </TableCell>

                <TableCell>
                  {h.to_date
                    ? new Date(h.to_date).toLocaleDateString()
                    : "Current"}
                </TableCell>

                <TableCell className="space-x-2">
                  <button
                    onClick={() => {
                      setEditing(h);
                      setSeason(h.season);
                      setPosition(h.position || "");
                      setNotes(h.notes || "");
                    }}
                    className="text-blue-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => deleteHistory(h.id)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </TableCell>

              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-gray-500">
                No history yet
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

    </div>
  );
}