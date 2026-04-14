"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

export default function PaymentsTab({ player }) {
  if (!player.subscriptions?.length) {
    return (
      <div className="border p-6 text-sm text-gray-500">
        No payments found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Last Paid</TableHead>
          <TableHead>Next Due</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody>
        {player.subscriptions.map((sub, index) => {
          const isActive = sub.status === "active";

          const isOverdue =
            sub.status !== "active" &&
            sub.next_due_date &&
            new Date(sub.next_due_date) < new Date();

          return (
            <TableRow key={sub.id}>
              <TableCell>INV-{index + 1}</TableCell>

              <TableCell className={
                isActive ? "text-green-600"
                : isOverdue ? "text-red-600"
                : "text-gray-500"
              }>
                {isActive ? "Active" : isOverdue ? "Overdue" : "Unpaid"}
              </TableCell>

              <TableCell>{formatDate(sub.paid_at)}</TableCell>
              <TableCell>{formatDate(sub.next_due_date)}</TableCell>

              <TableCell className="text-right">
                €{(sub.amount / 100).toFixed(2)}
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}