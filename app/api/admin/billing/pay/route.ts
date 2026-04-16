import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const { player_id, amount, method } = await req.json();

    /* -------------------------
       VALIDATION
    ------------------------- */
    if (!player_id || !amount) {
      return NextResponse.json(
        { error: "Missing player_id or amount" },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    console.log("💰 MANUAL PAYMENT:", player_id, amount);

    /* -------------------------
       1. INSERT PAYMENT
    ------------------------- */
    const { error: paymentError } = await supabase
      .from("payments")
      .insert({
        player_id,
        amount,
        method: method || "manual",
      });

    if (paymentError) {
      console.error("❌ Payment insert failed", paymentError);
      return NextResponse.json(null, { status: 500 });
    }

    /* -------------------------
       2. GET UNPAID CHARGES
    ------------------------- */
    const { data: charges, error: chargeError } = await supabase
      .from("charges")
      .select("id, amount")
      .eq("player_id", player_id)
      .eq("status", "pending")
      .order("month", { ascending: true });

    if (chargeError) {
      console.error("❌ Charge fetch failed", chargeError);
      return NextResponse.json(null, { status: 500 });
    }

    if (!charges || charges.length === 0) {
      console.log("ℹ️ No outstanding charges");
      return NextResponse.json({ success: true });
    }

    /* -------------------------
       3. APPLY PAYMENT
    ------------------------- */
    let remaining = amount;

    for (const charge of charges) {
      if (remaining <= 0) break;

      if (remaining >= charge.amount) {
        // ✅ fully pay charge
        const { error: updateError } = await supabase
          .from("charges")
          .update({ status: "paid" })
          .eq("id", charge.id);

        if (updateError) {
          console.error("❌ Charge update failed", updateError);
          continue;
        }

        remaining -= charge.amount;
      } else {
        // ⚠️ partial payment (not handled yet)
        console.warn(
          "⚠️ Partial payment detected - not applied to charge",
          { remaining, charge: charge.id }
        );
        break;
      }
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ Payment route error:", err);
    return NextResponse.json(null, { status: 500 });
  }
}