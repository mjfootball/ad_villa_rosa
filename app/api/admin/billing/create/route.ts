import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { team_id, amount, interval } = body;

    const supabase = supabaseService();

    // deactivate old plans
    await supabase
      .from("billing_plans")
      .update({ active: false })
      .eq("team_id", team_id);

    // create new plan
    const { error } = await supabase.from("billing_plans").insert({
      team_id,
      amount,
      interval,
      active: true,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}