"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* -------------------------
   TYPES
------------------------- */
type Subscription = {
  id: string;
  status: string;
  amount: number;
  created_at: string;
  paid_at?: string | null;
  next_due_date?: string | null;
};

type Player = {
  id: string;
  first_name: string;
  last_name: string;
  parent_email?: string | null;
  date_of_birth?: string | null;
  notes?: string | null;
  medical_notes?: string | null;
  avatar_url?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;

  subscriptions?: Subscription[];
};

/* -------------------------
   HELPERS
------------------------- */
function formatDate(date?: string | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString();
}

/* -------------------------
   COMPONENT
------------------------- */
export default function PlayerProfileClient({
  player,
}: {
  player: Player;
}) {
  const [firstName, setFirstName] = useState(player.first_name || "");
  const [lastName, setLastName] = useState(player.last_name || "");
  const [email, setEmail] = useState(player.parent_email || "");

  const [dob, setDob] = useState(
    player.date_of_birth
      ? player.date_of_birth.split("T")[0]
      : ""
  );

  const [notes, setNotes] = useState(player.notes || "");
  const [medical, setMedical] = useState(player.medical_notes || "");
  const [avatar, setAvatar] = useState(player.avatar_url || "");

  const [emergencyName, setEmergencyName] = useState(
    player.emergency_contact_name || ""
  );
  const [emergencyPhone, setEmergencyPhone] = useState(
    player.emergency_contact_phone || ""
  );

  const [loading, setLoading] = useState(false);

  /* -------------------------
     SAVE
  ------------------------- */
  async function saveProfile() {
    try {
      setLoading(true);

      const res = await fetch("/api/admin/players/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: player.id,
          first_name: firstName,
          last_name: lastName,
          parent_email: email,
          date_of_birth: dob || null,
          notes,
          medical_notes: medical,
          avatar_url: avatar,
          emergency_contact_name: emergencyName,
          emergency_contact_phone: emergencyPhone,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      alert("Saved ✅");
    } catch (err) {
      console.error(err);
      alert("Save failed ❌");
    } finally {
      setLoading(false);
    }
  }

  /* -------------------------
     UPLOAD AVATAR
  ------------------------- */
  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("player_id", player.id);

    const res = await fetch("/api/admin/players/upload-avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.url) setAvatar(data.url);
  }

  /* -------------------------
     UI
  ------------------------- */
  return (
    <div className="p-10 max-w-5xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-lg font-medium">
          {avatar ? (
            <img
              src={avatar}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>
              {firstName?.[0]}
              {lastName?.[0]}
            </span>
          )}
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-semibold">
            {firstName} {lastName}
          </h1>

          <input type="file" onChange={handleUpload} />
        </div>
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview">

        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="emergency">Emergency</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </div>

          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </TabsContent>

        {/* DETAILS */}
        <TabsContent value="details" className="space-y-4">
          <input
            type="date"
            value={dob || ""}
            onChange={(e) => setDob(e.target.value)}
            className="border p-2 rounded w-full"
          />

          <Input value={medical} onChange={(e) => setMedical(e.target.value)} />
          <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
        </TabsContent>

        {/* EMERGENCY */}
        <TabsContent value="emergency" className="space-y-4">
          <Input value={emergencyName} onChange={(e) => setEmergencyName(e.target.value)} />
          <Input value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)} />
        </TabsContent>

        {/* 💰 PAYMENTS TABLE */}
        <TabsContent value="payments" className="space-y-4">

          {player.subscriptions?.length ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Paid</TableHead>
                  <TableHead>Next Due</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {player.subscriptions.map((sub, index) => {
                  const isActive = sub.status === "active";

                  const isOverdue =
                    sub.status !== "active" &&
                    sub.next_due_date &&
                    new Date(sub.next_due_date) < new Date();

                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-medium">
                        INV-{index + 1}
                      </TableCell>

                      <TableCell
                        className={
                          isActive
                            ? "text-green-600"
                            : isOverdue
                            ? "text-red-600"
                            : "text-gray-500"
                        }
                      >
                        {isActive
                          ? "Active"
                          : isOverdue
                          ? "Overdue"
                          : "Unpaid"}
                      </TableCell>

                      <TableCell>{formatDate(sub.paid_at)}</TableCell>
                      <TableCell>{formatDate(sub.next_due_date)}</TableCell>

                      <TableCell className="text-right">
                        €{(sub.amount / 100).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          ) : (
            <div className="border p-6 rounded text-sm text-gray-500">
              No payments found
            </div>
          )}

        </TabsContent>

      </Tabs>

      {/* SAVE */}
      <button
        onClick={saveProfile}
        disabled={loading}
        className="bg-black text-white px-6 py-2 rounded"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>

    </div>
  );
}