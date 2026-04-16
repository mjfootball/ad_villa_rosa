import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

/* -------------------------
   GET SETTINGS
------------------------- */
export async function GET() {
  try {
    const supabase = supabaseService();

    const { data, error } = await supabase
      .from("club_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}

/* -------------------------
   UPDATE SETTINGS
------------------------- */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = supabaseService();

    const { error } = await supabase
      .from("club_settings")
      .upsert({
        id: 1,
        ...body, // 👈 flexible for future fields
      });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}