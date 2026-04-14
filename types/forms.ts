export type PlayerForm = {
  first_name: string;
  last_name: string;
  parent_email: string;

  date_of_birth: string;
  date_joined: string;

  preferred_foot: string;

  notes: string;
  medical_notes: string;

  emergency_contact_name: string;
  emergency_contact_phone: string;

  preferred_position: string;
  secondary_position: string;
  height_cm: number | "";
  strengths: string;
  development_notes: string;
  injured: boolean;
};