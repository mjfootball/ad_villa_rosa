"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  value?: string;
  onChange: (url: string) => void;
};

export default function ImageUpload({ value, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/admin/posts/upload-image", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.url) {
      onChange(data.url);
    }
  }

  return (
    <div className="space-y-4">

      {/* BUTTON */}
      <Button
        type="button"
        variant="outline"
        className="flex items-center gap-2"
        onClick={() => inputRef.current?.click()}
      >
        <Upload className="w-4 h-4" />
        {value ? "Replace image" : "Upload image"}
      </Button>

      {/* HIDDEN INPUT */}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {/* PREVIEW */}
      {value && (
        <div className="border rounded-lg overflow-hidden">
          <img
            src={value}
            className="w-full h-60 object-cover"
          />
        </div>
      )}

    </div>
  );
}