"use client";

import { useEffect, useState, useMemo } from "react";

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
  return new Date(date).toLocaleDateString("en-GB");
}

/* -------------------------
   COMPONENT
------------------------- */
export default function AdminPayments() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "overdue" | "paid">("all");

  const now = new Date();

  /* -------------------------
     FETCH
  ------------------------- */
  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data || []);
        setLoading(false);
      });
  }, []);

  /* -------------------------
     DERIVED DATA
  ------------------------- */
  const enriched = useMemo(() => {
    return players.map((p) => {
      const isOverdue =
        p.next_due_date &&
        new Date(p.next_due_date) < now;

      const isPaid =
        p.next_due_date &&
        new Date(p.next_due_date) >= now;

      return {
        ...p,
        isOverdue,
        isPaid,
      };
    });
  }, [players]);

  const filtered = useMemo(() => {
    if (filter === "overdue") {
      return enriched.filter((p) => p.isOverdue);
    }
    if (filter === "paid") {
      return enriched.filter((p) => p.isPaid);
    }
    return enriched;
  }, [enriched, filter]);

  /* -------------------------
     KPIs
  ------------------------- */
  const totalOutstanding = enriched.reduce(
    (sum, p) => sum + (p.isOverdue ? p.amount || 0 : 0),
    0
  );

  const overdueCount = enriched.filter((p) => p.isOverdue).length;

  const totalActive = enriched.length;

  /* -------------------------
     ACTION
  ------------------------- */
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

      if (!res.ok) throw new Error();

    } catch (err) {
      console.error(err);
    } finally {
      setSendingId(null);
    }
  }

  /* -------------------------
     RENDER
  ------------------------- */
  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-10 space-y-8">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">
          Payments Dashboard
        </h1>
        <p className="text-sm text-gray-500">
          Monitor payments, outstanding balances, and send reminders
        </p>
      </div>

      {/* KPI CARDS */}
      <div className="grid md:grid-cols-3 gap-4">

        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Outstanding</div>
          <div className="text-xl font-semibold text-red-600">
            €{(totalOutstanding / 100).toFixed(2)}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Overdue Players</div>
          <div className="text-xl font-semibold">
            {overdueCount}
          </div>
        </div>

        <div className="border p-4 rounded">
          <div className="text-sm text-gray-500">Active Players</div>
          <div className="text-xl font-semibold">
            {totalActive}
          </div>
        </div>

      </div>

      {/* FILTERS */}
      <div className="flex gap-2">
        {["all", "overdue", "paid"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-3 py-1 rounded text-sm border ${
              filter === f ? "bg-black text-white" : ""
            }`}
          >
            {f.toUpperCase()}
          </button>
        ))}
      </div>

      {/* TABLE */}
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
          {filtered.map((p) => (
            <TableRow key={p.id}>

              <TableCell className="font-medium">
                {p.first_name} {p.last_name}
              </TableCell>

              <TableCell>{p.team_name || "—"}</TableCell>

              <TableCell
                className={
                  p.isPaid
                    ? "text-green-600"
                    : p.isOverdue
                    ? "text-red-600"
                    : "text-gray-500"
                }
              >
                {p.isPaid
                  ? "Paid"
                  : p.isOverdue
                  ? "Overdue"
                  : "Pending"}
              </TableCell>

              <TableCell>{formatDate(p.last_paid)}</TableCell>

              <TableCell>{formatDate(p.next_due_date)}</TableCell>

              <TableCell className="text-right">
                {p.amount
                  ? `€${(p.amount / 100).toFixed(2)}`
                  : "—"}
              </TableCell>

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
          ))}
        </TableBody>
      </Table>
    </div>
  );
}