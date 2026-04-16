"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
/* -------------------------
   TYPES
------------------------- */
type Props = {
  user: User | null;
};

export default function Navbar({ user }: Props) {
  const pathname = usePathname();

  /* -------------------------
     ROUTE CONDITIONS
  ------------------------- */
  const isAuthPage =
    pathname === "/sign-in" || pathname === "/sign-up";

  const isAppPage =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard");

  /* -------------------------
     HIDE NAVBAR (APP AREAS)
  ------------------------- */
  if (isAppPage) return null;

  return (
    <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
      <div className="container flex items-center justify-between h-16">

        {/* LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.png"
            alt="MJ Football"
            width={400}
            height={160}
            className="h-16 w-auto"
            priority
          />
        </Link>

        {/* NAV */}
        <nav className="flex items-center gap-6 text-sm">

          <Link href="/news">News</Link>
          <Link href="/contact">Contact</Link>

          {/* 🔥 AUTH SWITCH */}
          {!isAuthPage && (
            !user ? (
              <Link
                href="/sign-in"
                className="border px-4 py-1.5 rounded-md"
              >
                Sign In
              </Link>
            ) : (
              <Link
                href="/dashboard"
                className="border px-4 py-1.5 rounded-md"
              >
                Dashboard
              </Link>
            )
          )}

        </nav>

      </div>
    </header>
  );
}