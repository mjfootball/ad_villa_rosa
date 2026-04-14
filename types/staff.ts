export type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;

  role: string;

  phone?: string | null;
  avatar_url?: string | null;
};