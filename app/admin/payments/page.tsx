"use client";

import { useEffect, useState } from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* -------------------------
   TYPES
------------------------- */
type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  team_name: string | null;

  amount: number | null;
  last_paid: string | null;
  next_due_date: string | null;
};

/* -------------------------
   HELPERS
------------------------- */
function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

/* -------------------------
   COMPONENT
------------------------- */
export default function AdminPayments() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => {
        // ✅ ONLY SHOW PLAYERS WITH SUBSCRIPTION
        const filtered = data.filter(
          (p: PlayerRow) => p.next_due_date !== null
        );

        setPlayers(filtered);
        setLoading(false);
      });
  }, []);

  const now = new Date();

  async function sendPaymentRequest(playerId: string) {
    try {
      setSendingId(playerId);

      const res = await fetch("/api/admin/payments/send-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          player_id: playerId,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed");
      }

      alert("Payment request sent ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to send request ❌");
    } finally {
      setSendingId(null);
    }
  }

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 space-y-6">

      <h1 className="text-2xl font-semibold">
        Payments Dashboard
      </h1>

      <Table>

        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Team</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Paid</TableHead>
            <TableHead>Next Due</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {players.map((p) => {
            const isOverdue =
              p.next_due_date &&
              new Date(p.next_due_date) < now;

            const isActive =
              p.next_due_date &&
              new Date(p.next_due_date) >= now;

            return (
              <TableRow key={p.id}>

                {/* PLAYER */}
                <TableCell className="font-medium">
                  {p.first_name} {p.last_name}
                </TableCell>

                {/* TEAM */}
                <TableCell>
                  {p.team_name || "—"}
                </TableCell>

                {/* STATUS */}
                <TableCell
                  className={
                    isActive
                      ? "text-green-600"
                      : isOverdue
                      ? "text-red-600"
                      : "text-gray-500"
                  }
                >
                  {isActive
                    ? "Paid"
                    : isOverdue
                    ? "Overdue"
                    : "Unknown"}
                </TableCell>

                {/* LAST PAID */}
                <TableCell>
                  {formatDate(p.last_paid)}
                </TableCell>

                {/* NEXT DUE */}
                <TableCell>
                  {formatDate(p.next_due_date)}
                </TableCell>

                {/* AMOUNT */}
                <TableCell className="text-right">
                  {p.amount
                    ? `€${(p.amount / 100).toFixed(2)}`
                    : "—"}
                </TableCell>

                {/* ACTION (🔥 UPDATED) */}
                <TableCell className="text-right">
                  <button
                    onClick={() => sendPaymentRequest(p.id)}
                    disabled={sendingId === p.id}
                    className="bg-black text-white px-3 py-1 rounded text-sm disabled:opacity-50"
                  >
                    {sendingId === p.id
                      ? "Sending..."
                      : "Send Request"}
                  </button>
                </TableCell>

              </TableRow>
            );
          })}
        </TableBody>

      </Table>
    </div>
  );
}