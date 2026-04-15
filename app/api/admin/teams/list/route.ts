import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

type StaffNested = {
  first_name: string;
  last_name: string;
};

type TeamStaffRow = {
  role: string | null;
  staff: StaffNested | null;
};

type AgeGroupRow = {
  name_en: string;
};

type TeamRow = {
  id: string;
  display_name: string;
  team_name: string;
  format: "F7" | "F11";
  age_group: AgeGroupRow | null; 
  team_staff: TeamStaffRow[];
};

export async function GET() {
  const supabase = supabaseService();

  console.log("🔥 FETCH TEAMS START");

  const { data, error } = await supabase
    .from("teams")
    .select(`
      id,
      display_name,
      team_name,
      format,
      age_group:age_groups (
        name_en
      ),
      team_staff (
        role,
        staff:staff (
          first_name,
          last_name
        )
      )
    `)
    .order("display_name");

  if (error) {
    console.error("❌ ERROR:", error);
    return NextResponse.json(null, { status: 500 });
  }

  const teams = (data || []) as unknown as TeamRow[];

  const formatted = teams.map((t) => {
    const headCoach = t.team_staff?.find(
      (s) => s.role?.toLowerCase().trim() === "head coach"
    );

    const coach = headCoach?.staff;

    const result = {
      id: t.id,
      display_name: t.display_name,
      team_name: t.team_name,
      format: t.format,

      // ✅ FIX HERE
      age_group_name: t.age_group?.name_en || null,

      head_coach: coach
        ? `${coach.first_name} ${coach.last_name}`
        : "Unassigned",
    };

    console.log("✅ FINAL TEAM:", result);

    return result;
  });

  return NextResponse.json(formatted);
}