"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { DataTable } from "./data-table";
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

const POSITIONS = ["GK", "DF", "CM", "FW"];

export default function AdminPlayers() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const [selectedPlayer, setSelectedPlayer] =
    useState<Player | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [teamId, setTeamId] = useState("none");
  const [position, setPosition] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();

  /* -------------------------
     FILTER STATE (URL DRIVEN)
  ------------------------- */
  const search = searchParams.get("search") || "";
  const positionFilter = searchParams.get("position") || "all";
  const teamFilter = searchParams.get("team") || "all";

  /* -------------------------
     LOAD DATA
  ------------------------- */
  async function loadData() {
    const params = new URLSearchParams(searchParams.toString());

    const p = await fetch(
      `/api/admin/players?${params.toString()}`
    ).then((r) => r.json());

    const t = await fetch("/api/admin/teams/list").then((r) =>
      r.json()
    );

    setPlayers(p);
    setTeams(t);
  }

  useEffect(() => {
    loadData();
  }, [searchParams]);

  /* -------------------------
     SEARCH
  ------------------------- */
  function updateSearch(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    value
      ? params.set("search", value)
      : params.delete("search");

    router.push(`/admin/players?${params.toString()}`);
  }

  /* -------------------------
     POSITION FILTER
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
     TEAM FILTER
  ------------------------- */
  function updateTeamFilter(value: string) {
    const params = new URLSearchParams(searchParams.toString());

    value !== "all"
      ? params.set("team", value)
      : params.delete("team");

    router.push(`/admin/players?${params.toString()}`);
  }

  /* -------------------------
     OPEN DRAWER (EDIT)
  ------------------------- */
  function handleRowClick(p: Player) {
    setSelectedPlayer(p);
    setFirstName(p.first_name);
    setLastName(p.last_name);
    setParentEmail(p.parent_email || "");
    setTeamId(p.team_id || "none");
    setPosition(p.position || "");
    setOpen(true);
  }

  /* -------------------------
     CRUD
  ------------------------- */
  async function createPlayer() {
    await fetch("/api/admin/players/create", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        parent_email: parentEmail,
        team_id: teamId === "none" ? null : teamId,
        position,
      }),
    });

    resetForm();
    setOpen(false);
    loadData();
  }

  async function updatePlayer() {
    await fetch("/api/admin/players/update", {
      method: "POST",
      body: JSON.stringify({
        id: selectedPlayer?.id,
        first_name: firstName,
        last_name: lastName,
        parent_email: parentEmail,
        team_id: teamId === "none" ? null : teamId,
        position,
      }),
    });

    resetForm();
    setOpen(false);
    loadData();
  }

  async function deletePlayer(p: Player) {
    const ok = confirm(`Delete ${p.first_name}?`);
    if (!ok) return;

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

  function resetForm() {
    setSelectedPlayer(null);
    setFirstName("");
    setLastName("");
    setParentEmail("");
    setTeamId("none");
    setPosition("");
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

          <DrawerContent className="p-6">
            <DrawerHeader>
              <DrawerTitle>
                {selectedPlayer ? "Edit Player" : "Add Player"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="space-y-4 mt-4">
              <input
                placeholder="First name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <input
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <div className="flex gap-2 flex-wrap">
                {POSITIONS.map((pos) => (
                  <button
                    key={pos}
                    type="button"
                    onClick={() => setPosition(pos)}
                    className={`px-3 py-1 rounded-full border ${
                      position === pos
                        ? "bg-black text-white"
                        : "bg-white"
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>

              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="border p-2 rounded w-full"
              >
                <option value="none">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.display_name}
                  </option>
                ))}
              </select>

              <input
                placeholder="Parent email"
                value={parentEmail}
                onChange={(e) =>
                  setParentEmail(e.target.value)
                }
                className="border p-2 rounded w-full"
              />
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

      {/* SEARCH + TEAM */}
      <div className="flex gap-3 items-center">
        <input
          placeholder="Search players..."
          defaultValue={search}
          onChange={(e) => updateSearch(e.target.value)}
          className="border p-2 rounded w-[250px]"
        />

        <select
          value={teamFilter}
          onChange={(e) => updateTeamFilter(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="all">All teams</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.display_name}
            </option>
          ))}
        </select>
      </div>

      {/* POSITION FILTER */}
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