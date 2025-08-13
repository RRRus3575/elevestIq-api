import bcrypt from "bcrypt";
import crypto from "crypto";
import HttpError from "../helpers/HttpError.js";
import { PrismaClient, TokenType } from "@prisma/client";
import { sendActionEmail } from "../helpers/sendActionEmail.js";
import { revokeAllUserSessions } from "./sessionService.js";

const prisma = new PrismaClient();


const genRawToken = (bytes = 32) => crypto.randomBytes(bytes).toString("hex");
const sha256 = (x) => crypto.createHash("sha256").update(x).digest("hex");

const createUserToken = async (userId, type, meta = null, ttlMinutes = 30) => {
  const raw = genRawToken();
  const tokenHash = sha256(raw);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await prisma.userToken.create({
    data: { userId, tokenHash, type, meta, expiresAt },
  });

  return { raw, expiresAt };
};

const consumeUserToken = async (raw, expectedType) => {
  const tokenHash = sha256(raw);
  const tok = await prisma.userToken.findUnique({ where: { tokenHash } });
  if (!tok) throw HttpError(400, "Invalid token");
  if (tok.type !== expectedType) throw HttpError(400, "Invalid token type");
  if (tok.usedAt) throw HttpError(400, "Token already used");
  if (tok.expiresAt <= new Date()) throw HttpError(400, "Token expired");

  await prisma.userToken.update({
    where: { tokenHash },
    data: { usedAt: new Date() },
  });

  return tok; 
};


export const registerUser = async (data) => {
  const email = String(data.email).toLowerCase();
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw HttpError(409, "Email in use");

  const password = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      ...data, 
      password,
      isVerified: false,
    },
    select: { id: true, email: true, name: true, role: true, isVerified: true },
  });

  const { raw, expiresAt } = await createUserToken(user.id, TokenType.email_verify, null, 60);
  await sendActionEmail({
    type: "email_verify",
    to: user.email,
    name: user.name,
    token: raw,
    expiresAt,
  });

  return user;
};

export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    select: { id: true, email: true, name: true, role: true, isVerified: true, password: true, tokenVersion: true },
  });
  if (!user) throw HttpError(401, "Email or password is wrong");

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) throw HttpError(401, "Email or password is wrong");

  const { password: _p, ...safe } = user;
  return safe; 
};

export const findUser = (query) => prisma.user.findUnique({ where: query });

export const findUserById = (id) =>
  prisma.user.findUnique({
    where: { id },
    select: { id: true, email: true, name: true, role: true, isVerified: true, tokenVersion: true },
  });

export const logoutUser = async (userId, { logoutAll = false } = {}) => {
  if (logoutAll) {
    await revokeAllUserSessions(userId);
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  }
  return true;
};


export const verifyEmailService = async (rawToken) => {
  const tok = await consumeUserToken(rawToken, TokenType.email_verify);
  const user = await prisma.user.update({
    where: { id: tok.userId },
    data: { isVerified: true },
    select: { id: true, email: true, isVerified: true },
  });
  return user;
};

export const resendVerificationService = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    select: { id: true, email: true, name: true, isVerified: true },
  });
  if (!user) throw HttpError(404, "User not found");
  if (user.isVerified) throw HttpError(400, "Email already verified");

  const { raw, expiresAt } = await createUserToken(user.id, TokenType.email_verify, null, 60);
  await sendActionEmail({
    type: "email_verify",
    to: user.email,
    name: user.name,
    token: raw,
    expiresAt,
  });

  return { message: "Verification email resent successfully" };
};


export const requestPasswordReset = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
    select: { id: true, email: true, name: true },
  });

  const generic = { message: "If the account exists, a reset link has been sent." };
  if (!user) return generic;

  const { raw, expiresAt } = await createUserToken(user.id, TokenType.password_reset, null, 30);
  await sendActionEmail({
    type: "password_reset",
    to: user.email,
    name: user.name,
    token: raw,
    expiresAt,
  });

  return generic;
};

export const resetPasswordByToken = async (rawToken, newPassword) => {
  if (!rawToken || !newPassword) throw HttpError(400, "Bad request");

  const tok = await consumeUserToken(rawToken, TokenType.password_reset);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: tok.userId },
    data: {
      password: passwordHash,
      tokenVersion: { increment: 1 }, 
    },
  });

  await revokeAllUserSessions(tok.userId); 
  return { message: "Password updated" };
};


export const changePasswordUser = async (
  userId,
  currentPassword,
  newPassword,
  { keepSessionId = null } = {}
) => {
  if (!userId || !currentPassword || !newPassword) {
    throw HttpError(400, "Bad request");
  }
  if (newPassword.length < 6) {
    throw HttpError(400, "New password is too short");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, password: true },
  });
  if (!user) throw HttpError(404, "User not found");

  const ok = await bcrypt.compare(currentPassword, user.password);
  if (!ok) throw HttpError(401, "Current password is incorrect");

  const same = await bcrypt.compare(newPassword, user.password);
  if (same) throw HttpError(400, "New password must be different");

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: {
        password: passwordHash,
        tokenVersion: { increment: 1 },
      },
    });

    if (keepSessionId) {
      await tx.session.updateMany({
        where: { userId, id: { not: keepSessionId }, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await tx.session.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  });

  return { message: "Password changed" };
};


export const requestEmailChange = async (userId, newEmail) => {
  const email = String(newEmail || "").trim().toLowerCase();
  if (!email) throw HttpError(400, "Bad request");

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });
  if (!user) throw HttpError(404, "User not found");
  if (user.email === email) throw HttpError(400, "Email is the same");

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) throw HttpError(409, "Email already in use");

  const { raw, expiresAt } = await createUserToken(
    user.id,
    TokenType.email_change,
    { newEmail: email }, 
    60
  );

  await sendActionEmail({
    type: "email_change",
    to: email,
    name: user.name,
    token: raw,
    expiresAt,
  });

  return { message: "Confirmation link sent to new email" };
};

export const confirmEmailChange = async (rawToken, { keepSessionId = null } = {}) => {
  const tok = await consumeUserToken(rawToken, TokenType.email_change);

  const newEmail = tok?.meta?.newEmail
    ? String(tok.meta.newEmail).trim().toLowerCase()
    : null;
  if (!newEmail) throw HttpError(400, "Invalid token payload");

  const conflict = await prisma.user.findUnique({ where: { email: newEmail } });
  if (conflict && conflict.id !== tok.userId) {
    throw HttpError(409, "Email already in use");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: tok.userId },
      data: {
        email: newEmail,
        isVerified: true,           
        tokenVersion: { increment: 1 },
      },
    });

    if (keepSessionId) {
      await tx.session.updateMany({
        where: { userId: tok.userId, id: { not: keepSessionId }, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } else {
      await tx.session.updateMany({
        where: { userId: tok.userId, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    }
  });

  return { message: "Email updated" };
};
