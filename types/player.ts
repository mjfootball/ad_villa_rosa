export type PlayerHistory = {
  id: string;
  season: string;
  position?: string | null;
  notes?: string | null;
  from_date?: string | null;
  to_date?: string | null;
  event_type?: string | null;
  team?: {
    id: string;
    display_name: string;
  } | null;
};

export type Subscription = {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  paid_at?: string | null;
  next_due_date?: string | null;
};

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string | null;
  date_of_birth?: string | null;
  date_joined?: string | null;
  created_at: string;

  preferred_foot?: string | null;

  notes?: string | null;
  medical_notes?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;

  preferred_position?: string | null;
  secondary_position?: string | null;
  height_cm?: number | null;
  strengths?: string | null;
  development_notes?: string | null;
  injured?: boolean | null;

  team_id?: string | null;
  team_name?: string | null;

  /* ✅ FIXED (NO ANY) */
  player_history?: PlayerHistory[];
  subscriptions?: Subscription[];
};