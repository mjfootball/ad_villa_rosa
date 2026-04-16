import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const { email, url, amount } = await req.json();

  await resend.emails.send({
    from: "Academy <payments@mjfootball.com>",
    to: email,
    subject: "Payment retry required",

    html: `
      <div style="font-family:sans-serif">
        <h2>Payment reminder</h2>

        <p>
      This is a reminder that there is an outstanding payment on your account.
    </p>

        <p>
      Amount due: <strong>€${(amount / 100).toFixed(2)}</strong>
    </p>

    <p>
      Please complete payment using the link below:
    </p>

    <a href="${url}" 
       style="padding:12px 18px;background:#16a34a;color:white;text-decoration:none;border-radius:6px;">
      Pay Now
    </a>

        <p style="margin-top:20px;">
      Thank you.
    </p>
      </div>
    `,
  });

  return NextResponse.json({ success: true });
}