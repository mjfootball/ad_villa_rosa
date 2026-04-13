"use client";

import { useEffect, useState } from "react";

type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  team_name: string;
  next_due_date: string | null;
};

export default function AdminPayments() {
  const [players, setPlayers] = useState<PlayerRow[]>([]);

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then(setPlayers);
  }, []);

  const now = new Date();

  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Payments</h1>

      <div className="space-y-3">
        {players.map((p) => {
          const isOverdue =
            p.next_due_date &&
            new Date(p.next_due_date) < now;

          return (
            <div
              key={p.id}
              className="border p-4 rounded flex justify-between"
            >
              <div>
                <div className="font-medium">
                  {p.first_name} {p.last_name}
                </div>
                <div className="text-sm text-gray-500">
                  {p.team_name}
                </div>
              </div>

              <div>
                {isOverdue ? (
                  <span className="text-red-600">
                    Overdue
                  </span>
                ) : (
                  <span className="text-green-600">
                    OK
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}