import { redirect } from "next/navigation";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

import { supabaseService } from "@/lib/supabase/service";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();

  /* -------------------------
     1. AUTH
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

  if (!user) {
    redirect("/sign-in");
  }

  /* -------------------------
     2. ROLE CHECK (ADMIN)
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
     3. UI (RESTORED)
  ------------------------- */
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <div className="mb-4">
          <SidebarTrigger />
        </div>

        {children}
      </main>
    </SidebarProvider>
  );
}