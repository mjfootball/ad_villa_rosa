"use client";

import { useEffect, useState } from "react";

type Player = {
  player: {
    id: string;
    first_name: string;
    last_name: string;
    player_team?: {
      team?: {
        id: string;
        display_name: string;
        billing_plans?: {
          amount: number;
          interval: string;
          active: boolean;
        }[];
      };
    }[];
    subscriptions?: {
      status: string;
      paid_at?: string;
      next_due_date?: string;
    }[];
  };
};

export default function Dashboard() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players/me")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handlePay(playerId: string) {
    const res = await fetch("/api/payments/create-checkout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        player_id: playerId,
      }),
    });

    if (!res.ok) {
      const err = await res.json();
      alert(err?.error || "Payment error");
      return;
    }

    const data = await res.json();

    if (data.url) {
      window.location.href = data.url;
    }
  }

  return (
    <div className="p-10 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Your Children</h1>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && players.length === 0 && (
        <p>No players assigned to your account</p>
      )}

      <div className="space-y-4">
        {players.map((p) => {
          const now = new Date();

          const activeSub = p.player.subscriptions?.find(
            (s) => s.status === "active"
          );

          const isOverdue =
            activeSub?.next_due_date &&
            new Date(activeSub.next_due_date) < now;

          const hasActive = !!activeSub && !isOverdue;

          const paidDate = activeSub?.paid_at
            ? new Date(activeSub.paid_at).toLocaleDateString()
            : null;

          const nextDue = activeSub?.next_due_date
            ? new Date(activeSub.next_due_date).toLocaleDateString()
            : null;

          const team = p.player.player_team?.[0]?.team;
          const plan = team?.billing_plans?.find((bp) => bp.active);

          const price = plan ? plan.amount / 100 : null;
          const interval = plan?.interval;

          return (
            <div
              key={p.player.id}
              className="border p-4 rounded space-y-2"
            >
              <div className="font-medium">
                {p.player.first_name} {p.player.last_name}
              </div>

              {team?.display_name && (
                <div className="text-sm text-gray-500">
                  {team.display_name}
                </div>
              )}

              {price && (
                <div className="text-sm text-gray-700">
                  €{price} / {interval}
                </div>
              )}

              {hasActive ? (
                <div className="text-green-600 text-sm font-medium">
                  ✅ Subscription Active
                </div>
              ) : isOverdue ? (
                <div className="text-orange-600 text-sm font-medium">
                  ⚠️ Payment Overdue
                </div>
              ) : (
                <div className="text-red-500 text-sm font-medium">
                  ❌ Not Paid
                </div>
              )}

              {hasActive && (
                <div className="text-sm text-gray-600 space-y-1">
                  {paidDate && <div>Paid: {paidDate}</div>}
                  {nextDue && <div>Next due: {nextDue}</div>}
                </div>
              )}

              {(!hasActive || isOverdue) && (
                <button
                  onClick={() => handlePay(p.player.id)}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  {price ? `Pay €${price}` : "Pay Subscription"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}