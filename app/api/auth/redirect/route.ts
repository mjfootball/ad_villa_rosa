import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  try {
    const { user } = await requireUser();

    const supabaseAdmin = supabaseService();

    let { data: internalUser } = await supabaseAdmin
  .from("users")
  .select("*")
  .eq("auth_user_id", user.id)
  .maybeSingle();

/* -------------------------
   AUTO CREATE USER
------------------------- */
if (!internalUser) {
  console.log("➕ Creating internal user (fallback)");

  const { data: newUser } = await supabaseAdmin
    .from("users")
    .insert({
      auth_user_id: user.id,
      email: user.email,
      name:
        user.user_metadata?.name ||
        user.email?.split("@")[0],
      role: "parent",
    })
    .select()
    .single();

  internalUser = newUser;
}

    console.log("🔀 ROUTE DECISION:", internalUser);

    if (!internalUser) {
      return NextResponse.json({ url: "/unauthorised" });
    }

    if (internalUser.role === "admin") {
      return NextResponse.json({ url: "/admin" });
    }

    return NextResponse.json({ url: "/dashboard" });
  } catch (err) {
    console.error("❌ redirect route error:", err);
    return NextResponse.json({ url: "/sign-in" });
  }
}