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
export type Post = {
  id: string;
  title: string;
  excerpt?: string | null;
  image_url?: string | null;
  published: boolean;
  created_at: string;
};

/* -------------------------
   COLUMNS
------------------------- */
export const columns = (
  onDelete: (p: Post) => void
): ColumnDef<Post>[] => [
  {
    accessorKey: "title",
    header: "Post",
    cell: ({ row }) => {
      const p = row.original;

      return (
        <div className="flex items-center gap-3">

          {/* IMAGE */}
          <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-medium">
            {p.image_url ? (
              <img
                src={p.image_url}
                alt="post"
                className="w-full h-full object-cover"
              />
            ) : (
              <span>
                {p.title?.[0] || "P"}
              </span>
            )}
          </div>

          {/* TEXT */}
          <div className="flex flex-col leading-tight">

            <span className="font-medium">
              {p.title}
            </span>

            {p.excerpt && (
              <span className="text-xs text-gray-500 line-clamp-1">
                {p.excerpt}
              </span>
            )}

          </div>

        </div>
      );
    },
  },

  {
    accessorKey: "published",
    header: "Status",
    cell: ({ row }) => {
      const published = row.original.published;

      return published ? (
        <span className="text-green-600 text-sm">
          Published
        </span>
      ) : (
        <span className="text-gray-400 text-sm">
          Draft
        </span>
      );
    },
  },

  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      return (
        <span className="text-sm text-gray-500 whitespace-nowrap">
          {new Date(row.original.created_at).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </span>
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

            {/* 🔥 VIEW LIVE */}
            {p.published && (
              <DropdownMenuItem asChild>
                <Link
                  href={`/news/${p.id}`}
                  target="_blank"
                  onClick={(e) => e.stopPropagation()}
                >
                  View live
                </Link>
              </DropdownMenuItem>
            )}

            {/* EDIT */}
            <DropdownMenuItem asChild>
              <Link
                href={`/admin/posts/${p.id}`}
                onClick={(e) => e.stopPropagation()}
              >
                Edit
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