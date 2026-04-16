import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  console.log("📊 REVENUE API START");

  const supabase = supabaseService();

  try {
    /* -------------------------
       FETCH PAYMENTS
    ------------------------- */
    const { data, error } = await supabase
      .from("payments")
      .select("amount, created_at");

    if (error) {
      console.error("❌ SUPABASE ERROR:", error);
      return NextResponse.json([], { status: 500 });
    }

    console.log("💰 RAW PAYMENTS:", data?.length);
    console.log("💰 SAMPLE:", data?.slice(0, 3));

    if (!data || data.length === 0) {
      console.warn("⚠️ NO PAYMENTS FOUND");
      return NextResponse.json([]);
    }

    /* -------------------------
       GROUP BY MONTH
    ------------------------- */
    const monthlyMap = new Map<string, number>();

    data.forEach((p) => {
      if (!p.created_at || !p.amount) {
        console.warn("⚠️ INVALID ROW:", p);
        return;
      }

      const date = new Date(p.created_at);

      if (isNaN(date.getTime())) {
        console.warn("⚠️ INVALID DATE:", p.created_at);
        return;
      }

      const key = date.toLocaleString("en-GB", {
        month: "long",
      });

      const current = monthlyMap.get(key) || 0;
      monthlyMap.set(key, current + p.amount);
    });

    console.log("📦 MONTHLY MAP:", Object.fromEntries(monthlyMap));

    /* -------------------------
       FORMAT FOR CHART
    ------------------------- */
    const result = Array.from(monthlyMap.entries()).map(
      ([month, total]) => ({
        month,
        revenue: total / 100, // convert to €
      })
    );

    console.log("📈 FINAL CHART DATA:", result);

    return NextResponse.json(result);

  } catch (err) {
    console.error("❌ API CRASH:", err);
    return NextResponse.json([], { status: 500 });
  }
}