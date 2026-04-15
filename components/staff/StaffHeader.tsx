"use client";

import { useState, useEffect } from "react";

/* -------------------------
   TYPES
------------------------- */
type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
  system_role?: string;
};

/* -------------------------
   COMPONENT
------------------------- */
export default function StaffHeader({
  staff,
}: {
  staff: Staff;
}) {
  const [avatar, setAvatar] = useState(staff.avatar_url || "");
  const [uploading, setUploading] = useState(false);

  const hasAvatar = !!avatar;

  useEffect(() => {
    console.log("🧠 STAFF HEADER:", staff);
  }, [staff]);

  /* -------------------------
     UPLOAD AVATAR
  ------------------------- */
  async function handleUpload(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      console.log("📤 UPLOADING STAFF AVATAR:", file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("staff_id", staff.id);

      const res = await fetch("/api/admin/staff/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("📦 UPLOAD RESPONSE:", data);

      if (data.url) {
        setAvatar(data.url);
        console.log("✅ STAFF AVATAR UPDATED");
      } else {
        console.warn("⚠️ NO URL RETURNED");
      }

    } catch (err) {
      console.error("❌ UPLOAD FAILED", err);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  }

  /* -------------------------
     RENDER
  ------------------------- */
  return (
    <div className="flex items-center gap-6">

      {/* AVATAR */}
      <div className="relative">

        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-lg font-medium">
          {hasAvatar ? (
            <img
              src={avatar}
              alt="staff avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {staff.first_name?.[0]}
              {staff.last_name?.[0]}
            </span>
          )}
        </div>

        {/* ACTION BUTTON */}
        <label className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1 rounded cursor-pointer">
          {uploading ? "..." : hasAvatar ? "Edit" : "Add"}

          <input
            type="file"
            className="hidden"
            onChange={handleUpload}
          />
        </label>

      </div>

      {/* INFO */}
      <div className="space-y-2">

        <h1 className="text-3xl font-semibold">
          {staff.first_name} {staff.last_name}
        </h1>

        {/* META */}
        <div className="flex items-center gap-2 text-sm flex-wrap">

          {staff.system_role && (
            <span className="px-2 py-1 bg-black text-white rounded">
              {staff.system_role}
            </span>
          )}

        </div>

      </div>
    </div>
  );
}