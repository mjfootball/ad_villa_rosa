import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  console.log("🔥 CREATE STAFF START");

  const supabase = supabaseService();

  /* -------------------------
     PARSE BODY (JSON)
  ------------------------- */
  const body = await req.json();

  const {
    first_name,
    last_name,
    email,
    system_role, // ✅ NEW (optional from UI later)
  } = body;

  console.log("📦 DATA:", body);

  /* -------------------------
     VALIDATION
  ------------------------- */
  if (!first_name || !last_name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  /* -------------------------
     INSERT
  ------------------------- */
  const { data, error } = await supabase
    .from("staff")
    .insert([
      {
        first_name,
        last_name,
        email: email || null,

        // ✅ IMPORTANT
        system_role: system_role || "coach",
      },
    ])
    .select()
    .single();

  if (error) {
    console.error("❌ CREATE FAILED", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  console.log("✅ STAFF CREATED:", data);

  /* -------------------------
     RESPONSE
  ------------------------- */
  return NextResponse.json({
    success: true,
    staff: data,
  });
}