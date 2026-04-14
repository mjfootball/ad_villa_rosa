"use client";

import TeamSelect from "@/components/player/TeamSelect";
import type { Player } from "@/types/player";

/* -------------------------
   TYPES
------------------------- */
type Props = {
  player: Player;
};

export default function TeamTab({ player }: Props) {
  return (
    <div className="space-y-6">

      {/* CURRENT TEAM */}
      <div className="space-y-1">
        <p className="text-sm font-medium text-gray-700">
          Current Team
        </p>

        <p className="text-base text-gray-900">
          {player.team_name || "Unassigned"}
        </p>
      </div>

      {/* SEPARATOR */}
      <div className="border-t" />

      {/* CHANGE TEAM */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-700">
          Change Team
        </p>

        <TeamSelect
          playerId={player.id}
          currentTeamId={player.team_id}
          currentTeamName={player.team_name}
        />
      </div>

    </div>
  );
}