import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-user";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  try {
    const { user } = await requireUser();

    const supabaseAdmin = supabaseService();

    const { data: internalUser } = await supabaseAdmin
      .from("users")
      .select("role")
      .eq("auth_user_id", user.id)
      .single();

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