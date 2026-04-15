"use client";

import StaffTeamSelect from "./StaffTeamSelect";

/* -------------------------
   TYPES
------------------------- */
type Staff = {
  id: string;
  teams?: {
    team_id: string;
    team_name: string;
    role?: string | null;
  }[];
};

export default function StaffTeamTab({ staff }: { staff: Staff }) {
  return (
    <div className="space-y-6">

      {/* CURRENT TEAMS */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-gray-700">
          Current Teams
        </p>

        {staff.teams && staff.teams.length > 0 ? (
          staff.teams.map((t) => (
            <div key={t.team_id} className="text-gray-900">
              {t.team_name}{" "}
              <span className="text-gray-400 text-sm">
                ({t.role || "Coach"})
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-sm">
            Unassigned
          </p>
        )}
      </div>

      <div className="border-t" />

      {/* ASSIGN */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Assign to Team
        </p>

        <StaffTeamSelect staffId={staff.id} />
      </div>

    </div>
  );
}