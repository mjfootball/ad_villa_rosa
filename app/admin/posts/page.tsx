"use client";

import { useState } from "react";

export default function AdminPostsPage() {
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);

  /* -------------------------
     SAVE POST
  ------------------------- */
  async function handleSave() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
          image_url: imageUrl,
          published,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Post created ✅");

      setTitle("");
      setExcerpt("");
      setContent("");
      setImageUrl("");
    } catch (err) {
      console.error(err);
      alert("Error ❌");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     IMAGE UPLOAD
  ------------------------- */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/posts/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.url) {
      setImageUrl(data.url);
    }
  }

  return (
    <div className="p-10 max-w-3xl mx-auto space-y-6">

      <h1>Create Post</h1>

      <input
        className="border p-3 w-full"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <input
        className="border p-3 w-full"
        placeholder="Excerpt"
        value={excerpt}
        onChange={(e) => setExcerpt(e.target.value)}
      />

      <textarea
        className="border p-3 w-full h-40"
        placeholder="Content"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      {/* IMAGE */}
      <div className="space-y-2">
        <input type="file" onChange={handleUpload} />

        {imageUrl && (
          <img src={imageUrl} className="w-full h-60 object-cover rounded" />
        )}
      </div>

      {/* PUBLISH */}
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={published}
          onChange={(e) => setPublished(e.target.checked)}
        />
        Publish immediately
      </label>

      <button
        onClick={handleSave}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Post"}
      </button>

    </div>
  );
}