import { NextResponse } from "next/server";
import { requireRole } from "@/lib/auth/require-role";
import { supabaseService } from "@/lib/supabase/service";

export async function GET() {
  try {
    /* -------------------------
       1. AUTH + ROLE (PARENT)
    ------------------------- */
    const { user, internalUser } = await requireRole(["parent"]);

    const email = user.email!.toLowerCase();

    const supabaseAdmin = supabaseService();

    /* -------------------------
       2. AUTO LINK
    ------------------------- */
    const { data: playersToLink } = await supabaseAdmin
      .from("players")
      .select("id")
      .ilike("parent_email", email);

    if (playersToLink?.length) {
      for (const p of playersToLink) {
        const { data: existingLink } = await supabaseAdmin
          .from("parent_player")
          .select("id")
          .eq("parent_id", internalUser.id)
          .eq("player_id", p.id)
          .maybeSingle();

        if (!existingLink) {
          await supabaseAdmin.from("parent_player").insert({
            parent_id: internalUser.id,
            player_id: p.id,
          });
        }
      }
    }

    /* -------------------------
       3. GET DATA (SCOPED)
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
      return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }

    return NextResponse.json(players);
  } catch (err: any) {
    if (err.message === "Forbidden") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }
}