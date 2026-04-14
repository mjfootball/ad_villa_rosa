import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const supabase = supabaseService();

    const { error } = await supabase.from("posts").insert({
      title: body.title,
      excerpt: body.excerpt,
      content: body.content,
      image_url: body.image_url,
      published: body.published,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}