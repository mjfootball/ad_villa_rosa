"use client";

import { useRef, useState } from "react";

type Props = {
  onUpload: (file: File) => Promise<void>;
  currentUrl?: string;
  label?: string;
};

export default function FileUpload({
  onUpload,
  currentUrl,
  label = "Upload file",
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentUrl || null
  );

  async function handleFile(file: File) {
    try {
      setLoading(true);

      const localPreview = URL.createObjectURL(file);
      setPreview(localPreview);

      await onUpload(file);
    } catch (err) {
      console.error(err);
      alert("Upload failed ❌");
    } finally {
      setLoading(false);
    }
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    handleFile(file);
  }

  return (
    <div className="space-y-2">

      {label && (
        <p className="text-sm text-gray-600">{label}</p>
      )}

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border border-dashed rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition flex items-center justify-center"
      >
        {preview ? (
          <img
            src={preview}
            className="w-20 h-20 object-cover rounded-full"
          />
        ) : (
          <div className="text-center text-sm text-gray-500">
            <p>Click or drag file to upload</p>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-xs text-gray-400">Uploading...</p>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  );
}