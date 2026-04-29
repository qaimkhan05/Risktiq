import { logger } from "./logger";

const SMTP_CONFIGURED = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
);

export function isEmailTransportConfigured() {
  return SMTP_CONFIGURED;
}

export function getSupportEmail() {
  return process.env.SUPPORT_EMAIL || process.env.PERMANENT_ADMIN_EMAIL || "support@risktiq.app";
}

export async function sendContactMessageEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const supportEmail = getSupportEmail();
  if (!SMTP_CONFIGURED) {
    logger.warn({ supportEmail, ...payload }, "SMTP not configured. Contact form message captured locally.");
    return { delivered: false, supportEmail };
  }

  // Lazy load nodemailer only when SMTP is configured
  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  });

  await transporter.sendMail({
    to: supportEmail,
    from: process.env.SMTP_FROM,
    replyTo: payload.email,
    subject: `[Risktiq Contact] ${payload.subject}`,
    html: `<p><strong>Name:</strong> ${payload.name}</p><p><strong>Email:</strong> ${payload.email}</p><p><strong>Subject:</strong> ${payload.subject}</p><p>${payload.message}</p>`,
  });
  return { delivered: true, supportEmail };
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!SMTP_CONFIGURED) {
    logger.warn({ email, resetLink }, "SMTP not configured. Password reset link logged.");
    return;
  }
  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  });
  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM,
    subject: "Reset your Risktiq password",
    html: `<p>Reset your password using this link (expires in 2 hours): <a href="${resetLink}">${resetLink}</a></p>`,
  });
}

export async function sendEmailVerificationEmail(email: string, verificationLink: string) {
  if (!SMTP_CONFIGURED) {
    logger.warn({ email, verificationLink }, "SMTP not configured. Verification link logged.");
    return;
  }
  const { default: nodemailer } = await import("nodemailer");
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER!, pass: process.env.SMTP_PASSWORD! },
  });
  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM,
    subject: "Verify your Risktiq account",
    html: `<p>Verify your account using this link (expires in 24 hours): <a href="${verificationLink}">${verificationLink}</a></p>`,
  });
}
