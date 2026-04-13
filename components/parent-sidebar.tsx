"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { Users, CreditCard, LogOut } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase/client";

export function ParentSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const items = [
    {
      title: "My Children",
      url: "/dashboard",
      icon: Users,
    },
    {
      title: "Payments",
      url: "/dashboard/payments",
      icon: CreditCard,
    },
  ];

  /* -------------------------
     LOGOUT
  ------------------------- */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  return (
    <Sidebar collapsible="icon">
      
      {/* MAIN NAV */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Parent</SidebarGroupLabel>

          <SidebarMenu>
            {items.map((item) => {
              const isActive = pathname === item.url;

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>

        </SidebarGroup>
      </SidebarContent>

      {/* 🔥 FOOTER (BOTTOM LEFT LOGOUT — MATCHES ADMIN) */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-600"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}