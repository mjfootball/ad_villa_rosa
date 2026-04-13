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

export type Player = {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string | null;
  position?: string | null;
  team_name?: string | null;
};

export const columns = (
  onEdit: (p: Player) => void, // still passed for row click usage
  onDelete: (p: Player) => void
): ColumnDef<Player>[] => [
  {
    accessorKey: "first_name",
    header: "Player",
    cell: ({ row }) => {
      const p = row.original;
      return `${p.first_name} ${p.last_name}`;
    },
  },
  {
    accessorKey: "position",
    header: "Position",
    cell: ({ row }) => {
      const pos = row.original.position;
      return pos ? (
        <span className="px-2 py-1 rounded bg-gray-100 text-xs">
          {pos}
        </span>
      ) : (
        "—"
      );
    },
  },
  {
    accessorKey: "team_name",
    header: "Team",
  },
  {
    accessorKey: "parent_email",
    header: "Email",
  },

  /* 🔥 ACTIONS DROPDOWN (FINAL CLEAN VERSION) */
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

            {/* VIEW PROFILE */}
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/players/${p.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                View profile
              </Link>
            </DropdownMenuItem>

            {/* DELETE */}
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