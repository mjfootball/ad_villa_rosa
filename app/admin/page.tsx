"use client";

import Link from "next/link";

export default function AdminDashboard() {
  const sections = [
    {
      title: "Players",
      description: "Manage players and assignments",
      href: "/admin/players",
    },
    {
      title: "Teams",
      description: "Create and manage teams",
      href: "/admin/teams",
    },
    {
      title: "Billing",
      description: "Set pricing per team",
      href: "/admin/billing",
    },
    {
      title: "Payments",
      description: "View overdue and paid subscriptions",
      href: "/admin/payments",
    },
  ];

  return (
    <div className="p-10 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-semibold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="border p-6 rounded hover:bg-gray-50 transition"
          >
            <div className="text-xl font-medium">{s.title}</div>
            <div className="text-sm text-gray-500">
              {s.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}