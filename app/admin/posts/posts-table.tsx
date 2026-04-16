"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { DataTable } from "@/components/ui/data-table";
import { columns, Post } from "./posts-columns";

export default function PostsTable({
  initialData,
}: {
  initialData: Post[];
}) {
  const router = useRouter();
  const [data, setData] = useState(initialData);

  /* -------------------------
     DELETE
  ------------------------- */
  async function handleDelete(post: Post) {
    if (!confirm("Delete this post?")) return;

    await fetch(`/api/admin/posts/${post.id}`, {
      method: "DELETE",
    });

    setData((prev) => prev.filter((p) => p.id !== post.id));
  }

  return (
    <div className="overflow-x-auto">

      <DataTable
        columns={columns(handleDelete)}
        data={data}
        onRowClick={(row) => {
          router.push(`/admin/posts/${row.id}`);
        }}
      />

    </div>
  );
}