"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import PlayerHeader from "@/components/player/PlayerHeader";
import OverviewTab from "@/components/player/OverviewTab";
import DetailsTab from "@/components/player/DetailsTab";
import EmergencyTab from "@/components/player/EmergencyTab";
import PaymentsTab from "@/components/player/PaymentsTab";
import HistoryTab from "@/components/player/HistoryTab";
import TeamTab from "@/components/player/TeamTab";
import PlayingDataTab from "@/components/player/PlayingDataTab";
import type { Player } from "@/types/player";
import type { PlayerForm } from "@/types/forms";

/* -------------------------
   COMPONENT
------------------------- */
export default function PlayerProfileClient({
  player: initialPlayer,
}: {
  player: Player;
}) {
  const router = useRouter();

  const [player] = useState(initialPlayer);
  const [loading, setLoading] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  /* ✅ NEW: SAVE MESSAGE */
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  /* -------------------------
     GLOBAL FORM
  ------------------------- */
  const [form, setForm] = useState<PlayerForm>({
    first_name: initialPlayer.first_name || "",
    last_name: initialPlayer.last_name || "",
    parent_email: initialPlayer.parent_email || "",

    date_of_birth: initialPlayer.date_of_birth?.split("T")[0] || "",
    date_joined:
      (initialPlayer.date_joined || initialPlayer.created_at)
        ?.split("T")[0] || "",

    preferred_foot: initialPlayer.preferred_foot || "",

    notes: initialPlayer.notes || "",
    medical_notes: initialPlayer.medical_notes || "",

    emergency_contact_name:
      initialPlayer.emergency_contact_name || "",
    emergency_contact_phone:
      initialPlayer.emergency_contact_phone || "",

    preferred_position: initialPlayer.preferred_position || "",
    secondary_position: initialPlayer.secondary_position || "",
    height_cm: initialPlayer.height_cm || "",
    strengths: initialPlayer.strengths || "",
    development_notes: initialPlayer.development_notes || "",
    injured: initialPlayer.injured || false,
  });

  /* -------------------------
     DIRTY TRACKING
  ------------------------- */
  function updateForm(
    updater: (prev: PlayerForm) => PlayerForm
  ) {
    setForm((prev) => {
      const updated = updater(prev);

      if (JSON.stringify(prev) !== JSON.stringify(updated)) {
        setIsDirty(true);
      }

      return updated;
    });
  }

  /* -------------------------
     REFRESH PLAYER
  ------------------------- */
  function refreshPlayer() {
    router.refresh();
  }

  /* -------------------------
     SAVE
  ------------------------- */
  async function saveProfile() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/players/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: player.id,
          ...form,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      refreshPlayer();

      setIsDirty(false);

      /* ✅ INLINE SUCCESS MESSAGE */
      setSaveMessage("Changes saved successfully");

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);

    } catch {
      setSaveMessage("Save failed ❌");

      setTimeout(() => {
        setSaveMessage(null);
      }, 3000);
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     REFRESH WARNING
  ------------------------- */
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  /* -------------------------
     LINK GUARD
  ------------------------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!isDirty) return;

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");

      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#")) return;

      if (href.startsWith("/")) {
        e.preventDefault();

        const confirmLeave = window.confirm(
          "You have unsaved changes. Leave without saving?"
        );

        if (confirmLeave) {
          router.push(href);
        }
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [isDirty, router]);

  /* -------------------------
     BACK BUTTON GUARD
  ------------------------- */
  useEffect(() => {
    const handlePopState = () => {
      if (!isDirty) return;

      const confirmLeave = window.confirm(
        "You have unsaved changes. Leave without saving?"
      );

      if (!confirmLeave) {
        history.pushState(null, "", location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () =>
      window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  /* -------------------------
     RENDER
  ------------------------- */
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-6">

      <PlayerHeader player={player} />

      <Tabs defaultValue="overview">

        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="history">Playing History</TabsTrigger>
          <TabsTrigger value="playing">Playing Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab form={form} setForm={updateForm} />
        </TabsContent>

        <TabsContent value="details">
          <DetailsTab form={form} setForm={updateForm} />
        </TabsContent>

        <TabsContent value="team">
          <TeamTab player={player} />
        </TabsContent>

        <TabsContent value="emergency">
          <EmergencyTab form={form} setForm={updateForm} />
        </TabsContent>

        <TabsContent value="payments">
          <PaymentsTab player={player} />
        </TabsContent>

        <TabsContent value="history">
          <HistoryTab player={player} onUpdate={refreshPlayer} />
        </TabsContent>

        <TabsContent value="playing">
          <PlayingDataTab form={form} setForm={updateForm} />
        </TabsContent>

      </Tabs>

      {/* SAVE BAR */}
{(isDirty || saveMessage) && (
  <div className="sticky bottom-0 bg-white border-t p-4 flex justify-between items-center">

    <div className="flex items-center gap-4">
      
      {isDirty && (
        <span className="text-sm text-gray-600">
          You have unsaved changes
        </span>
      )}

      {saveMessage && (
        <span
          className={`text-sm ${
            saveMessage.includes("failed")
              ? "text-red-600"
              : "text-green-600"
          }`}
        >
          {saveMessage}
        </span>
      )}

    </div>

    <button
      onClick={saveProfile}
      disabled={loading}
      className="bg-black text-white px-6 py-2 rounded"
    >
      {loading
        ? "Saving..."
        : isDirty
        ? "Save Changes"
        : "Saved ✓"}
    </button>

  </div>
      )}
    </div>
  );
}