import { NextResponse } from "next/server";
import { supabaseAuthServer } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET(request: Request) {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📥 CALLBACK HIT");

  const url = new URL(request.url);
  console.log("🌐 URL:", url.toString());

  const supabase = await supabaseAuthServer();

  const code = url.searchParams.get("code");
  console.log("🔑 code:", code);

  /* -------------------------
     EXCHANGE SESSION
  ------------------------- */
  if (code) {
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("❌ exchangeCodeForSession failed:", exchangeError);
    } else {
      console.log("✅ exchangeCodeForSession success");
    }
  } else {
    console.log("⚠️ No code present");
  }

  /* -------------------------
     GET USER
  ------------------------- */
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  console.log("👤 getUser result:", {
    userId: user?.id,
    email: user?.email,
    error: userError,
  });

  // ✅ Guard user + email
  if (userError || !user || !user.email) {
    console.error("❌ getUser failed or missing email", {
      userError,
      user,
    });
    return NextResponse.redirect(new URL("/sign-in", url));
  }

  const email = user.email.toLowerCase();

  /* -------------------------
     SERVICE CLIENT
  ------------------------- */
  const supabaseAdmin = supabaseService();
  console.log("🛠️ Service client created");

  /* -------------------------
     CHECK / CREATE USER
  ------------------------- */
  let internalUserId: string | null = null;

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  console.log("🔍 existing user lookup:", {
    existing,
    error: existingError,
  });

  if (!existing) {
    console.log("➕ No existing user — attempting insert");

    const { data: newUser, error: insertError } = await supabaseAdmin
      .from("users")
      .insert({
        auth_user_id: user.id,
        email,
        name: user.user_metadata?.name || email.split("@")[0],
        role: "parent",
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("❌ INSERT FAILED:", insertError);
    } else {
      console.log("✅ USER CREATED SUCCESSFULLY");
      internalUserId = newUser.id;
    }
  } else {
    console.log("ℹ️ User already exists — skipping insert");
    internalUserId = existing.id;
  }

  /* -------------------------
     AUTO LINK PLAYERS
  ------------------------- */
  if (internalUserId) {
    console.log("🔗 Checking for players to auto-link");

    const { data: playersToLink } = await supabaseAdmin
      .from("players")
      .select("id")
      .ilike("parent_email", email);

    console.log("👶 Players found for linking:", playersToLink);

    if (playersToLink && playersToLink.length > 0) {
      for (const p of playersToLink) {
        const { data: existingLink } = await supabaseAdmin
          .from("parent_player")
          .select("id")
          .eq("parent_id", internalUserId)
          .eq("player_id", p.id)
          .maybeSingle();

        if (!existingLink) {
          console.log("➕ Linking player:", p.id);

          await supabaseAdmin.from("parent_player").insert({
            parent_id: internalUserId,
            player_id: p.id,
          });
        } else {
          console.log("ℹ️ Already linked:", p.id);
        }
      }
    }
  }

  console.log("➡️ Redirecting to dashboard");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  return NextResponse.redirect(new URL("/dashboard", url));
}