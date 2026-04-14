import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  console.log("📩 Contact message:", body);

  // later: send email / store in DB

  return NextResponse.json({ success: true });
}