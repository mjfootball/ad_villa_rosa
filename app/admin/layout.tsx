import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { AppSidebar } from "@/components/app-sidebar";
import { supabaseService } from "@/lib/supabase/service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  /* -------------------------
     AUTH
  ------------------------- */
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in");

  /* -------------------------
     ROLE CHECK
  ------------------------- */
  const supabaseAdmin = supabaseService();

  const { data: internalUser } = await supabaseAdmin
    .from("users")
    .select("role")
    .eq("auth_user_id", user.id)
    .single();

  if (!internalUser || internalUser.role !== "admin") {
    redirect("/unauthorised");
  }

  /* -------------------------
     UI (FIXED)
  ------------------------- */
  return (
    <SidebarProvider>
  <AppSidebar />

  <SidebarInset>
    <header className="flex items-center justify-between p-4 border-b">
  <SidebarTrigger />

  <div className="font-semibold">
    Admin
  </div>
</header>

    {children}
  </SidebarInset>
</SidebarProvider>
  );
}