"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { columns, Player } from "./columns";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

/* ✅ SINGLE SOURCE OF TRUTH */
const POSITIONS = [
  "GK", "RB", "CB", "LB",
  "CDM", "CM", "CAM",
  "RW", "LW", "ST",
];

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [open, setOpen] = useState(false);

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [dob, setDob] = useState("");
  const [preferredPosition, setPreferredPosition] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const search = searchParams.get("search") || "";
  const positionFilter = searchParams.get("position") || "all";

  /* -------------------------
     LOAD DATA
  ------------------------- */
  const loadData = useCallback(async () => {
    console.log("🔄 FETCHING PLAYERS...");

    const params = new URLSearchParams(searchParams.toString());

    const res = await fetch(
      `/api/admin/players?${params.toString()}`
    );

    const data = await res.json();

    console.log("📦 PLAYERS RESPONSE:", data);

    setPlayers(data);
  }, [searchParams]);

  useEffect(() => {
  async function init() {
    await loadData();
  }

  init();
}, [loadData]);

  /* -------------------------
     SEARCH
  ------------------------- */
  function updateSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) params.set("search", value);
    else params.delete("search");

    router.push(`/admin/players?${params.toString()}`);
  }

  /* -------------------------
     FILTER (preferred_position ONLY)
  ------------------------- */
  function updatePositionFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "all") {
      params.delete("position");
    } else if (positionFilter === value) {
      params.delete("position");
    } else {
      params.set("position", value);
    }

    router.push(`/admin/players?${params.toString()}`);
  }

  /* -------------------------
     EDIT
  ------------------------- */
  function handleRowClick(p: Player) {
    console.log("👤 EDIT PLAYER:", p);

    setSelectedPlayer(p);
    setFirstName(p.first_name);
    setLastName(p.last_name);
    setParentEmail(p.parent_email || "");

    setDob(
      p.date_of_birth
        ? new Date(p.date_of_birth).toISOString().split("T")[0]
        : ""
    );

    /* ✅ ONLY SOURCE */
    setPreferredPosition(p.preferred_position || "");

    setOpen(true);
  }

  /* -------------------------
     CREATE
  ------------------------- */
  async function createPlayer() {
    console.log("➕ CREATING PLAYER");

    await fetch("/api/admin/players/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        parent_email: parentEmail || null,
        date_of_birth: dob || null,
        preferred_position: preferredPosition || null,
      }),
    });

    resetForm();
    setOpen(false);
    loadData();
  }

  /* -------------------------
     UPDATE
  ------------------------- */
  async function updatePlayer() {
    console.log("✏️ UPDATING PLAYER:", selectedPlayer?.id);

    await fetch("/api/admin/players/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: selectedPlayer?.id,
        first_name: firstName,
        last_name: lastName,
        parent_email: parentEmail || null,
        date_of_birth: dob || null,
        preferred_position: preferredPosition || null,
      }),
    });

    resetForm();
    setOpen(false);
    loadData();
  }

  /* -------------------------
     DELETE
  ------------------------- */
  async function deletePlayer(p: Player) {
    const ok = confirm(`Delete ${p.first_name}?`);
    if (!ok) return;

    console.log("🗑️ DELETING PLAYER:", p.id);

    await fetch("/api/admin/players/delete", {
      method: "POST",
      body: JSON.stringify({ id: p.id }),
    });

    if (selectedPlayer?.id === p.id) {
      resetForm();
      setOpen(false);
    }

    loadData();
  }

  /* -------------------------
     RESET
  ------------------------- */
  function resetForm() {
    setSelectedPlayer(null);
    setFirstName("");
    setLastName("");
    setParentEmail("");
    setDob("");
    setPreferredPosition("");
  }

  return (
    <div className="p-10 space-y-6 max-w-6xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Players</h1>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + Add Player
            </button>
          </DrawerTrigger>

          <DrawerContent className="p-6 overflow-visible">
            <DrawerHeader>
              <DrawerTitle>
                {selectedPlayer ? "Edit Player" : "Add Player"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="space-y-5 mt-4">

              {/* FIRST NAME */}
              <div>
                <label className="text-sm text-gray-600">First name</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border p-3 rounded w-full"
                />
              </div>

              {/* LAST NAME */}
              <div>
                <label className="text-sm text-gray-600">Last name</label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border p-3 rounded w-full"
                />
              </div>

              {/* DOB */}
              <div>
                <label className="text-sm text-gray-600">Date of birth</label>

                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="border p-3 rounded w-full flex justify-between"
                    >
                      {dob ? format(new Date(dob), "PPP") : "Select date"}
                      <CalendarIcon className="h-4 w-4 opacity-50" />
                    </button>
                  </PopoverTrigger>

                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dob ? new Date(dob) : undefined}
                      onSelect={(date) => {
                        if (!date) return;
                        setDob(date.toISOString().split("T")[0]);
                      }}
                      captionLayout="dropdown"
                      fromYear={1990}
                      toYear={new Date().getFullYear()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* ✅ ONLY POSITION FIELD */}
              <div>
                <label className="text-sm text-gray-600">
                  Preferred position
                </label>

                <div className="flex flex-wrap gap-2 mt-2">
                  {POSITIONS.map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setPreferredPosition(pos)}
                      className={`px-3 py-1 rounded text-sm border ${
                        preferredPosition === pos
                          ? "bg-black text-white"
                          : "bg-white"
                      }`}
                    >
                      {pos}
                    </button>
                  ))}
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="text-sm text-gray-600">
                  Parent email
                </label>
                <input
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                  className="border p-3 rounded w-full"
                />
              </div>

            </div>

            <DrawerFooter className="mt-6 space-y-2">
              <button
                onClick={
                  selectedPlayer ? updatePlayer : createPlayer
                }
                className="bg-black text-white px-4 py-2 rounded w-full"
              >
                {selectedPlayer ? "Update" : "Create"}
              </button>

              {selectedPlayer && (
                <button
                  onClick={() => deletePlayer(selectedPlayer)}
                  className="bg-red-600 text-white px-4 py-2 rounded w-full"
                >
                  Delete
                </button>
              )}

              <DrawerClose asChild>
                <button className="border px-4 py-2 rounded w-full">
                  Cancel
                </button>
              </DrawerClose>
            </DrawerFooter>

          </DrawerContent>
        </Drawer>
      </div>

      {/* SEARCH */}
      <input
        placeholder="Search players..."
        defaultValue={search}
        onChange={(e) => updateSearch(e.target.value)}
        className="border p-2 rounded w-[250px]"
      />

      {/* FILTER */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => updatePositionFilter("all")}
          className={`px-3 py-1 rounded-full border ${
            positionFilter === "all"
              ? "bg-black text-white"
              : "bg-white"
          }`}
        >
          All
        </button>

        {POSITIONS.map((pos) => (
          <button
            key={pos}
            onClick={() => updatePositionFilter(pos)}
            className={`px-3 py-1 rounded-full border ${
              positionFilter === pos
                ? "bg-black text-white"
                : "bg-white"
            }`}
          >
            {pos}
          </button>
        ))}
      </div>

      {/* TABLE */}
      <DataTable
        columns={columns(handleRowClick, deletePlayer)}
        data={players}
        onRowClick={handleRowClick}
      />
    </div>
  );
}