import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { requireRole } from "@/lib/auth/require-role";

export async function GET(req: Request) {
  console.log("📥 /api/admin/player-financials START");

  try {
    /* -------------------------
       AUTH
    ------------------------- */
    await requireRole(["admin"]);

    const supabase = supabaseService();

    const { searchParams } = new URL(req.url);
    const playerId = searchParams.get("player_id");

    if (!playerId) {
      return NextResponse.json(
        { error: "Missing player_id" },
        { status: 400 }
      );
    }

    console.log("🆔 PLAYER:", playerId);

    /* -------------------------
       CHARGES
    ------------------------- */
    const { data: charges, error: chargeError } = await supabase
      .from("charges")
      .select("id, amount, month, status")
      .eq("player_id", playerId)
      .order("month", { ascending: true });

    if (chargeError) {
      console.error("❌ Charge error:", chargeError);
      return NextResponse.json(
        { error: "Failed charges" },
        { status: 500 }
      );
    }

    /* -------------------------
       PAYMENTS
    ------------------------- */
    const { data: payments, error: paymentError } = await supabase
      .from("payments")
      .select("id, amount, created_at")
      .eq("player_id", playerId)
      .order("created_at", { ascending: true })
    

    if (paymentError) {
      console.error("❌ Payment error:", paymentError);
      return NextResponse.json(
        { error: "Failed payments" },
        { status: 500 }
      );
    }

    console.log("💳 Charges:", charges?.length);
    console.log("💰 Payments:", payments?.length);

    return NextResponse.json({
      charges: charges || [],
      payments: payments || [],
    });

  } catch (err) {
    console.error("❌ API FAILED:", err);

    return NextResponse.json(
      { error: "Unauthorised" },
      { status: 401 }
    );
  }
}