import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const file = formData.get("file") as File;
    const playerId = formData.get("player_id") as string;

    if (!file || !playerId) {
      return NextResponse.json(
        { error: "Missing file or player_id" },
        { status: 400 }
      );
    }

    // 🔥 Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 🔥 Upload to Cloudinary
    const upload = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "players",
            public_id: playerId,
            overwrite: true,
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });

    const imageUrl = upload.secure_url;

    // 🔥 Save to DB
    const supabase = supabaseService();

    const { error } = await supabase
      .from("players")
      .update({ avatar_url: imageUrl })
      .eq("id", playerId);

    if (error) {
      console.error(error);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    return NextResponse.json({ url: imageUrl });

  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}