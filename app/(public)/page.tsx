import Link from "next/link";

export default function HomePage() {
  return (
    <div className="max-w-6xl mx-auto p-10 space-y-10">

      {/* HERO */}
      <section className="text-center space-y-4">
        <h1 className="text-4xl font-semibold">
          Elite Football Development
        </h1>

        <p className="text-gray-600 max-w-xl mx-auto">
          Structured coaching, player development, and performance tracking.
        </p>

        <div className="flex justify-center gap-4">
          
          {/* ✅ FIXED */}
          <Link
            href="/sign-up"
            className="bg-black text-white px-6 py-2 rounded"
          >
            Join Now
          </Link>

          <Link
            href="/contact"
            className="border px-6 py-2 rounded"
          >
            Contact Us
          </Link>

        </div>
      </section>

      {/* FEATURES */}
      <section className="grid md:grid-cols-3 gap-6">
        <div className="border p-6 rounded">
          <h3 className="font-medium">Professional Coaching</h3>
          <p className="text-sm text-gray-500">
            UEFA-qualified coaching staff.
          </p>
        </div>

        <div className="border p-6 rounded">
          <h3 className="font-medium">Player Tracking</h3>
          <p className="text-sm text-gray-500">
            Monitor development and performance.
          </p>
        </div>

        <div className="border p-6 rounded">
          <h3 className="font-medium">Match Experience</h3>
          <p className="text-sm text-gray-500">
            Regular competitive fixtures.
          </p>
        </div>
      </section>

    </div>
  );
}