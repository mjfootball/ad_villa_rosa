"use client";

import { Input } from "@/components/ui/input";
import type { PlayerForm } from "@/types/forms";

/* -------------------------
   TYPES
------------------------- */
type Props = {
  form: PlayerForm;
  setForm: (updater: (prev: PlayerForm) => PlayerForm) => void;
};

export default function OverviewTab({ form, setForm }: Props) {
  return (
    <div className="space-y-6">

      {/* NAME */}
      <div className="grid grid-cols-2 gap-4">

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            First Name
          </label>
          <Input
            value={form.first_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                first_name: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Last Name
          </label>
          <Input
            value={form.last_name}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                last_name: e.target.value,
              }))
            }
          />
        </div>

      </div>

      {/* EMAIL */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Parent Email
        </label>
        <Input
          type="email"
          value={form.parent_email}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              parent_email: e.target.value,
            }))
          }
        />
      </div>

      {/* DATE JOINED (READ ONLY) */}
      <div className="space-y-1 max-w-sm">
        <label className="text-sm font-medium text-gray-700">
          Date Joined
        </label>

        <div className="border rounded px-3 py-2 bg-gray-50 text-gray-700 text-sm">
          {form.date_joined || "—"}
        </div>

        <p className="text-xs text-gray-500">
          This is set automatically when the player is created
        </p>
      </div>

    </div>
  );
}