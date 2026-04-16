"use client";

import { PaymentsTable } from "../payments-table";

export default function PaymentsPage() {
  return (
    <div className="p-10 space-y-6">
      <h1 className="text-2xl font-semibold">Payment History</h1>

      <PaymentsTable />
    </div>
  );
}