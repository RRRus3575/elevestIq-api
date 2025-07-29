import { sendEmail } from './sendEmail.js';

export const sendVerificationEmail = async (userEmail, userName, token) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify/${token}`;
  
  const html = `
    <p>Hello, ${userName}!</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>If you did not create this account, you can safely ignore this email.</p>
  `;

  await sendEmail({
    to: userEmail,
    subject: 'Email Verification',
    html,
  });
};
