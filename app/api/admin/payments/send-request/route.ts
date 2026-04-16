import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { player_id } = await req.json();

    /* -------------------------
       VALIDATION
    ------------------------- */
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
       GET OUTSTANDING CHARGES
    ------------------------- */
    const { data: charges, error: chargeError } = await supabase
      .from("charges")
      .select("id, amount, month")
      .eq("player_id", player.id)
      .eq("status", "pending")
      .order("month", { ascending: true });

    if (chargeError) {
      console.error("❌ charge fetch error", chargeError);
      return NextResponse.json(null, { status: 500 });
    }

    const safeCharges = charges || [];

    const totalDue = safeCharges.reduce(
      (sum, c) => sum + c.amount,
      0
    );

    /* -------------------------
       NO BALANCE → STOP
    ------------------------- */
    if (totalDue <= 0) {
      return NextResponse.json({
        message: "No outstanding balance",
      });
    }

    console.log("📧 Sending reminder:", {
      player: player.id,
      totalDue,
    });

    /* -------------------------
       FORMAT BREAKDOWN
    ------------------------- */
    const breakdown = safeCharges
      .map((c) => {
        const date = new Date(c.month);
        const formatted = date.toLocaleDateString("en-GB", {
          month: "short",
          year: "numeric",
        });

        return `
          <div>
            ${formatted} — €${(c.amount / 100).toFixed(2)}
          </div>
        `;
      })
      .join("");

    /* -------------------------
       DASHBOARD LINK
    ------------------------- */
    const paymentLink = `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?player_id=${player.id}`;

    /* -------------------------
       SEND EMAIL
    ------------------------- */
    const { error: emailError } = await resend.emails.send({
      from: "MJ Football Academy <payments@mjfootball.com>",
      to: player.parent_email,
      subject: `Payment reminder for ${player.first_name}`,

      html: `
        <div style="font-family: sans-serif; line-height: 1.6; max-width: 500px; margin: auto;">
          
          <h2 style="margin-bottom: 10px;">Payment reminder</h2>

          <p>Hi,</p>

          <p>
            Just a quick reminder that there are outstanding academy fees for 
            <strong>${player.first_name} ${player.last_name}</strong>.
          </p>

          <p style="font-size:18px; margin:16px 0;">
            <strong>Amount due: €${(totalDue / 100).toFixed(2)}</strong>
          </p>

          <div style="margin: 16px 0; padding: 12px; background:#f5f5f5; border-radius:6px;">
            ${breakdown}
          </div>

          <p>
            You can complete payment using the link below:
          </p>

          <p>
            <a href="${paymentLink}" 
              style="
                display:inline-block;
                padding:12px 18px;
                background:#16a34a;
                color:white;
                text-decoration:none;
                border-radius:6px;
                font-weight:600;
              ">
              Pay now
            </a>
          </p>

          <p style="margin-top:16px; font-size:13px; color:#666;">
            If you’ve already made this payment recently, you can ignore this message.
          </p>

          <p style="margin-top:20px;">
            Thanks,<br/>
            MJ Football Academy
          </p>

        </div>
      `,
    });

    if (emailError) {
      console.error("❌ Email send failed", emailError);
      return NextResponse.json(null, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err) {
    console.error("❌ reminder error:", err);

    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}