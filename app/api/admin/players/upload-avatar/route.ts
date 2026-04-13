import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  const supabase = supabaseService();

  const formData = await req.formData();
  const file = formData.get("file") as File;
  const playerId = formData.get("player_id") as string;

  const filePath = `players/${playerId}/${file.name}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  const { data } = supabase.storage
    .from("avatars")
    .getPublicUrl(filePath);

  return NextResponse.json({ url: data.publicUrl });
}