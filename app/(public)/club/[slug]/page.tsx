import Image from "next/image";
import { supabaseService } from "@/lib/supabase/service";
import { notFound } from "next/navigation";

/* -------------------------
   PAGE
------------------------- */
export default async function ClubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  console.log("⚽ CLUB PAGE HIT:", slug);

  const supabase = supabaseService();

  /* -------------------------
     GET CLUB
  ------------------------- */
  const { data: club, error: clubError } = await supabase
    .from("clubs")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!club || clubError) {
    console.error("❌ CLUB NOT FOUND:", clubError);
    return notFound();
  }

  /* -------------------------
     GET TEAMS
  ------------------------- */
  const { data: teams } = await supabase
    .from("teams")
    .select("id, display_name")
    .eq("club_id", club.id)
    .order("display_name");

  /* -------------------------
     GET POSTS
  ------------------------- */
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title")
    .eq("club_id", club.id)
    .eq("published", true)
    .limit(3);

  return (
    <div className="flex flex-col">

      {/* -------------------------
         HERO
      ------------------------- */}
      <section className="relative h-[60vh] flex items-center justify-center text-white text-center">

        {/* IMAGE */}
        {club.hero_image_url ? (
          <Image
            src={club.hero_image_url}
            alt={club.name}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gray-800" />
        )}

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/50" />

        {/* CONTENT */}
        <div className="relative z-10 px-6">
          <h1 className="text-4xl md:text-6xl font-bold">
            {club.name}
          </h1>

          <p className="mt-4 text-lg md:text-xl opacity-90">
            Building players on and off the pitch
          </p>
        </div>
      </section>

      {/* -------------------------
         TEAMS
      ------------------------- */}
      <section className="container py-12">
        <h2 className="text-2xl font-semibold mb-6">Our Teams</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {teams?.map((team) => (
            <div
              key={team.id}
              className="border rounded-lg p-6 text-center hover:shadow transition"
            >
              {team.display_name}
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------
         NEWS
      ------------------------- */}
      <section className="container py-12">
        <h2 className="text-2xl font-semibold mb-6">Latest News</h2>

        <div className="space-y-3">
          {posts?.map((post) => (
            <div
              key={post.id}
              className="border p-4 rounded hover:bg-gray-50 transition"
            >
              {post.title}
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------
         JOIN
      ------------------------- */}
      <section className="py-16 text-center">
        <h2 className="text-3xl font-semibold">
          Join {club.name}
        </h2>

        <p className="mt-4 text-gray-500">
          Get involved with our academy today
        </p>

        <button className="mt-6 bg-black text-white px-6 py-3 rounded-md">
          Register Interest
        </button>
      </section>

    </div>
  );
}