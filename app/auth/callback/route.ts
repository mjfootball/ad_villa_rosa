import { NextResponse } from "next/server";
import { supabaseAuthServer } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(request: Request) {
  console.log("📥 CALLBACK HIT");

  const url = new URL(request.url);
  const supabase = await supabaseAuthServer();

  const code = url.searchParams.get("code");

  /* -------------------------
     EXCHANGE SESSION
  ------------------------- */
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("❌ exchange failed:", error);
      return NextResponse.redirect(new URL("/sign-in", url));
    }
  }

  /* -------------------------
     GET USER
  ------------------------- */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    console.error("❌ no user after exchange");
    return NextResponse.redirect(new URL("/sign-in", url));
  }

  const email = user.email.toLowerCase();
  const supabaseAdmin = supabaseService();

  /* -------------------------
     ENSURE USER EXISTS
  ------------------------- */
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!existing) {
    console.log("➕ creating user");

    await supabaseAdmin.from("users").insert({
      auth_user_id: user.id,
      email,
      name: user.user_metadata?.name || email.split("@")[0],
      role: "parent", // default
    });
  } else {
    console.log("ℹ️ user exists");
  }

  /* -------------------------
     REDIRECT (SIMPLE)
  ------------------------- */
  console.log("➡️ redirect → /dashboard");

  return NextResponse.redirect(new URL("/dashboard", url));
}