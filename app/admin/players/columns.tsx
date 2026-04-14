"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* -------------------------
   TYPES
------------------------- */
export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string | null;

  // ✅ NEW MODEL
  preferred_position?: string | null;
  date_of_birth?: string | null;

  team_name?: string | null;
  avatar_url?: string | null;
};

/* -------------------------
   HELPERS
------------------------- */
function getAge(dob?: string | null) {
  if (!dob) return null;

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();

  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

function getCategory(age: number | null) {
  if (age === null) return null;

  if (age <= 6) return "U7";
  if (age <= 7) return "U8";
  if (age <= 8) return "U9";
  if (age <= 9) return "U10";
  if (age <= 10) return "U11";
  if (age <= 11) return "U12";
  if (age <= 12) return "U13";
  if (age <= 13) return "U14";
  if (age <= 14) return "U15";
  if (age <= 15) return "U16";
  if (age <= 16) return "U17";
  if (age <= 17) return "U18";

  return "Senior";
}

/* -------------------------
   COLUMNS
------------------------- */
export const columns = (
  onEdit: (p: Player) => void,
  onDelete: (p: Player) => void
): ColumnDef<Player>[] => [
  {
    accessorKey: "first_name",
    header: "Player",
    cell: ({ row }) => {
      const p = row.original;

      const age = getAge(p.date_of_birth);
      const category = getCategory(age);

      return (
        <div className="flex items-center gap-3">

          {/* AVATAR */}
          <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-medium">
            {p.avatar_url ? (
              <img
                src={p.avatar_url}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {p.first_name?.[0]}
                {p.last_name?.[0]}
              </span>
            )}
          </div>

          {/* NAME + META */}
          <div className="flex flex-col leading-tight">

            <span className="font-medium">
              {p.first_name} {p.last_name}
            </span>

            <div className="flex items-center gap-2 text-xs text-gray-500">

              {/* AGE */}
              {age !== null && (
                <span>Age {age}</span>
              )}

              {/* CATEGORY */}
              {category && (
                <span className="px-1.5 py-0.5 bg-gray-100 rounded">
                  {category}
                </span>
              )}

              {/* POSITION */}
              {p.preferred_position && (
                <span className="px-1.5 py-0.5 bg-black text-white rounded">
                  {p.preferred_position}
                </span>
              )}

            </div>

          </div>

        </div>
      );
    },
  },

  {
    accessorKey: "team_name",
    header: "Team",
    cell: ({ row }) => {
      const team = row.original.team_name;

      return team ? (
        <span>{team}</span>
      ) : (
        <span className="text-gray-400 text-sm">Unassigned</span>
      );
    },
  },

  {
    accessorKey: "parent_email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.original.parent_email;

      return email ? (
        <span>{email}</span>
      ) : (
        <span className="text-gray-400 text-sm">—</span>
      );
    },
  },

  /* ACTIONS */
  {
    id: "actions",
    cell: ({ row }) => {
      const p = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-8 w-8 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">

            <DropdownMenuItem asChild>
              <Link
                href={`/admin/players/${p.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                View profile
              </Link>
            </DropdownMenuItem>

            <DropdownMenuItem
              className="text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(p);
              }}
            >
              Delete
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];