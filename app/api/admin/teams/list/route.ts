import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("teams")
    .select("id, display_name")
    .order("display_name");

  if (error) {
    return NextResponse.json(null, { status: 500 });
  }

  return NextResponse.json(data);
}