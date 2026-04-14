import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";

export default async function NewsPage() {
  const supabase = supabaseService();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="container section space-y-10">

      {/* HEADER */}
      <div className="space-y-2">
        <h1>Latest News</h1>
        <p>Updates, announcements, and academy insights.</p>
      </div>

      {/* POSTS */}
      <div className="space-y-8">

        {posts?.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.id}`}
            className="block group"
          >
            <div className="flex flex-col md:flex-row gap-6 items-start">

              {/* IMAGE */}
              <div className="w-full md:w-64 h-40 relative overflow-hidden rounded-xl">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* CONTENT */}
              <div className="space-y-2 flex-1">

                <div className="text-sm text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString()}
                </div>

                <h2 className="text-xl font-semibold group-hover:underline">
                  {post.title}
                </h2>

                <p className="text-muted-foreground line-clamp-2">
                  {post.excerpt}
                </p>

              </div>

            </div>
          </Link>
        ))}

      </div>

    </div>
  );
}