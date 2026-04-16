import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";
import PostsTable from "./posts-table";

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; status?: string }>;
}) {
  const supabase = supabaseService();

  const params = await searchParams;

  const search = params.search || "";
  const status = params.status || "all";

  /* -------------------------
     QUERY
  ------------------------- */
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("title", `%${search}%`);
  }

  if (status === "published") {
    query = query.eq("published", true);
  }

  if (status === "draft") {
    query = query.eq("published", false);
  }

  const { data: posts } = await query;

  return (
    <div className="p-10 space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Posts</h1>

        <Link
          href="/admin/posts/new"
          className="bg-black text-white px-4 py-2 rounded"
        >
          New Post
        </Link>
      </div>

      {/* FILTER BAR */}
      <form className="flex gap-4 items-center">
        <input
          name="search"
          defaultValue={search}
          placeholder="Search posts..."
          className="border px-3 py-2 rounded w-64"
        />

        <select
          name="status"
          defaultValue={status}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>

        <button className="border px-4 py-2 rounded">
          Filter
        </button>
      </form>

      {/* TABLE (CLIENT) */}
      <PostsTable initialData={posts || []} />

    </div>
  );
}