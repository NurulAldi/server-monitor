import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT ?? 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM = process.env.EMAIL_FROM ?? "no-reply@example.com";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    // eslint-disable-next-line no-console
    console.warn("[email] SMTP not configured - emails will be skipped");
    return null;
  }
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
  return transporter;
}

export async function kirimEmail(to: string, subject: string, text: string, html?: string) {
  const t = getTransporter();
  if (!t) {
    // eslint-disable-next-line no-console
    console.info(`[email] SKIP ${to} ${subject} - transporter tidak dikonfigurasi`);
    return false;
  }

  try {
    await t.sendMail({ from: FROM, to, subject, text, html });
    // eslint-disable-next-line no-console
    console.info(`[email] terkirim ke ${to} - ${subject}`);
    return true;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("[email] gagal mengirim email:", err);
    return false;
  }
}
