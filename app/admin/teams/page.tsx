"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Team } from "@/types/team";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* -------------------------
   TYPES
------------------------- */
type AgeGroup = {
  id: string;
  name_es: string;
};

export default function AdminTeams() {
  const router = useRouter();

  const [teams, setTeams] = useState<Team[]>([]);
  const [ageGroups, setAgeGroups] = useState<AgeGroup[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------------
     FORM STATE
  ------------------------- */
  const [displayName, setDisplayName] = useState("");
  const [teamName, setTeamName] = useState("");
  const [format, setFormat] = useState("F7");
  const [ageGroupId, setAgeGroupId] = useState("");

  /* -------------------------
     LOAD DATA
  ------------------------- */
  async function loadData() {
    try {
      setLoading(true);

      const teamsRes = await fetch("/api/admin/teams/list", {
        cache: "no-store",
      });

      const ageGroupsRes = await fetch("/api/admin/age-groups/list");

      const teamsData = teamsRes.ok ? await teamsRes.json() : [];
      const ageGroupsData = ageGroupsRes.ok
        ? await ageGroupsRes.json()
        : [];

      setTeams(teamsData);
      setAgeGroups(ageGroupsData);

    } catch (err) {
      console.error("❌ LOAD DATA ERROR:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  /* -------------------------
     CREATE TEAM
  ------------------------- */
  async function createTeam() {
    const res = await fetch("/api/admin/teams/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        age_group_id: ageGroupId,
        team_name: teamName,
        display_name: displayName,
        format,
      }),
    });

    if (!res.ok) {
      alert("Failed to create team");
      return;
    }

    /* RESET */
    setDisplayName("");
    setTeamName("");
    setFormat("F7");
    setAgeGroupId("");

    await loadData();
  }

  if (loading) {
    return <div className="p-10">Loading teams...</div>;
  }

  return (
    <div className="p-10 space-y-6 w-full">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Teams</h1>

        {/* ADD TEAM DRAWER */}
        <Drawer>
          <DrawerTrigger asChild>
            <button className="bg-black text-white px-4 py-2 rounded">
              + Add Team
            </button>
          </DrawerTrigger>

          <DrawerContent className="p-6">
            <DrawerHeader>
              <DrawerTitle>Create Team</DrawerTitle>
            </DrawerHeader>

            <div className="space-y-4 mt-4">

              {/* AGE GROUP */}
              <Select
                value={ageGroupId}
                onValueChange={setAgeGroupId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select age group" />
                </SelectTrigger>

                <SelectContent>
                  {ageGroups.map((g) => (
                    <SelectItem key={g.id} value={g.id}>
                      {g.name_es}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* TEAM LETTER */}
              <input
                placeholder="Team letter (A, B...)"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                className="border p-2 rounded w-full"
              />

              {/* DISPLAY NAME */}
              <input
                placeholder="Display name (Alevín A)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="border p-2 rounded w-full"
              />

              {/* FORMAT */}
              <Select value={format} onValueChange={setFormat}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Format" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="F7">F7</SelectItem>
                  <SelectItem value="F11">F11</SelectItem>
                </SelectContent>
              </Select>

            </div>

            <DrawerFooter className="mt-6">
              <button
                onClick={createTeam}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Create Team
              </button>

              <DrawerClose asChild>
                <button className="border px-4 py-2 rounded">
                  Cancel
                </button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Team</TableHead>
            <TableHead>Group</TableHead>
            <TableHead>Format</TableHead>
            <TableHead>Head Coach</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {teams.map((t) => (
            <TableRow
              key={t.id}
              className="cursor-pointer hover:bg-muted"
              onClick={() => router.push(`/admin/teams/${t.id}`)}
            >
              <TableCell>{t.display_name}</TableCell>

              <TableCell>
                {t.age_group_name || "—"}
              </TableCell>

              <TableCell>{t.format}</TableCell>

              <TableCell>
                {t.head_coach || (
                  <span className="text-gray-400">
                    Unassigned
                  </span>
                )}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>

    </div>
  );
}