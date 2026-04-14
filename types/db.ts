export type PlayerRow = {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string | null;
  preferred_position?: string | null;
  date_of_birth?: string | null;
  avatar_url?: string | null;
  emergency_contact_name?: string | null;

  player_team?: {
    team_id: string;
    team:
      | {
          id: string;
          display_name: string;
        }
      | {
          id: string;
          display_name: string;
        }[]
      | null;
  }[];
};