import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  console.log("🔥 UPDATE STAFF START");

  const supabase = supabaseService();

  /* -------------------------
     PARSE BODY
  ------------------------- */
  const body = await req.json();

  const {
    id,
    first_name,
    last_name,
    email,
    system_role,
    avatar_url,
  } = body;

  console.log("📦 UPDATE DATA:", body);

  /* -------------------------
     VALIDATION
  ------------------------- */
  if (!id) {
    return NextResponse.json(
      { error: "Missing staff id" },
      { status: 400 }
    );
  }

  if (!first_name || !last_name) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  /* -------------------------
     UPDATE
  ------------------------- */
  const { data, error } = await supabase
    .from("staff")
    .update({
      first_name: first_name.trim(),
      last_name: last_name.trim(),
      email: email || null,
      system_role: system_role || "coach",
      avatar_url: avatar_url || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("❌ UPDATE FAILED:", error);

    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  console.log("✅ STAFF UPDATED:", data);

  return NextResponse.json({
    success: true,
    staff: data,
  });
}