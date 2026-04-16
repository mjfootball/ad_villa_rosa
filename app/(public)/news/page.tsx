import Link from "next/link";
import { supabaseService } from "@/lib/supabase/service";

export default async function NewsPage() {
  const supabase = supabaseService();

  const { data: posts } = await supabase
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (!posts?.length) {
    return (
      <div className="container py-20 text-center text-muted-foreground">
        No news yet.
      </div>
    );
  }

  const [featured, ...rest] = posts;

  return (
    <div className="container py-12 space-y-12">

      {/* HEADER */}
      <div className="space-y-2 max-w-2xl">
        <h1 className="text-4xl font-semibold tracking-tight">
          Latest News
        </h1>
        <p className="text-muted-foreground">
          Updates, announcements, and academy insights.
        </p>
      </div>

      {/* 🔥 FEATURED POST */}
      <Link href={`/news/${featured.id}`} className="group block">

        <div className="relative h-[400px] rounded-2xl overflow-hidden">

          {featured.image_url ? (
            <img
              src={featured.image_url}
              className="w-full h-full object-cover group-hover:scale-105 transition"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

          {/* CONTENT */}
          <div className="absolute bottom-0 p-6 text-white max-w-2xl space-y-2">

            <div className="text-sm text-white/80">
              {new Date(featured.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </div>

            <h2 className="text-2xl md:text-3xl font-semibold">
              {featured.title}
            </h2>

            {featured.excerpt && (
              <p className="text-white/90 line-clamp-2">
                {featured.excerpt}
              </p>
            )}

          </div>

        </div>
      </Link>

      {/* 📰 GRID POSTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

        {rest.map((post) => (
          <Link
            key={post.id}
            href={`/news/${post.id}`}
            className="group block"
          >
            <div className="space-y-3">

              {/* IMAGE */}
              <div className="h-48 rounded-xl overflow-hidden">
                {post.image_url ? (
                  <img
                    src={post.image_url}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200" />
                )}
              </div>

              {/* TEXT */}
              <div className="space-y-1">

                <div className="text-xs text-muted-foreground">
                  {new Date(post.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                  })}
                </div>

                <h3 className="font-semibold group-hover:underline">
                  {post.title}
                </h3>

                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {post.excerpt}
                  </p>
                )}

              </div>

            </div>
          </Link>
        ))}

      </div>

    </div>
  );
}