"use client";

import { Input } from "@/components/ui/input";

export default function EmergencyTab({ form, setForm }) {
  return (
    <div className="space-y-6">

      <div className="space-y-1 max-w-md">
        <p className="text-sm text-gray-600">Emergency contact name</p>

        <Input
          placeholder="e.g. Sarah Smith (Mother)"
          value={form.emergency_contact_name}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              emergency_contact_name: e.target.value,
            }))
          }
        />
      </div>

      <div className="space-y-1 max-w-md">
        <p className="text-sm text-gray-600">Emergency contact phone</p>

        <Input
          placeholder="e.g. +44 7123 456789"
          value={form.emergency_contact_phone}
          onChange={(e) =>
            setForm((prev) => ({
              ...prev,
              emergency_contact_phone: e.target.value,
            }))
          }
        />
      </div>

    </div>
  );
}