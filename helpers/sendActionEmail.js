// helpers/sendActionEmail.js
import { sendEmail } from "./sendEmail.js";

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";
const EMAIL_TZ = process.env.EMAIL_TZ || "Europe/Berlin";
const SITE_URL = process.env.SITE_URL || "https://elevestiq.com";
const BRAND = {
  name: "ElevestIQ",
  tagline: "Smart Startups. Trusted Investors.",
  headerFrom: "#0A1F44",
  headerTo: "#123C78",
  cta: "#0A74FF",
  bg: "#f5f8fc",
  footerBg: "#f0f4fa",
  footerLink: "#0A74FF",
};

const SUBJECTS = {
  email_verify:   "Email Verification",
  password_reset: "Password Reset",
  email_change:   "Confirm Email Change",
  login_verify:   "Confirm Login",
};

const CTA = {
  email_verify:   "Verify Email",
  password_reset: "Reset Password",
  email_change:   "Confirm Email",
  login_verify:   "Confirm Login",
};

const DEFAULT_TEXT = {
  email_verify:
    "Welcome to ElevestIQ! Click the button below to verify your email and unlock AI-powered matching, legal support, and secure signing.",
  password_reset:
    "We received a request to reset your password.",
  email_change:
    "Please confirm your new email address.",
  login_verify:
    "Confirm that it was you trying to sign in.",
};

const buildLink = (type, token) => {
  const t = encodeURIComponent(token);
  switch (type) {
    case "email_verify":   return `${FRONTEND_URL}/verify/${t}`;
    case "password_reset": return `${FRONTEND_URL}/resetPassword/${t}`;
    case "email_change":   return `${FRONTEND_URL}/confirm-email-change/${t}`;
    case "login_verify":   return `${FRONTEND_URL}/login-verify/${t}`;
    default:               return `${FRONTEND_URL}/action/${t}`;
  }
};

const escapeHtml = (s = "") =>
  s.replace(/[&<>\"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[m]));

const renderEmail = ({ name, title, message, ctaUrl, ctaLabel, requestedAt, expiresAt }) => {
  const safeName = escapeHtml(name || "there");
  const expiresNote = expiresAt
    ? `<p style="font-size:12px; color:#777; margin-top:8px;">
         This link expires on <strong>${expiresAt}</strong>.
       </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>${escapeHtml(title)}</title>
</head>
<body style="margin:0; padding:0; background-color:${BRAND.bg}; font-family:Arial, sans-serif; color:#333;">
  <!-- Preheader -->
  <div style="display:none; font-size:1px; color:${BRAND.bg}; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
    Verify your email to access AI-powered startup–investor matching on ${BRAND.name}.
  </div>

  <table align="center" width="100%" cellpadding="0" cellspacing="0"
         style="max-width:600px; margin:0 auto; background:#fff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,.05);">
    <!-- Header -->
    <tr>
      <td style="background:linear-gradient(135deg, ${BRAND.headerFrom}, ${BRAND.headerTo}); padding:28px; text-align:center;">
        <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:600;">${BRAND.name}</h1>
        <p style="margin:8px 0 0; color:#d0e0f5; font-size:14px;">${BRAND.tagline}</p>
      </td>
    </tr>

    <!-- Content -->
    <tr>
      <td style="padding:32px;">
        <h2 style="margin:0 0 16px; font-size:22px; color:${BRAND.headerFrom};">Hello, ${safeName}!</h2>
        <p style="margin:0 0 20px; font-size:16px; line-height:1.5;">${escapeHtml(message)}</p>
        <p style="text-align:center; margin:28px 0;">
          <a href="${ctaUrl}"
             style="background:${BRAND.cta}; color:#fff; padding:14px 40px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
            ${escapeHtml(ctaLabel)}
          </a>
        </p>
        <p style="font-size:14px; color:#666; line-height:1.5; text-align:center;">
          If you didn’t request this, simply ignore this email.
        </p>
        <p style="font-size:12px; color:#777; margin-top:16px; text-align:center;">
          Requested on <strong>${requestedAt}</strong> (${EMAIL_TZ}).
        </p>
        ${expiresNote}
      </td>
    </tr>

    <!-- Footer -->
    <tr>
      <td style="background:${BRAND.footerBg}; padding:18px; text-align:center; font-size:12px; color:#888;">
        © ${new Date().getFullYear()} ${BRAND.name}. All rights reserved.<br>
        <a href="${SITE_URL}" style="color:${BRAND.footerLink}; text-decoration:none;">Visit Website</a>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

export const sendActionEmail = async ({ type, to, name, token, text, expiresAt }) => {
  const requestedAt = new Intl.DateTimeFormat("en-GB", {
    timeZone: EMAIL_TZ, year: "numeric", month: "short", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZoneName: "short",
  }).format(new Date());

  const ctaUrl = buildLink(type, token);
  const html = renderEmail({
    name,
    title: SUBJECTS[type] || "Notification",
    message: text || DEFAULT_TEXT[type] || "",
    ctaUrl,
    ctaLabel: CTA[type] || "Open",
    requestedAt,
    expiresAt: expiresAt
      ? new Intl.DateTimeFormat("en-GB", { timeZone: EMAIL_TZ, dateStyle: "medium", timeStyle: "short" }).format(expiresAt)
      : null,
  });

  await sendEmail({ to, subject: SUBJECTS[type] || "Notification", html });
};
