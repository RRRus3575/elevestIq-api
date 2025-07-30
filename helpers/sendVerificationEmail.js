import { sendEmail } from './sendEmail.js';

export const sendVerificationEmail = async (userEmail, userName, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
  
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Email Verification - ElevestIQ</title>
    </head>
    <body style="margin:0; padding:0; background-color:#f5f8fc; font-family:'Arial', sans-serif; color:#333;">
      <!-- Preheader -->
      <div style="display:none; font-size:1px; color:#f5f8fc; line-height:1px; max-height:0; max-width:0; opacity:0; overflow:hidden;">
        Verify your email to access AI-powered startup-investor matching on ElevestIQ.
      </div>

      <table align="center" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.05);">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg, #0A1F44, #123C78); padding:28px; text-align:center;">
            <h1 style="margin:0; font-size:28px; color:#ffffff; font-weight:600;">ElevestIQ</h1>
            <p style="margin:8px 0 0; color:#d0e0f5; font-size:14px;">Smart Startups. Trusted Investors.</p>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:32px;">
            <h2 style="margin:0 0 16px; font-size:22px; color:#0A1F44;">Hello, ${userName}!</h2>
            <p style="margin:0 0 20px; font-size:16px; line-height:1.5;">
              Welcome to <strong>ElevestIQ</strong>! Click the button below to verify your email and unlock AI-powered matching, legal support, and secure signing.
            </p>
            <p style="text-align:center; margin:28px 0;">
              <a href="${verifyUrl}" 
                style="background:#0A74FF; color:white; padding:14px 40px; text-decoration:none; border-radius:6px; font-size:16px; display:inline-block;">
                Verify Email
              </a>
            </p>
            <p style="font-size:14px; color:#666; line-height:1.5; text-align:center;">
              If you didn’t create this account, simply ignore this email.
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f0f4fa; padding:18px; text-align:center; font-size:12px; color:#888;">
            © 2025 ElevestIQ. All rights reserved.<br>
            <a href="https://elevestiq.com" style="color:#0A74FF; text-decoration:none;">Visit Website</a>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Email Verification',
    html,
  });
};
