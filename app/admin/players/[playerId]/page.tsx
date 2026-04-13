// app/admin/players/[playerId]/page.tsx

import { supabaseAuthServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PlayerProfileClient from "./player-profile-client";

type Props = {
  params: Promise<{ playerId: string }>;
};

export default async function Page({ params }: Props) {
  const { playerId } = await params;

  const supabase = await supabaseAuthServer();

  /* -------------------------
     FETCH PLAYER + PAYMENTS
  ------------------------- */
  const { data: player, error } = await supabase
    .from("players")
    .select(`
      *,
      subscriptions (
        id,
        status,
        amount,
        created_at,
        paid_at,
        next_due_date
      )
    `)
    .eq("id", playerId)
    .single();

  if (error || !player) {
    console.error("Player fetch error:", error);
    return notFound();
  }

  return <PlayerProfileClient player={player} />;
}