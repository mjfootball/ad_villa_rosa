export type Charge = {
  id: string;
  player_id: string;
  amount: number;
  month: string;
  status: "pending" | "paid";
};

export type Payment = {
  id: string;
  player_id: string;
  amount: number;
  created_at: string;
};

export type PlayerFinancials = {
  id: string;
  first_name: string;
  last_name: string;

  balance: number;
  months_overdue: number;

  last_payment_date?: string | null;
  next_payment_date?: string | null;
};