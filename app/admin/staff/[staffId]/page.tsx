import { supabaseAuthServer } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StaffProfileClient from "./staff-profile-client";

type Props = {
  params: Promise<{ staffId: string }>;
};

export default async function Page({ params }: Props) {
  const { staffId } = await params;

  console.log("🔥 ===============================");
  console.log("🔥 FETCH STAFF PAGE START");
  console.log("🆔 STAFF ID:", staffId);

  const supabase = await supabaseAuthServer();

  /* -------------------------
     FETCH STAFF + TEAMS
  ------------------------- */
  const { data, error } = await supabase
    .from("staff")
    .select(`
      *,
      team_staff (
        role,
        team:teams (
          id,
          display_name
        )
      )
    `)
    .eq("id", staffId)
    .single();

  if (error || !data) {
    console.error("❌ STAFF FETCH ERROR:", error);
    return notFound();
  }

  console.log("📦 RAW STAFF:", data);

  /* -------------------------
     NORMALISE TEAMS
  ------------------------- */
  const teams =
    data.team_staff?.map((t: any) => ({
      team_id: t.team?.id,
      team_name: t.team?.display_name,
      role: t.role,
    })) || [];

  const staff = {
    ...data,
    teams,
  };

  console.log("✅ FINAL STAFF:", staff);
  console.log("🔥 FETCH STAFF PAGE COMPLETE");
  console.log("🔥 ===============================");

  return <StaffProfileClient staff={staff} />;
}