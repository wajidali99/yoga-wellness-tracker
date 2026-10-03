import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.EMAIL_FROM ?? "Yoga Wellness <onboarding@resend.dev>";

// simple branded email with one button
export function emailLayout(title: string, body: string, buttonText: string, url: string) {
  return `
  <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#1f2937">
    <h2 style="color:#126959;margin:0 0 16px">🧘 Yoga Wellness Tracker</h2>
    <h3 style="margin:0 0 8px">${title}</h3>
    <p style="color:#4b5563;line-height:1.5">${body}</p>
    <a href="${url}" style="display:inline-block;margin-top:12px;background:#20a385;color:#ffffff;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">${buttonText}</a>
    <p style="color:#9ca3af;font-size:12px;margin-top:28px">If you didn't request this, you can safely ignore this email.</p>
  </div>`;
}

export async function sendEmail({ to, subject, html }: { to: string; subject: string; html: string }) {
  // in development, also print the link in the terminal (handy for test accounts)
  if (process.env.NODE_ENV !== "production") {
    const link = html.match(/href="([^"]+)"/)?.[1] ?? "";
    console.log(`\n📧 Email to ${to} – ${subject}\n   ${link}\n`);
  }
  if (!resend) return;

  try {
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) console.error("Email could not be sent:", error.message);
  } catch (e) {
    console.error("Email could not be sent:", e);
  }
}
