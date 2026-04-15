export type Team = {
  id: string;

  display_name: string;
  team_name: string;

  format: "F7" | "F11";

  age_group_name?: string | null;

  head_coach?: string; // ✅ ADD THIS

  team_staff?: {
    staff_id: string;
    role?: string | null;
    staff: {
      id: string;
      first_name: string;
      last_name: string;
    };
  }[];
};