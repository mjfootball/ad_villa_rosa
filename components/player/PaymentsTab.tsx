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
type Charge = {
  id: string;
  amount: number;
  month: string;
};

type Payment = {
  id: string;
  amount: number;
  created_at: string;
};

type FinancialsResponse = {
  charges: Charge[];
  payments: Payment[];
};

type Props = {
  player: {
    id: string;
  };
};

/* -------------------------
   HELPERS
------------------------- */
function formatDate(date?: string | null) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/* -------------------------
   FIFO ALLOCATION (WITH PARTIALS)
------------------------- */
function allocatePayments(charges: Charge[], payments: Payment[]) {
  const remainingPayments = payments.map((p) => ({
    ...p,
    remaining: p.amount,
  }));

  return charges.map((charge) => {
    let remainingCharge = charge.amount;
    let paidAmount = 0;
    let paidAt: string | null = null;

    for (const payment of remainingPayments) {
      if (payment.remaining <= 0) continue;

      const allocation = Math.min(remainingCharge, payment.remaining);

      payment.remaining -= allocation;
      remainingCharge -= allocation;
      paidAmount += allocation;

      if (allocation > 0) {
        paidAt = payment.created_at;
      }

      if (remainingCharge === 0) break;
    }

    let status: "paid" | "partial" | "pending" = "pending";

    if (paidAmount === charge.amount) status = "paid";
    else if (paidAmount > 0) status = "partial";

    return {
      ...charge,
      paid_amount: paidAmount,
      remaining_amount: remainingCharge,
      paid_at: paidAt,
      status,
    };
  });
}

/* -------------------------
   COMPONENT
------------------------- */
export default function PaymentsTab({ player }: Props) {
  const [charges, setCharges] = useState<Charge[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(
          `/api/admin/player-financials?player_id=${player.id}`
        );

        if (!res.ok) {
          throw new Error("Failed to fetch financials");
        }

        const data: FinancialsResponse = await res.json();

        setCharges(data.charges || []);
        setPayments(data.payments || []);
      } catch (err) {
        console.error("❌ PaymentsTab fetch error", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [player.id]);

  if (loading) {
    return <div className="p-4 text-sm">Loading...</div>;
  }

  if (!charges.length) {
    return (
      <div className="border p-6 text-sm text-gray-500">
        No payments found
      </div>
    );
  }

  const allocated = allocatePayments(charges, payments);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Month</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Paid</TableHead>
          <TableHead>Remaining</TableHead>
          <TableHead>Paid On</TableHead>
          <TableHead className="text-right">Total</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {allocated.map((charge) => {
          const isOverdue =
            charge.status !== "paid" &&
            new Date(charge.month) < new Date();

          return (
            <TableRow key={charge.id}>
              <TableCell>{formatDate(charge.month)}</TableCell>

              <TableCell
                className={
                  charge.status === "paid"
                    ? "text-green-600"
                    : charge.status === "partial"
                    ? "text-orange-600"
                    : isOverdue
                    ? "text-red-600"
                    : "text-gray-500"
                }
              >
                {charge.status === "paid"
                  ? "Paid"
                  : charge.status === "partial"
                  ? "Partially Paid"
                  : isOverdue
                  ? "Overdue"
                  : "Pending"}
              </TableCell>

              <TableCell>
                €{(charge.paid_amount / 100).toFixed(2)}
              </TableCell>

              <TableCell>
                €{(charge.remaining_amount / 100).toFixed(2)}
              </TableCell>

              <TableCell>
                {charge.paid_at ? formatDate(charge.paid_at) : "—"}
              </TableCell>

              <TableCell className="text-right">
                €{(charge.amount / 100).toFixed(2)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}