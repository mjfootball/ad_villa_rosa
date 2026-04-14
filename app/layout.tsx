import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import Image from "next/image";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MJ Football - Academy Software",
  description:
    "Player development, coaching, and parent management platform.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen flex flex-col bg-background text-foreground">

        {/* 🔥 NAVBAR */}
        <header className="border-b bg-background/80 backdrop-blur sticky top-0 z-50">
          <div className="container flex items-center justify-between h-16">

            {/* ✅ LOGO */}
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

              <Link
                href="/sign-in"
                className="border px-4 py-1.5 rounded-md"
              >
                Sign In
              </Link>
            </nav>

          </div>
        </header>

        {/* PAGE */}
        <main className="flex-1">
          {children}
        </main>

      </body>
    </html>
  );
}