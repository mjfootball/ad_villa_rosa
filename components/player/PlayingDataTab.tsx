"use client";

type Props = {
  form: any;
  setForm: (updater: any) => void;
};

/* -------------------------
   CONSTANTS
------------------------- */
const POSITIONS = [
  "GK",
  "RB", "CB", "LB",
  "CDM", "CM", "CAM",
  "RW", "LW", "ST",
];

const FEET = ["Left", "Right", "Both"];

/* -------------------------
   COMPONENT
------------------------- */
export default function PlayingDataTab({ form, setForm }: Props) {

  function updateField(key: string, value: any) {
    setForm((prev: any) => ({
      ...prev,
      [key]: value,
    }));
  }

  return (
    <div className="space-y-6">

      {/* PREFERRED POSITION */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Preferred Position
        </label>

        <div className="flex flex-wrap gap-2">
          {POSITIONS.map((pos) => (
            <button
              key={pos}
              onClick={() => updateField("preferred_position", pos)}
              className={`px-3 py-1 rounded border text-sm ${
                form.preferred_position === pos
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {pos}
            </button>
          ))}
        </div>
      </div>

      {/* SECONDARY POSITION */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Secondary Position
        </label>

        <select
          value={form.secondary_position || ""}
          onChange={(e) =>
            updateField("secondary_position", e.target.value)
          }
          className="border p-2 rounded w-full max-w-xs text-sm"
        >
          <option value="">None</option>
          {POSITIONS.map((pos) => (
            <option key={pos} value={pos}>
              {pos}
            </option>
          ))}
        </select>
      </div>

      {/* FOOT */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Preferred Foot
        </label>

        <div className="flex gap-2">
          {FEET.map((foot) => (
            <button
              key={foot}
              onClick={() => updateField("preferred_foot", foot)}
              className={`px-3 py-1 rounded border text-sm ${
                form.preferred_foot === foot
                  ? "bg-black text-white"
                  : "bg-white"
              }`}
            >
              {foot}
            </button>
          ))}
        </div>
      </div>

      {/* HEIGHT */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Height (cm)
        </label>

        <input
          type="number"
          value={form.height_cm || ""}
          onChange={(e) =>
            updateField("height_cm", Number(e.target.value))
          }
          className="border p-2 rounded w-32 text-sm"
        />
      </div>

      {/* STRENGTHS */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Strengths
        </label>

        <textarea
          value={form.strengths || ""}
          onChange={(e) =>
            updateField("strengths", e.target.value)
          }
          className="border p-2 rounded w-full text-sm"
          rows={3}
        />
      </div>

      {/* DEVELOPMENT */}
      <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700">
          Development Focus
        </label>

        <textarea
          value={form.development_notes || ""}
          onChange={(e) =>
            updateField("development_notes", e.target.value)
          }
          className="border p-2 rounded w-full text-sm"
          rows={3}
        />
      </div>

      {/* INJURED */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={form.injured || false}
          onChange={(e) =>
            updateField("injured", e.target.checked)
          }
        />
        <span className="text-sm text-gray-700">
          Injured
        </span>
      </div>

    </div>
  );
}