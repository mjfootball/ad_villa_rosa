import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col">

      {/* 🔥 HERO WITH IMAGE */}
      <section className="relative h-screen flex items-center justify-center text-center text-white">

        {/* BACKGROUND IMAGE */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('/images/hero.png')",
          }}
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/60" />

        {/* CONTENT */}
        <div className="relative z-10 max-w-3xl space-y-6 px-6">

          

          <h1 className="text-4xl md:text-6xl font-semibold leading-tight">
            Elite Football Development Platform
          </h1>

          <p className="text-lg text-gray-200 max-w-2xl mx-auto">
            Coaching, player tracking, and parent communication —
            built for modern football academies.
          </p>

          <div className="flex justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="bg-white text-black px-6 py-3 rounded-lg font-medium"
            >
              Join the Academy
            </Link>

            <Link
              href="/sign-in"
              className="border border-white px-6 py-3 rounded-lg"
            >
              Sign In
            </Link>
          </div>

        </div>
      </section>

      {/* FEATURES */}
      <section className="section border-t bg-white">
        <div className="container grid md:grid-cols-3 gap-10">

          <div className="space-y-2">
            <h3>Professional Coaching</h3>
            <p>
              Experienced coaching staff focused on long-term development.
            </p>
          </div>

          <div className="space-y-2">
            <h3>Player Tracking</h3>
            <p>
              Monitor performance, attendance, and growth over time.
            </p>
          </div>

          <div className="space-y-2">
            <h3>Parent Dashboard</h3>
            <p>
              Payments, updates, and communication in one place.
            </p>
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="section border-t text-center">
        <div className="container space-y-4">

          <h2>Ready to get started?</h2>

          <p className="max-w-xl mx-auto">
            Join the academy and manage everything from one simple platform.
          </p>

          <Link
            href="/sign-up"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg mt-4"
          >
            Create Account
          </Link>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t py-8">
        <div className="container flex justify-between text-sm text-muted-foreground">

          <span>© {new Date().getFullYear()} MJ Football</span>

          <div className="flex gap-4">
            <Link href="/contact">Contact</Link>
            <a href="#">Instagram</a>
            <a href="#">Facebook</a>
          </div>

        </div>
      </footer>

    </div>
  );
}