"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* -------------------------
   TYPES
------------------------- */
type Staff = {
  id: string;
  first_name: string;
  last_name: string;
  email?: string | null;
  system_role?: string;
  teams?: {
    team_id: string;
    team_name: string;
    role?: string | null;
  }[];
};

export default function StaffProfileClient({
  staff: initialStaff,
}: {
  staff: Staff;
}) {
  const [staff] = useState(initialStaff);

  return (
    <div className="p-10 max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-semibold">
          {staff.first_name} {staff.last_name}
        </h1>

        <p className="text-sm text-gray-500">
          {staff.system_role}
        </p>
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview">

        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview">
          <div className="border p-4 rounded space-y-3">

            <div>
              <span className="text-sm text-gray-500">Email</span>
              <p>{staff.email || "—"}</p>
            </div>

            <div>
              <span className="text-sm text-gray-500">System Role</span>
              <p>{staff.system_role}</p>
            </div>

          </div>
        </TabsContent>

        {/* TEAMS */}
        <TabsContent value="teams">
          <div className="border p-4 rounded space-y-2">

            {staff.teams && staff.teams.length > 0 ? (
              staff.teams.map((t) => (
                <div
                  key={t.team_id}
                  className="flex justify-between"
                >
                  <span>{t.team_name}</span>
                  <span className="text-gray-500 text-sm">
                    {t.role || "Coach"}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm">
                Not assigned to any teams
              </p>
            )}

          </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}