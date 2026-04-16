"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

/* -------------------------
   TYPES
------------------------- */
type RevenueRow = {
  month: string;
  revenue: number;
};

/* -------------------------
   CHART CONFIG
------------------------- */
const chartConfig = {
  revenue: {
    label: "Revenue (€)",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

/* -------------------------
   COMPONENT
------------------------- */
export function RevenueChart() {
  const [data, setData] = useState<RevenueRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/dashboard/revenue");
        const json: RevenueRow[] = await res.json();

        console.log("📊 CHART DATA:", json); // 🔥 DEBUG

        setData(json || []);
      } catch (err) {
        console.error("❌ Failed to load revenue", err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  /* -------------------------
     STATES
  ------------------------- */
  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Loading chart...
        </CardContent>
      </Card>
    );
  }

  if (!data.length) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          No revenue data yet
        </CardContent>
      </Card>
    );
  }

  /* -------------------------
     RENDER
  ------------------------- */
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue</CardTitle>
      </CardHeader>

      <CardContent>
        {/* ✅ IMPORTANT: container controls size */}
        <ChartContainer
          config={chartConfig}
          className="h-[320px] w-full"
        >
          <BarChart data={data}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              tickFormatter={(value) => value.slice(0, 3)}
            />

            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent />}
            />

            {/* ✅ CRITICAL FIX */}
            <Bar
              dataKey="revenue"
              fill="var(--color-revenue)"
              radius={8}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex items-center gap-2 text-sm text-muted-foreground">
        <TrendingUp className="h-4 w-4" />
        Based on completed payments
      </CardFooter>
    </Card>
  );
}