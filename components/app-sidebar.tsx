"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { UserCog, CircleDot } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  Users,
  Layers,
  CreditCard,
  Euro,
  FileText,
  Settings,
  LogOut,
} from "lucide-react";

import { supabaseBrowser } from "@/lib/supabase/client";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = supabaseBrowser();

  const { setOpen, state } = useSidebar(); // ✅ ADD state

  /* -------------------------
     NAV GROUPS
  ------------------------- */

  const coreItems = [
    { title: "Players", url: "/admin/players", icon: Users },
    { title: "Teams", url: "/admin/teams", icon: Layers },
    { title: "Staff", url: "/admin/staff", icon: UserCog },
    { title: "Billing", url: "/admin/billing", icon: CreditCard },
    { title: "Payments", url: "/admin/payments", icon: Euro },
  ];

  const contentItems = [
    { title: "Posts", url: "/admin/posts", icon: FileText },
  ];

  const systemItems = [
    { title: "Settings", url: "/admin/settings", icon: Settings },
  ];

  /* -------------------------
     LOGOUT
  ------------------------- */
  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/sign-in");
  }

  /* -------------------------
     LINK CLICK
  ------------------------- */
  function handleLinkClick() {
    setOpen(false);
  }

  return (
    <Sidebar collapsible="icon">

      {/* 🔥 HEADER */}
      <div className="p-4 border-b flex items-center justify-center">

        {state === "collapsed" ? (
          /* ⚽ COLLAPSED ICON */
          <CircleDot className="size-6 text-black" />
        ) : (
          /* 🏷 FULL LOGO */
          <Image
            src="/images/logo.png"
            alt="MJ Football"
            width={400}
            height={160}
            className="h-12 w-auto"
            priority
          />
        )}

      </div>

      <SidebarContent>

        {/* CORE */}
        <SidebarGroup>
          <SidebarGroupLabel>Academy</SidebarGroupLabel>

          <SidebarMenu>
            {coreItems.map((item) => {
              const isActive = pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon />
                      {state !== "collapsed" && (
                        <span>{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* CONTENT */}
        <SidebarGroup>
          <SidebarGroupLabel>Content</SidebarGroupLabel>

          <SidebarMenu>
            {contentItems.map((item) => {
              const isActive = pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon />
                      {state !== "collapsed" && (
                        <span>{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

        {/* SYSTEM */}
        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>

          <SidebarMenu>
            {systemItems.map((item) => {
              const isActive = pathname.startsWith(item.url);

              return (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link
                      href={item.url}
                      onClick={handleLinkClick}
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon />
                      {state !== "collapsed" && (
                        <span>{item.title}</span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className="text-red-600"
            >
              <LogOut />
              {state !== "collapsed" && <span>Log out</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}