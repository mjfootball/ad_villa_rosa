"use client";

import type { PlayerForm } from "@/types/forms";

/* -------------------------
   TYPES
------------------------- */
type Props = {
  form: PlayerForm;
  setForm: (updater: (prev: PlayerForm) => PlayerForm) => void;
};

export default function DetailsTab({ form, setForm }: Props) {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-2 gap-6">

        {/* DATE OF BIRTH */}
        <div className="space-y-1">
          <label className="text-sm font-medium text-gray-700">
            Date of birth
          </label>

          <input
            type="date"
            value={form.date_of_birth}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                date_of_birth: e.target.value,
              }))
            }
            className="border p-2 rounded w-full text-sm"
          />
        </div>

      </div>

      {/* MEDICAL NOTES */}
      <div className="space-y-1 max-w-2xl">
        <label className="text-sm font-medium text-gray-700">
          Medical notes
        </label>

        <textarea
          value={form.medical_notes}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              medical_notes: e.target.value,
            }))
          }
          rows={5}
          className="border p-3 rounded w-full resize-none text-sm"
          placeholder="Allergies, injuries, medical conditions..."
        />
      </div>

    </div>
  );
}