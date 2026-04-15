import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";
import { supabaseService } from "@/lib/supabase/service";
import type { UploadApiResponse } from "cloudinary";

export async function POST(req: Request) {
  try {
    console.log("🔥 STAFF AVATAR UPLOAD START");

    const formData = await req.formData();

    const file = formData.get("file") as File;
    const staffId = formData.get("staff_id") as string;

    if (!file || !staffId) {
      console.warn("⚠️ Missing file or staff_id");

      return NextResponse.json(
        { error: "Missing file or staff_id" },
        { status: 400 }
      );
    }

    console.log("📤 FILE:", file.name);
    console.log("🆔 STAFF ID:", staffId);

    /* -------------------------
       BUFFER
    ------------------------- */
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    /* -------------------------
       CLOUDINARY UPLOAD (FIXED TYPE)
    ------------------------- */
    const upload: UploadApiResponse = await new Promise(
      (resolve, reject) => {
        cloudinary.uploader
          .upload_stream(
            {
              folder: "staff",
              public_id: staffId,
              overwrite: true,
            },
            (error, result) => {
              if (error) {
                console.error("❌ CLOUDINARY ERROR:", error);
                reject(error);
              } else if (result) {
                resolve(result);
              } else {
                reject(new Error("No result returned from Cloudinary"));
              }
            }
          )
          .end(buffer);
      }
    );

    const imageUrl = upload.secure_url;

    console.log("🌐 IMAGE URL:", imageUrl);

    /* -------------------------
       SAVE TO DB
    ------------------------- */
    const supabase = supabaseService();

    const { error } = await supabase
      .from("staff")
      .update({ avatar_url: imageUrl })
      .eq("id", staffId);

    if (error) {
      console.error("❌ DB UPDATE FAILED:", error);

      return NextResponse.json(
        { error: "DB update failed" },
        { status: 500 }
      );
    }

    console.log("✅ STAFF AVATAR SAVED");

    return NextResponse.json({
      url: imageUrl,
    });

  } catch (err) {
    console.error("❌ UPLOAD ERROR:", err);

    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}