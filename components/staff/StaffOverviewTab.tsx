"use client";

import { Input } from "@/components/ui/input";

/* -------------------------
   TYPES
------------------------- */
type StaffForm = {
  first_name: string;
  last_name: string;
  email: string;
  system_role: string;
};

type Props = {
  form: StaffForm;
  setForm: (updater: (prev: StaffForm) => StaffForm) => void;
};

export default function StaffOverviewTab({ form, setForm }: Props) {
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
          Email
        </label>
        <Input
          type="email"
          value={form.email}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              email: e.target.value,
            }))
          }
        />
      </div>

      {/* ROLE */}
      <div className="space-y-1 max-w-sm">
        <label className="text-sm font-medium text-gray-700">
          System Role
        </label>

        <select
          value={form.system_role}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              system_role: e.target.value,
            }))
          }
          className="border p-2 rounded w-full"
        >
          <option value="coach">Coach</option>
          <option value="admin">Admin</option>
          <option value="director">Director</option>
        </select>
      </div>

    </div>
  );
}