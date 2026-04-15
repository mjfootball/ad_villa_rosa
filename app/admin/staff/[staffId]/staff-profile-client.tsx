"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import StaffOverviewTab from "@/components/staff/StaffOverviewTab";
import StaffTeamTab from "@/components/staff/StaffTeamTab";

/* -------------------------
   TYPES
------------------------- */
type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  system_role?: string;
  avatar_url?: string | null;
  teams?: {
    team_id: string;
    team_name: string;
    role?: string | null;
  }[];
};

type StaffForm = {
  first_name: string;
  last_name: string;
  email: string;
  system_role: string;
};

export default function StaffProfileClient({
  staff: initialStaff,
}: {
  staff: Staff;
}) {
  const [staff, setStaff] = useState(initialStaff);
  const [uploading, setUploading] = useState(false);

  const hasAvatar = !!staff.avatar_url;

  /* -------------------------
     FORM (LIKE PLAYER)
  ------------------------- */
  const [form, setForm] = useState<StaffForm>({
    first_name: staff.first_name || "",
    last_name: staff.last_name || "",
    email: staff.email || "",
    system_role: staff.system_role || "coach",
  });

  function updateForm(
    updater: (prev: StaffForm) => StaffForm
  ) {
    setForm((prev) => updater(prev));
  }

  /* -------------------------
     UPLOAD AVATAR
  ------------------------- */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("staff_id", staff.id);

      const res = await fetch("/api/admin/staff/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        alert("Upload failed ❌");
        return;
      }

      setStaff((prev) => ({
        ...prev,
        avatar_url: data.url || data.avatar_url,
      }));

    } catch (err) {
      console.error("❌ UPLOAD ERROR", err);
      alert("Upload failed ❌");
    } finally {
      setUploading(false);
    }
  }

  /* -------------------------
     SAVE PROFILE (NEW)
  ------------------------- */
  async function saveProfile() {
    const res = await fetch("/api/admin/staff/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: staff.id,
        ...form,
      }),
    });

    if (!res.ok) {
      alert("Save failed ❌");
      return;
    }

    alert("Saved ✅");

    setStaff((prev) => ({
      ...prev,
      ...form,
    }));
  }

  /* -------------------------
     RENDER
  ------------------------- */
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-6">

      {/* =========================
         HEADER
      ========================= */}
      <div className="flex items-center gap-6">

        <div className="relative">

          <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-lg font-medium">
            {hasAvatar ? (
              <img
                src={staff.avatar_url!}
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

          <label className="absolute bottom-0 right-0 bg-black text-white text-xs px-2 py-1 rounded cursor-pointer">
            {uploading ? "..." : hasAvatar ? "Edit" : "Add"}

            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="hidden"
            />
          </label>

        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            {staff.first_name} {staff.last_name}
          </h1>

          <div className="flex gap-2 text-sm">
            <span className="px-2 py-1 bg-black text-white rounded">
              {staff.system_role}
            </span>
          </div>
        </div>

      </div>

      {/* =========================
         TABS
      ========================= */}
      <Tabs defaultValue="overview">

        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>

          {/* 🔥 FUTURE READY */}
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <StaffOverviewTab form={form} setForm={updateForm} />
        </TabsContent>

        {/* TEAMS */}
        <TabsContent value="teams">
          <StaffTeamTab staff={staff} />
        </TabsContent>

        {/* NOTES (placeholder) */}
        <TabsContent value="notes">
          <div className="border p-4 rounded text-gray-400">
            Coach notes coming soon
          </div>
        </TabsContent>

        {/* SCHEDULE (placeholder) */}
        <TabsContent value="schedule">
          <div className="border p-4 rounded text-gray-400">
            Availability & schedule coming soon
          </div>
        </TabsContent>

      </Tabs>

      {/* SAVE BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={saveProfile}
          className="bg-black text-white px-6 py-2 rounded"
        >
          Save Changes
        </button>
      </div>

    </div>
  );
}