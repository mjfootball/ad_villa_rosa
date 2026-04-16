"use client";

import { useEffect, useState } from "react";
import type { Player } from "@/types/player";

import Link from "next/link";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { Button } from "@/components/ui/button";

/* -------------------------
   EXTENDED TYPE
------------------------- */
type PlayerWithBilling = Player & {
  balance?: number;
  last_payment_date?: string | null;
  total_paid_season?: number;
  next_payment_date?: string | null;
  next_billing_date?: string | null;
  months_overdue?: number;
};

/* -------------------------
   DATE FORMATTER
------------------------- */
function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [players, setPlayers] = useState<PlayerWithBilling[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/players/me")
      .then((res) => res.json())
      .then((data) => {
        setPlayers(Array.isArray(data) ? data : []);
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
      body: JSON.stringify({ player_id: playerId }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.error || "Payment error");
      return;
    }

    if (data.url) window.location.assign(data.url);
  }

  /* -------------------------
     GLOBAL STATE
  ------------------------- */
  const overduePlayers = players.filter(
    (p) => (p.months_overdue ?? 0) > 0
  );

  return (
    <div className="p-10 space-y-8">
      <h1 className="text-2xl font-semibold">Parent Dashboard</h1>

      {/* -------------------------
         GLOBAL ALERT
      ------------------------- */}
      {!loading && (
        overduePlayers.length > 0 ? (
          <Alert variant="destructive">
            <AlertTitle>Payment required</AlertTitle>
            <AlertDescription>
              {overduePlayers.length} child
              {overduePlayers.length > 1 ? "ren have" : " has"} overdue payments.
              Please review below.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <AlertTitle>All up to date</AlertTitle>
            <AlertDescription>
              No outstanding payments.
            </AlertDescription>
          </Alert>
        )
      )}

      {/* -------------------------
         PLAYERS
      ------------------------- */}
      {loading && <p>Loading...</p>}

      <div className="grid md:grid-cols-2 gap-6">
        {players.map((p) => {
          const balance = p.balance ?? 0;
          const overdue = p.months_overdue ?? 0;

          return (
            <div
              key={p.id}
              className="border rounded-lg p-5 space-y-4 bg-white"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div className="text-lg font-medium">
                  {p.first_name} {p.last_name}
                </div>

                {overdue > 0 ? (
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                    {overdue} overdue
                  </span>
                ) : (
                  <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                    Up to date
                  </span>
                )}
              </div>

              {/* FINANCIAL SUMMARY */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Outstanding</span>
                  <span className="font-medium text-red-500">
                    €{(balance / 100).toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Paid this season</span>
                  <span>
                    €{((p.total_paid_season ?? 0) / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* DATES */}
              <div className="text-xs text-gray-500 space-y-1">
                <div>
                  Last payment: {formatDate(p.last_payment_date)}
                </div>
                <div>
                  Next due: {formatDate(p.next_payment_date)}
                </div>
                <div>
                  Next billing: {formatDate(p.next_billing_date)}
                </div>
              </div>

              {/* ACTION */}
              {balance > 0 && (
                <Button
                  onClick={() => handlePay(p.id)}
                  className="w-full"
                >
                  Pay €{(balance / 100).toFixed(2)}
                </Button>
              )}
            </div>
          );
        })}
      </div>

      {/* -------------------------
         NAVIGATION
      ------------------------- */}
      <div>
        <Link href="/payments">
          <Button variant="outline">
            View full payment history
          </Button>
        </Link>
      </div>
    </div>
  );
}