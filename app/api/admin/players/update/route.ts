import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

/* -------------------------
   TYPES
------------------------- */
type UpdatePlayerBody = {
  id: string;

  first_name?: string | null;
  last_name?: string | null;
  parent_email?: string | null;

  preferred_position?: string | null;
  secondary_position?: string | null;

  preferred_foot?: string | null;

  height_cm?: number | string | null;
  strengths?: string | null;
  development_notes?: string | null;
  injured?: boolean | null;

  date_of_birth?: string | null;
  date_joined?: string | null;

  notes?: string | null;
  medical_notes?: string | null;

  avatar_url?: string | null;

  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
};

/* 🔥 PARTIAL TYPE (KEY FIX) */
type UpdateData = Partial<{
  first_name: string | null;
  last_name: string | null;
  parent_email: string | null;

  preferred_position: string | null;
  secondary_position: string | null;

  preferred_foot: string | null;

  height_cm: number | null;
  strengths: string | null;
  development_notes: string | null;
  injured: boolean;

  date_of_birth: string | null;
  date_joined: string | null;

  notes: string | null;
  medical_notes: string | null;

  avatar_url: string | null;

  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
}>;

export async function POST(req: Request) {
  try {
    console.log("🔥 ===============================");
    console.log("🔥 UPDATE PLAYER START");

    const body: UpdatePlayerBody = await req.json();
    console.log("📦 RAW REQUEST BODY:", body);

    const { id } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const supabase = supabaseService();

    /* -------------------------
       CONSTANTS
    ------------------------- */
    const validFeet = ["Left", "Right", "Both"];

    const validPositions = [
      "GK",
      "RB", "CB", "LB",
      "CDM", "CM", "CAM",
      "RW", "LW", "ST",
    ];

    /* -------------------------
       HELPERS
    ------------------------- */
    const cleanString = (value?: string | null) => {
      if (value === undefined || value === null) return null;
      const trimmed = value.trim();
      return trimmed === "" ? null : trimmed;
    };

    const formatDate = (d?: string | null) => {
      if (!d) return null;
      try {
        return new Date(d).toISOString().split("T")[0];
      } catch {
        return null;
      }
    };

    const cleanEmail = (email?: string | null) => {
      if (!email) return null;
      return email.toLowerCase().trim();
    };

    const cleanPosition = (value?: string | null) => {
      const cleaned = cleanString(value);
      if (!cleaned) return null;

      const upper = cleaned.toUpperCase();
      return validPositions.includes(upper) ? upper : null;
    };

    const cleanFoot = (value?: string | null) => {
      const cleaned = cleanString(value);
      if (!cleaned) return null;

      const normalised =
        cleaned.charAt(0).toUpperCase() +
        cleaned.slice(1).toLowerCase();

      return validFeet.includes(normalised) ? normalised : null;
    };

    /* -------------------------
       BUILD UPDATE OBJECT (SAFE)
    ------------------------- */
    const updateData: UpdateData = {};

    if ("first_name" in body)
      updateData.first_name = cleanString(body.first_name);

    if ("last_name" in body)
      updateData.last_name = cleanString(body.last_name);

    if ("parent_email" in body)
      updateData.parent_email = cleanEmail(body.parent_email);

    if ("preferred_position" in body)
      updateData.preferred_position = cleanPosition(body.preferred_position);

    if ("secondary_position" in body)
      updateData.secondary_position = cleanPosition(body.secondary_position);

    if ("preferred_foot" in body)
      updateData.preferred_foot = cleanFoot(body.preferred_foot);

    if ("height_cm" in body)
      updateData.height_cm = body.height_cm
        ? Number(body.height_cm)
        : null;

    if ("strengths" in body)
      updateData.strengths = cleanString(body.strengths);

    if ("development_notes" in body)
      updateData.development_notes = cleanString(body.development_notes);

    if ("injured" in body)
      updateData.injured = body.injured ?? false;

    if ("date_of_birth" in body)
      updateData.date_of_birth = formatDate(body.date_of_birth);

    if ("date_joined" in body)
      updateData.date_joined = formatDate(body.date_joined);

    if ("notes" in body)
      updateData.notes = cleanString(body.notes);

    if ("medical_notes" in body)
      updateData.medical_notes = cleanString(body.medical_notes);

    /* 🔥 CRITICAL FIX */
    if ("avatar_url" in body)
      updateData.avatar_url = cleanString(body.avatar_url);

    if ("emergency_contact_name" in body)
      updateData.emergency_contact_name = cleanString(body.emergency_contact_name);

    if ("emergency_contact_phone" in body)
      updateData.emergency_contact_phone = cleanString(body.emergency_contact_phone);

    console.log("🧠 FINAL SAFE UPDATE:", updateData);

    /* -------------------------
       UPDATE
    ------------------------- */
    const { data, error } = await supabase
      .from("players")
      .update(updateData)
      .eq("id", id)
      .select();

    if (error) {
      console.error("❌ PLAYER UPDATE FAILED:", error);
      return NextResponse.json({ error }, { status: 500 });
    }

    console.log("✅ PLAYER UPDATED SUCCESSFULLY");

    return NextResponse.json({ success: true, data });

  } catch (err) {
    console.error("❌ SERVER ERROR:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}