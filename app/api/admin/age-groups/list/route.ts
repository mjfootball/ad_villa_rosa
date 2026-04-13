import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("age_groups")
    .select("id, name_es")
    .order("min_age");

  if (error) {
    return NextResponse.json(null, { status: 500 });
  }

  return NextResponse.json(data);
}