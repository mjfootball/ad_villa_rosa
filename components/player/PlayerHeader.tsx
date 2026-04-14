"use client";

import { useState, useEffect } from "react";
import { Player } from "@/app/admin/players/[playerId]/player-profile-client";

/* -------------------------
   HELPERS
------------------------- */
function calculateAge(dob?: string | null) {
  if (!dob) return null;

  const birth = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/* -------------------------
   COMPONENT
------------------------- */
export default function PlayerHeader({
  player,
  category,
}: {
  player: Player;
  category?: string | null;
}) {
  const [avatar, setAvatar] = useState(player.avatar_url || "");
  const [uploading, setUploading] = useState(false);

  const hasAvatar = !!avatar;

  const age = calculateAge(player.date_of_birth);

  useEffect(() => {
    console.log("🧠 HEADER PLAYER:", player);
    console.log("📊 HEADER AGE:", age);
    console.log("🏷️ HEADER CATEGORY:", category);
    console.log("👕 HEADER TEAM:", player.team_name);
  }, [player, age, category]);

  /* -------------------------
     UPLOAD AVATAR
  ------------------------- */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);

      console.log("📤 UPLOADING AVATAR:", file.name);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("player_id", player.id);

      const res = await fetch("/api/admin/players/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      console.log("📦 UPLOAD RESPONSE:", data);

      if (data.url) {
        setAvatar(data.url);
        console.log("✅ AVATAR UPDATED");
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
              alt="player avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {player.first_name?.[0]}
              {player.last_name?.[0]}
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
          {player.first_name} {player.last_name}
        </h1>

        {/* META TAGS */}
        <div className="flex items-center gap-2 text-sm flex-wrap">

          {/* AGE */}
          {age !== null && (
            <span className="px-2 py-1 bg-gray-100 rounded">
              Age {age}
            </span>
          )}

          {/* CATEGORY */}
          {category && (
            <span className="px-2 py-1 bg-black text-white rounded">
              {category}
            </span>
          )}

          {/* TEAM */}
          {player.team_name && (
            <span className="px-2 py-1 bg-blue-100 rounded">
              {player.team_name}
            </span>
          )}

        </div>

      </div>
    </div>
  );
}