import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { supabaseService } from "@/lib/supabase/service";

/* -------------------------
   TYPES
------------------------- */
type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
};

type Charge = {
  amount: number;
  month: string;
  status: string;
};

type Payment = {
  amount: number;
  created_at: string;
};

/* -------------------------
   SEASON HELPER
------------------------- */
function getSeasonDates() {
  const now = new Date();
  const year = now.getFullYear();

  const seasonStart =
    now.getMonth() >= 7
      ? new Date(year, 7, 1)
      : new Date(year - 1, 7, 1);

  const seasonEnd = new Date(seasonStart);
  seasonEnd.setFullYear(seasonStart.getFullYear() + 1);
  seasonEnd.setDate(0);

  return { seasonStart, seasonEnd };
}

/* -------------------------
   ROUTE
------------------------- */
export async function GET() {
  try {
    console.log("📥 /api/players/me START");

    /* -------------------------
       AUTH
    ------------------------- */
    const { user, internalUser } = await requireRole(["parent"]);
    const email = user.email!.toLowerCase();

    console.log("👤 User:", email, "Internal:", internalUser.id);

    const supabase = supabaseService();

    /* -------------------------
       AUTO LINK PLAYERS
    ------------------------- */
    const { data: playersToLink } = await supabase
      .from("players")
      .select("id")
      .ilike("parent_email", email);

    console.log("📌 Players to link:", playersToLink);

    if (playersToLink?.length) {
      for (const p of playersToLink) {
        const { data: existing } = await supabase
          .from("parent_player")
          .select("id")
          .eq("parent_id", internalUser.id)
          .eq("player_id", p.id)
          .maybeSingle();

        if (!existing) {
          console.log("➕ Linking player:", p.id);

          await supabase.from("parent_player").insert({
            parent_id: internalUser.id,
            player_id: p.id,
          });
        }
      }
    }

    /* -------------------------
       GET PLAYERS
    ------------------------- */
    const { data: links, error } = await supabase
      .from("parent_player")
      .select(`
        player:players (
          id,
          first_name,
          last_name
        )
      `)
      .eq("parent_id", internalUser.id);

    if (error) {
      console.error("❌ Player fetch error:", error);
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    console.log("📦 Raw player links:", links);

    /* -------------------------
   NORMALISE PLAYER SHAPE
------------------------- */
const players: PlayerRow[] =
  links
    ?.map((l) => {
      const raw = l.player;

      // 🔥 Handle BOTH cases
      const player = Array.isArray(raw) ? raw[0] : raw;

      return player;
    })
    .filter(
      (p): p is PlayerRow =>
        !!p &&
        typeof p.id === "string" &&
        typeof p.first_name === "string" &&
        typeof p.last_name === "string"
    ) || [];

console.log("✅ Clean players:", players);

    const { seasonStart, seasonEnd } = getSeasonDates();

    /* -------------------------
       BUILD RESULTS
    ------------------------- */
    const results = [];

    for (const player of players) {
      console.log("🔍 Processing player:", player.id);

      /* -------------------------
         CHARGES
      ------------------------- */
      const { data: chargesData } = await supabase
        .from("charges")
        .select("amount, month, status")
        .eq("player_id", player.id);

      const charges: Charge[] = chargesData || [];
      console.log("💳 Charges:", charges);

      /* -------------------------
         PAYMENTS
      ------------------------- */
      const { data: paymentsData } = await supabase
        .from("payments")
        .select("amount, created_at")
        .eq("player_id", player.id)
        .order("created_at", { ascending: false });

      const payments: Payment[] = paymentsData || [];
      console.log("💰 Payments:", payments);

      /* -------------------------
         TOTALS
      ------------------------- */
      const totalCharges = charges.reduce((sum, c) => sum + c.amount, 0);
      const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);

      const balance = totalCharges - totalPayments;

      /* -------------------------
         LAST PAYMENT
      ------------------------- */
      const lastPaymentDate = payments[0]?.created_at || null;

      /* -------------------------
         TOTAL PAID THIS SEASON
      ------------------------- */
      const totalPaidSeason = payments
        .filter((p) => {
          const d = new Date(p.created_at);
          return d >= seasonStart && d <= seasonEnd;
        })
        .reduce((sum, p) => sum + p.amount, 0);

      /* -------------------------
         OVERDUE + NEXT DATES
      ------------------------- */
      const pendingCharges = charges
        .filter((c) => c.status === "pending")
        .sort(
          (a, b) =>
            new Date(a.month).getTime() -
            new Date(b.month).getTime()
        );

      const now = new Date();

      const overdueCharges = pendingCharges.filter(
        (c) => new Date(c.month) < now
      );

      const monthsOverdue = overdueCharges.length;

      const nextPaymentDate = pendingCharges[0]?.month || null;

      const nextBillingDate = nextPaymentDate
        ? new Date(
            new Date(nextPaymentDate).getFullYear(),
            new Date(nextPaymentDate).getMonth() + 1,
            1
          ).toISOString()
        : null;

      const result = {
        ...player,
        balance,
        last_payment_date: lastPaymentDate,
        total_paid_season: totalPaidSeason,
        next_payment_date: nextPaymentDate,
        next_billing_date: nextBillingDate,
        months_overdue: monthsOverdue,
      };

      console.log("📊 Player result:", result);

      results.push(result);
    }

    console.log("✅ FINAL RESPONSE:", results);

    return NextResponse.json(results);

  } catch (err: unknown) {
    console.error("❌ API ERROR:", err);

    if (err instanceof Error && err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
}