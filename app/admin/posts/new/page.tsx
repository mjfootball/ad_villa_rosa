"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RichTextEditor from "@/components/editor/rich-text-editor";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";

export default function CreatePostPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    excerpt: "",
    content: "",
    image_url: "",
    published: true,
  });

  const [loading, setLoading] = useState(false);

  /* -------------------------
     SAVE
  ------------------------- */
  async function handleSave() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/posts/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error();

      router.push("/admin/posts");
    } catch {
      alert("Error creating post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-10 space-y-6">

      <h1 className="text-3xl font-semibold">Create Post</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              {/* TITLE */}
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              {/* EXCERPT */}
              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Input
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Short summary shown in listings
                </p>
              </div>

              {/* CONTENT */}
              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={form.content}
                  onChange={(value) =>
                    setForm({ ...form, content: value })
                  }
                />
              </div>

            </CardContent>
          </Card>

        </div>

        {/* SIDEBAR */}
        <div className="space-y-6">

          {/* MEDIA */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <Label>Cover Image</Label>

              <ImageUpload
                value={form.image_url || undefined} // ✅ FIX
                onChange={(url) =>
                  setForm({ ...form, image_url: url })
                }
              />
            </CardContent>
          </Card>

          {/* SETTINGS */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>

            <CardContent className="flex items-center justify-between">
              <Label>Published</Label>

              <Switch
                checked={form.published}
                onCheckedChange={(checked) =>
                  setForm({ ...form, published: checked })
                }
              />
            </CardContent>
          </Card>

          {/* ACTION */}
          <Card>
            <CardContent className="pt-6">
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Post"}
              </Button>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}