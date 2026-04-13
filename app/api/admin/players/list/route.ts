import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  const supabase = supabaseService();

  const { data, error } = await supabase
    .from("players")
    .select(`
      id,
      first_name,
      last_name,
      parent_email,
      player_team (
        team:teams (
          id,
          display_name
        )
      )
    `)
    .order("first_name");

  if (error) {
    console.error(error);
    return NextResponse.json(null, { status: 500 });
  }

  return NextResponse.json(data);
}