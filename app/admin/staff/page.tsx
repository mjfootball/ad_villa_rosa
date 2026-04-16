"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DataTable } from "@/components/ui/data-table";
import { staffColumns, Staff } from "./staff-columns";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";

export default function AdminStaff() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [open, setOpen] = useState(false);

  const [selectedStaff, setSelectedStaff] =
    useState<Staff | null>(null);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const router = useRouter();

  /* -------------------------
     LOAD DATA
  ------------------------- */
  const loadData = useCallback(async () => {
    const res = await fetch("/api/admin/staff/list");
    const data = await res.json();

    console.log("📦 STAFF:", data);

    setStaff(data);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* -------------------------
     EDIT
  ------------------------- */
  function handleRowClick(s: Staff) {
    setSelectedStaff(s);
    setFirstName(s.first_name);
    setLastName(s.last_name);
    setEmail(s.email || "");
    setOpen(true);
  }

  /* -------------------------
     CREATE
  ------------------------- */
  async function createStaff() {
    await fetch("/api/admin/staff/create", {
      method: "POST",
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        email,
      }),
    });

    resetForm();
    setOpen(false);
    loadData();
  }

  /* -------------------------
     UPDATE
  ------------------------- */
  async function updateStaff() {
    await fetch("/api/admin/staff/update", {
      method: "POST",
      body: JSON.stringify({
        id: selectedStaff?.id,
        first_name: firstName,
        last_name: lastName,
        email,
      }),
    });

    resetForm();
    setOpen(false);
    loadData();
  }

  /* -------------------------
     DELETE
  ------------------------- */
  async function deleteStaff(s: Staff) {
    if (!confirm(`Delete ${s.first_name}?`)) return;

    await fetch("/api/admin/staff/delete", {
      method: "POST",
      body: JSON.stringify({ id: s.id }),
    });

    loadData();
  }

  function resetForm() {
    setSelectedStaff(null);
    setFirstName("");
    setLastName("");
    setEmail("");
  }

  return (
    <div className="p-10 space-y-6 w-full">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-semibold">Staff</h1>

        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerTrigger asChild>
            <button
              onClick={() => {
                resetForm();
                setOpen(true);
              }}
              className="bg-black text-white px-4 py-2 rounded"
            >
              + Add Staff
            </button>
          </DrawerTrigger>

          <DrawerContent className="p-6">
            <DrawerHeader>
              <DrawerTitle>
                {selectedStaff ? "Edit Staff" : "Add Staff"}
              </DrawerTitle>
            </DrawerHeader>

            <div className="space-y-4">

              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="border p-3 w-full"
              />

              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="border p-3 w-full"
              />

              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="border p-3 w-full"
              />

            </div>

            <DrawerFooter>
              <button
                onClick={
                  selectedStaff ? updateStaff : createStaff
                }
                className="bg-black text-white px-4 py-2 rounded w-full"
              >
                {selectedStaff ? "Update" : "Create"}
              </button>

              {selectedStaff && (
                <button
                  onClick={() => deleteStaff(selectedStaff)}
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

      {/* TABLE */}
      <DataTable
        columns={staffColumns(handleRowClick, deleteStaff)}
        data={staff}
        onRowClick={handleRowClick}
      />
    </div>
  );
}