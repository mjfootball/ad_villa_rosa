"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
};

export const staffColumns = (
  onEdit: (s: Staff) => void,
  onDelete: (s: Staff) => void
): ColumnDef<Staff>[] => [
  {
    accessorKey: "first_name",
    header: "Name",
    cell: ({ row }) => {
      const s = row.original;

      return (
        <div>
          {s.first_name} {s.last_name}
        </div>
      );
    },
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const s = row.original;

      return (
        <Link href={`/admin/staff/${s.id}`}>
          View
        </Link>
      );
    },
  },
];