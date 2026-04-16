import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

/* -------------------------
   HELPERS
------------------------- */
function getMonthStart(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function toISODate(date: Date) {
  return date.toISOString().split("T")[0];
}

/* -------------------------
   ROUTE
------------------------- */
export async function POST() {
  try {
    const supabase = supabaseService();

    const monthDate = getMonthStart();
    const monthISO = toISODate(monthDate);

    console.log("🔥 GENERATING CHARGES FOR:", monthISO);

    /* -------------------------
       GET CLUB SETTINGS
    ------------------------- */
    const { data: settings, error: settingsError } = await supabase
      .from("club_settings")
      .select("monthly_price")
      .eq("id", 1)
      .single();

    if (settingsError) throw settingsError;

    const price = settings?.monthly_price ?? 5000; // fallback €50

    /* -------------------------
       GET PLAYERS
    ------------------------- */
    const { data: players, error } = await supabase
      .from("players")
      .select("id, joined_at, left_at");

    if (error) throw error;

    /* -------------------------
       LOOP PLAYERS
    ------------------------- */
    for (const player of players || []) {
      const joinedAt = player.joined_at
        ? new Date(player.joined_at)
        : null;

      const leftAt = player.left_at
        ? new Date(player.left_at)
        : null;

      // ❌ Skip if left BEFORE this month
      if (leftAt && leftAt < monthDate) continue;

      // ❌ Skip if joined AFTER this month
      if (joinedAt && joinedAt > monthDate) continue;

      /* -------------------------
         CREATE CHARGE
      ------------------------- */
      const { error: upsertError } = await supabase
        .from("charges")
        .upsert(
          {
            player_id: player.id,
            amount: price, // ✅ GLOBAL PRICE
            month: monthISO,
          },
          {
            onConflict: "player_id,month",
          }
        );

      if (upsertError) {
        console.error("❌ Charge upsert failed", upsertError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("❌ Charge generation error:", err);
    return NextResponse.json(null, { status: 500 });
  }
}