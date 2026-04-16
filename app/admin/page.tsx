"use client";

import { useEffect, useState } from "react";
import type { Metrics } from "@/types/finance";

/* 🔥 IMPORT YOUR CHART */
import { RevenueChart } from "@/components/charts/revenue";

/* -------------------------
   CARD VALUE TYPE
------------------------- */
type CardValue = string | number | null | undefined;

/* -------------------------
   FORMATTER
------------------------- */
function formatCurrency(value?: number | null) {
  if (!value) return "€0.00";

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "EUR",
  }).format(value / 100);
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);

  useEffect(() => {
    async function loadMetrics() {
      const res = await fetch("/api/admin/dashboard/metrics");
      const data: Metrics = await res.json();
      setMetrics(data);
    }

    loadMetrics();
  }, []);

  return (
    <div className="p-10 space-y-8 w-full">
      <h1 className="text-3xl font-semibold">Dashboard</h1>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card title="Players" value={metrics?.totalPlayers} />

        <Card title="Teams" value={metrics?.totalTeams} />

        <Card
          title="Monthly Revenue"
          value={formatCurrency(metrics?.monthlyRevenue)}
        />

        <Card
          title="Total Revenue"
          value={formatCurrency(metrics?.totalRevenue)}
        />

        <Card
          title="Outstanding"
          value={formatCurrency(metrics?.outstanding)}
        />

        <Card
          title="Overdue"
          value={metrics?.overdueCount}
          danger
        />
      </div>

      {/* 🔥 REVENUE CHART */}
      <div>
        <RevenueChart />
      </div>

      {/* FUTURE SECTION */}
      <div className="border rounded p-6 text-sm text-gray-500">
        More insights coming soon...
      </div>
    </div>
  );
}

/* -------------------------
   CARD COMPONENT
------------------------- */
function Card({
  title,
  value,
  danger,
}: {
  title: string;
  value: CardValue;
  danger?: boolean;
}) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500">{title}</div>

      <div
        className={`text-2xl font-semibold ${
          danger ? "text-red-600" : ""
        }`}
      >
        {value ?? "-"}
      </div>
    </div>
  );
}