"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal } from "lucide-react";

/* -------------------------
   TYPES
------------------------- */
export type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  avatar_url?: string | null;
};

/* -------------------------
   COLUMNS
------------------------- */
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
        <div className="flex items-center gap-3">

          {/* AVATAR */}
          {s.avatar_url ? (
            <img
              src={s.avatar_url}
              alt="avatar"
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
              {s.first_name?.[0]}
            </div>
          )}

          {/* NAME */}
          <div>
            {s.first_name} {s.last_name}
          </div>

        </div>
      );
    },
  },

  {
    accessorKey: "email",
    header: "Email",
  },

  /* ACTIONS */
  {
    id: "actions",
    cell: ({ row }) => {
      const s = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:bg-muted rounded"
              onClick={(e) => e.stopPropagation()} // 🔥 FIX 1
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            {/* VIEW PROFILE */}
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/staff/${s.id}`}
                onClick={(e) => e.stopPropagation()} // 🔥 FIX 2
              >
                View Profile
              </Link>
            </DropdownMenuItem>

            {/* EDIT */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation(); // 🔥 FIX 3
                onEdit(s);
              }}
            >
              Edit
            </DropdownMenuItem>

            {/* DELETE */}
            <DropdownMenuItem
              onClick={(e) => {
                e.stopPropagation(); // 🔥 FIX 4
                onDelete(s);
              }}
              className="text-red-600"
            >
              Delete
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];