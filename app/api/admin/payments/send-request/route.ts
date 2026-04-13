import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { player_id } = await req.json();

    if (!player_id) {
      return NextResponse.json(
        { error: "Missing player_id" },
        { status: 400 }
      );
    }

    const supabase = supabaseService();

    /* -------------------------
       GET PLAYER + EMAIL
    ------------------------- */
    const { data: player, error } = await supabase
      .from("players")
      .select("id, first_name, last_name, parent_email")
      .eq("id", player_id)
      .single();

    if (error || !player) {
      return NextResponse.json(
        { error: "Player not found" },
        { status: 404 }
      );
    }

    if (!player.parent_email) {
      return NextResponse.json(
        { error: "No parent email" },
        { status: 400 }
      );
    }

    /* -------------------------
       CREATE DASHBOARD LINK (✅ FIX)
    ------------------------- */
    const paymentLink = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?player_id=${player.id}`;

    /* -------------------------
       SEND EMAIL
    ------------------------- */
    await resend.emails.send({
      from: "Academy <matt@mjfootball.com>",
      to: player.parent_email,
      subject: `Payment request for ${player.first_name}`,
      html: `
        <div style="font-family: sans-serif; line-height: 1.5">
          <h2>Payment Request</h2>

          <p>Hi,</p>

          <p>
            A payment is due for 
            <strong>${player.first_name} ${player.last_name}</strong>.
          </p>

          <p>Please log in and complete payment:</p>

          <p>
            <a href="${paymentLink}" 
               style="display:inline-block;padding:10px 16px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">
              View & Pay
            </a>
          </p>

          <p>Thank you.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}