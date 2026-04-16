"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/lib/supabase/client";
import type { Metrics } from "@/types/finance";
import { RevenueChart } from "@/components/charts/revenue";

/* -------------------------
   TYPES
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
  const [clubSlug, setClubSlug] = useState<string | null>(null);

  /* -------------------------
     LOAD METRICS
  ------------------------- */
  useEffect(() => {
    async function loadMetrics() {
      const res = await fetch("/api/admin/dashboard/metrics");
      const data: Metrics = await res.json();
      setMetrics(data);
    }

    loadMetrics();
  }, []);

  /* -------------------------
     LOAD CLUB SLUG
  ------------------------- */
  useEffect(() => {
    async function loadClubSlug() {
      const supabase = supabaseBrowser();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      const { data: internalUser } = await supabase
        .from("users")
        .select("club_id")
        .eq("auth_user_id", user.id)
        .single();

      if (!internalUser?.club_id) return;

      const { data: club } = await supabase
        .from("clubs")
        .select("slug")
        .eq("id", internalUser.club_id)
        .single();

      if (club?.slug) {
        setClubSlug(club.slug);
      }
    }

    loadClubSlug();
  }, []);

  return (
    <div className="p-10 space-y-8 w-full">

      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold">Dashboard</h1>

        <Link
          href={clubSlug ? `/club/${clubSlug}` : "#"}
          target="_blank"
          className={`border px-4 py-2 rounded-md text-sm hover:bg-gray-100 transition ${
            !clubSlug ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          View Website
        </Link>
      </div>

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

      {/* REVENUE CHART */}
      <div>
        <RevenueChart />
      </div>

      {/* FUTURE */}
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