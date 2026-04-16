import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";

export default async function NewsDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { id } = await params;
  const { preview } = await searchParams;

  const supabase = supabaseService();

  let query = supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!preview) {
    query = supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("published", true)
      .single();
  }

  const { data: post } = await query;

  if (!post) return notFound();

  return (
    <article className="flex flex-col">

      {/* 🔥 HERO */}
      {post.image_url && (
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden">

          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-full object-cover"
          />

          {/* GRADIENT */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

          {/* TEXT */}
          <div className="absolute bottom-0 w-full">
            <div className="container max-w-4xl pb-12">

              <div className="space-y-4 text-white">

                <p className="text-sm text-white/80">
                  {new Date(post.created_at).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>

                <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
                  {post.title}
                </h1>

                {post.excerpt && (
                  <p className="text-lg text-white/90 max-w-2xl">
                    {post.excerpt}
                  </p>
                )}

              </div>

            </div>
          </div>

        </div>
      )}

      {/* 📖 ARTICLE BODY */}
      <div className="container max-w-3xl py-12">

        <div
          className="
            prose prose-neutral
            max-w-none

            prose-lg

            prose-headings:font-semibold
            prose-headings:tracking-tight

            prose-p:text-muted-foreground
            prose-p:leading-relaxed

            prose-a:text-primary

            prose-img:rounded-xl
            prose-img:my-8

            prose-blockquote:border-l-4
            prose-blockquote:pl-4
            prose-blockquote:text-muted-foreground
          "
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </div>

    </article>
  );
}