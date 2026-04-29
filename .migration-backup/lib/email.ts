import nodemailer from "nodemailer";

import { getSupportEmail } from "@/lib/site";

const transporter =
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD
    ? nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: Number(process.env.SMTP_PORT) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    : null;

export function isEmailTransportConfigured() {
  return Boolean(transporter);
}

export async function sendContactMessageEmail(payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const supportEmail = getSupportEmail();

  if (!transporter) {
    console.warn("SMTP is not configured. Contact form message captured locally.");
    console.warn(JSON.stringify({ supportEmail, ...payload }, null, 2));
    return {
      delivered: false,
      supportEmail
    };
  }

  await transporter.sendMail({
    to: supportEmail,
    from: process.env.SMTP_FROM,
    replyTo: payload.email,
    subject: `[Risktiq Contact] ${payload.subject}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #0b1220; color: #f8fafc;">
        <h1 style="font-size: 22px; margin-bottom: 12px;">New contact request</h1>
        <p style="line-height: 1.6;"><strong>Name:</strong> ${payload.name}</p>
        <p style="line-height: 1.6;"><strong>Email:</strong> ${payload.email}</p>
        <p style="line-height: 1.6;"><strong>Subject:</strong> ${payload.subject}</p>
        <p style="line-height: 1.8; white-space: pre-wrap;">${payload.message}</p>
      </div>
    `
  });

  return {
    delivered: true,
    supportEmail
  };
}

export async function sendPasswordResetEmail(email: string, resetLink: string) {
  if (!transporter) {
    console.warn("SMTP is not configured. Password reset email skipped.");
    console.warn(`Reset link for ${email}: ${resetLink}`);
    return;
  }

  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM,
    subject: "Reset your Risktiq password",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #0b1220; color: #f8fafc;">
        <h1 style="font-size: 22px; margin-bottom: 12px;">Reset your password</h1>
        <p style="line-height: 1.6;">A password reset was requested for your Risktiq account.</p>
        <p style="line-height: 1.6;">Use the secure link below. It expires in 2 hours.</p>
        <p style="margin: 24px 0;">
          <a
            href="${resetLink}"
            style="display: inline-block; padding: 12px 18px; background: #16ffbb; color: #051016; text-decoration: none; border-radius: 10px; font-weight: bold;"
          >
            Reset Password
          </a>
        </p>
        <p style="line-height: 1.6;">If you did not request this, you can ignore this email.</p>
      </div>
    `
  });
}

export async function sendEmailVerificationEmail(email: string, verificationLink: string) {
  if (!transporter) {
    console.warn("SMTP is not configured. Email verification link generated locally.");
    console.warn(`Verification link for ${email}: ${verificationLink}`);
    return;
  }

  await transporter.sendMail({
    to: email,
    from: process.env.SMTP_FROM,
    subject: "Verify your Risktiq account",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 24px; background: #0b1220; color: #f8fafc;">
        <h1 style="font-size: 22px; margin-bottom: 12px;">Verify your account</h1>
        <p style="line-height: 1.6;">Confirm your email before logging in to your private trading journal.</p>
        <p style="line-height: 1.6;">This verification link expires in 24 hours.</p>
        <p style="margin: 24px 0;">
          <a
            href="${verificationLink}"
            style="display: inline-block; padding: 12px 18px; background: #16ffbb; color: #051016; text-decoration: none; border-radius: 10px; font-weight: bold;"
          >
            Verify Account
          </a>
        </p>
        <p style="line-height: 1.6;">If you did not create this account, you can ignore this email.</p>
      </div>
    `
  });
}
