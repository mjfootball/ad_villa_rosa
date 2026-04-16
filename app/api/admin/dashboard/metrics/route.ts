// /api/admin/dashboard/metrics/route.ts

import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = supabaseService();

  /* -------------------------
     PLAYERS COUNT
  ------------------------- */
  const { count: totalPlayers } = await supabase
    .from("players")
    .select("*", { count: "exact", head: true });

  /* -------------------------
     TEAMS COUNT
  ------------------------- */
  const { count: totalTeams } = await supabase
    .from("teams")
    .select("*", { count: "exact", head: true });

  /* -------------------------
     PAYMENTS (REAL REVENUE)
  ------------------------- */
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, created_at");

  let totalRevenue = 0;
  let monthlyRevenue = 0;

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  payments?.forEach((p) => {
    const amount = p.amount || 0;

    totalRevenue += amount;

    const date = new Date(p.created_at);

    if (
      date.getMonth() === currentMonth &&
      date.getFullYear() === currentYear
    ) {
      monthlyRevenue += amount;
    }
  });

  /* -------------------------
     CHARGES (OUTSTANDING + OVERDUE)
  ------------------------- */
  const { data: charges } = await supabase
    .from("charges")
    .select("amount, status");

  let outstanding = 0;
  let overdueCount = 0;

  charges?.forEach((c) => {
    if (c.status === "pending") {
      outstanding += c.amount || 0;
      overdueCount++;
    }
  });

  return NextResponse.json({
    totalPlayers: totalPlayers || 0,
    totalTeams: totalTeams || 0,
    totalRevenue,
    monthlyRevenue,
    overdueCount,
    outstanding,
  });
}