"use client";

import { useState } from "react";

export default function ContactPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: (e.target as any).name.value,
        email: (e.target as any).email.value,
        message: (e.target as any).message.value,
      }),
    });

    alert("Message sent!");
    setLoading(false);
  }

  return (
    <div className="max-w-xl mx-auto p-10">
      <h1 className="text-2xl font-semibold mb-4">Contact Us</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input name="name" placeholder="Your name" className="border p-3 w-full" required />
        <input name="email" placeholder="Your email" className="border p-3 w-full" required />
        <textarea name="message" placeholder="Message" className="border p-3 w-full" required />

        <button className="bg-black text-white px-4 py-2 rounded">
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
}