import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { requireRole } from "@/lib/auth/require-role";

/* -------------------------
   TYPES (RAW FROM DB)
------------------------- */
type PaymentRowRaw = {
  id: string;
  amount: number;
  created_at: string;
  player:
    | {
        first_name: string | null;
        last_name: string | null;
      }
    | {
        first_name: string | null;
        last_name: string | null;
      }[];
};

export async function GET() {
  console.log("📥 /api/payments/me START");

  try {
    /* -------------------------
       AUTH
    ------------------------- */
    await requireRole(["parent"]);
    console.log("✅ Auth success");

    const supabase = supabaseService();

    /* -------------------------
       FETCH PAYMENTS
    ------------------------- */
    console.log("📊 Fetching payments...");

    const { data, error } = await supabase
      .from("payments")
      .select(`
        id,
        amount,
        created_at,
        player:players(first_name,last_name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Payment fetch error:", error);
      return NextResponse.json([], { status: 500 });
    }

    console.log("📦 Raw payments:", data);

    /* -------------------------
       NORMALISE + FORMAT
    ------------------------- */
    const formatted =
      (data as PaymentRowRaw[] | null)?.map((p) => {
        const raw = p.player;

        // 🔥 FIX: handle both object + array
        const player = Array.isArray(raw) ? raw[0] : raw;

        return {
          id: p.id,
          amount: p.amount,
          created_at: p.created_at,
          player_name: `${player?.first_name ?? ""} ${player?.last_name ?? ""}`,
        };
      }) || [];

    console.log("✅ Formatted payments:", formatted);

    return NextResponse.json(formatted);

  } catch (err) {
    console.error("❌ /api/payments/me FAILED:", err);
    return NextResponse.json([], { status: 500 });
  }
}