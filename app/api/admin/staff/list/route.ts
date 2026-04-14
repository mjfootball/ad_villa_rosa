import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  console.log("🔥 FETCH STAFF START");

  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("staff")
    .select(`
      id,
      first_name,
      last_name,
      email,
      system_role
    `)
    .order("first_name");

  if (error) {
    console.error("❌ STAFF FETCH ERROR:", error);
    return NextResponse.json([], { status: 500 });
  }

  console.log("👥 STAFF:", data);

  return NextResponse.json(data);
}