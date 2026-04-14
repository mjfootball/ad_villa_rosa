import { notFound } from "next/navigation";
import { supabaseService } from "@/lib/supabase/service";

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = supabaseService();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (!post) return notFound();

  return (
    <article className="flex flex-col">

      {/* 🔥 HERO IMAGE */}
{post.image_url && (
  <div className="relative w-full h-[65vh] min-h-[420px] overflow-hidden">

    {/* IMAGE */}
    <img
      src={post.image_url}
      alt={post.title}
      className="w-full h-full object-cover"
    />

    {/* 🔥 STRONG GRADIENT (FIX) */}
    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

    {/* 🔥 CONTENT */}
    <div className="absolute bottom-0 left-0 w-full">
      <div className="container pb-10 max-w-4xl">

        {/* 🔥 GLASS EFFECT BACKDROP */}
        <div className="bg-black/30 backdrop-blur-sm inline-block p-4 rounded-xl">

          <p className="text-sm text-white/80 mb-2">
            {new Date(post.created_at).toLocaleDateString()}
          </p>

          <h1 className="text-4xl md:text-5xl font-semibold leading-tight text-white drop-shadow-md">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-4 text-lg md:text-xl text-white/90 max-w-2xl">
              {post.excerpt}
            </p>
          )}

        </div>

      </div>
    </div>

  </div>
)}

      {/* 🔥 ARTICLE BODY */}
      <div className="container section-sm max-w-3xl">

        <div className="prose prose-neutral max-w-none
                        prose-lg
                        prose-headings:font-semibold
                        prose-p:leading-relaxed
                        prose-p:text-muted-foreground
                        prose-a:text-primary
                        prose-strong:text-foreground
                        prose-img:rounded-xl">

          {post.content?.split("\n").map((p: string, i: number) => {
            if (!p.trim()) return null;

            return <p key={i}>{p}</p>;
          })}

        </div>

      </div>

    </article>
  );
}