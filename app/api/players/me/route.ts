import { NextResponse } from "next/server";
import { supabaseAuthServer } from "@/lib/supabase/server";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  try {
    const supabase = await supabaseAuthServer();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(null, { status: 401 });
    }

    const email = user.email.toLowerCase();

    const supabaseAdmin = supabaseService();

    /* -------------------------
       GET INTERNAL USER
    ------------------------- */
    const { data: internalUser } = await supabaseAdmin
      .from("users")
      .select("id, email")
      .eq("auth_user_id", user.id)
      .single();

    if (!internalUser) {
      return NextResponse.json(null, { status: 400 });
    }

    /* -------------------------
       AUTO LINK (🔥 MOVED HERE)
    ------------------------- */
    console.log("🔗 Running auto-link in /api/players/me");

    const { data: playersToLink } = await supabaseAdmin
      .from("players")
      .select("id")
      .ilike("parent_email", email);

    console.log("👶 Players found:", playersToLink);

    if (playersToLink && playersToLink.length > 0) {
      for (const p of playersToLink) {
        const { data: existingLink } = await supabaseAdmin
          .from("parent_player")
          .select("id")
          .eq("parent_id", internalUser.id)
          .eq("player_id", p.id)
          .maybeSingle();

        if (!existingLink) {
          console.log("➕ Linking player:", p.id);

          await supabaseAdmin.from("parent_player").insert({
            parent_id: internalUser.id,
            player_id: p.id,
          });
        } else {
          console.log("ℹ️ Already linked:", p.id);
        }
      }
    }

    /* -------------------------
       GET PLAYERS
    ------------------------- */
    const { data: players, error } = await supabaseAdmin
  .from("parent_player")
  .select(`
    player:players (
      id,
      first_name,
      last_name,
      player_team (
        team:teams (
          id,
          display_name,
          billing_plans (
            amount,
            interval,
            active
          )
        )
      ),
      subscriptions (
        status,
        paid_at,
        next_due_date
      )
    )
  `)
  .eq("parent_id", internalUser.id);

    if (error) {
      console.error(error);
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json(players);
  } catch (err) {
    console.error(err);
    return NextResponse.json(null, { status: 500 });
  }
}