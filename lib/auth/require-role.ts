import { requireUser } from "./require-user";
import { supabaseService } from "@/lib/supabase/service";

export async function requireRole(allowedRoles: string[]) {
  /* -------------------------
     1. GET AUTH USER
  ------------------------- */
  const { user } = await requireUser();

  const supabaseAdmin = supabaseService();

  /* -------------------------
     2. GET INTERNAL USER
  ------------------------- */
  const { data: internalUser, error } = await supabaseAdmin
    .from("users")
    .select("id, role")
    .eq("auth_user_id", user.id)
    .single();

  if (error || !internalUser) {
    throw new Error("User not found");
  }

  /* -------------------------
     3. ROLE CHECK
  ------------------------- */
  if (!allowedRoles.includes(internalUser.role)) {
    throw new Error("Forbidden");
  }

  return {
    user,
    internalUser,
  };
}