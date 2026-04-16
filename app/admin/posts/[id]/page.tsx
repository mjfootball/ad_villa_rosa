"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import RichTextEditor from "@/components/editor/rich-text-editor";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/ui/image-upload";

type Post = {
  id: string;
  title: string;
  excerpt?: string | null;
  content?: string | null;
  image_url?: string | null;
  published: boolean;
};

export default function EditPostPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [form, setForm] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    async function load() {
      const res = await fetch(`/api/admin/posts/${id}`);
      const data = await res.json();
      setForm(data);
      setLoading(false);
    }

    load();
  }, [id]);

  async function handleSave() {
    if (!form) return;

    setSaving(true);

    await fetch(`/api/admin/posts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    router.push("/admin/posts");
  }

  async function handleDelete() {
    if (!confirm("Delete this post?")) return;

    await fetch(`/api/admin/posts/${id}`, {
      method: "DELETE",
    });

    router.push("/admin/posts");
  }

  if (loading || !form) {
    return <div className="p-10">Loading...</div>;
  }

  return (
    <div className="p-10 space-y-6">

      <h1 className="text-3xl font-semibold">Edit Post</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* MAIN */}
        <div className="lg:col-span-2 space-y-6">

          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">

              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Excerpt</Label>
                <Input
                  value={form.excerpt || ""}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Content</Label>
                <RichTextEditor
                  content={form.content || ""}
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

          <Card>
  <CardContent className="pt-6 space-y-2">

    <Button
      variant="outline"
      className="w-full"
      onClick={() =>
        window.open(`/news/${id}?preview=true`, "_blank")
      }
    >
      Preview
    </Button>

    <Button
      className="w-full"
      onClick={handleSave}
      disabled={saving}
    >
      {saving ? "Saving..." : "Save Changes"}
    </Button>

    <Button
      variant="destructive"
      className="w-full"
      onClick={handleDelete}
    >
      Delete Post
    </Button>

  </CardContent>
</Card>

        </div>

      </div>

    </div>
  );
}