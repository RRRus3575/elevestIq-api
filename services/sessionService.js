import {prisma} from "../helpers/db.js"
import { generateRefreshTokenRaw, hashRefreshToken } from "../helpers/jwt.js";
import { SESSION_MAX_DAYS } from "../helpers/jwt.js";


export async function createSession(userId, { ip, userAgent }) {
  const raw = generateRefreshTokenRaw();
  const refreshHash = hashRefreshToken(raw);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * SESSION_MAX_DAYS);

  const session = await prisma.session.create({
    data: { userId, refreshHash, ip, userAgent, expiresAt }
  });
  return { session, rawRefresh: raw };
}

export async function rotateSession(sessionId) {
  const raw = generateRefreshTokenRaw();
  const refreshHash = hashRefreshToken(raw);
  const session = await prisma.session.update({ where: { id: sessionId }, data: { refreshHash } });
  return { session, rawRefresh: raw };
}

export async function findValidSessionByRawRefresh(rawRefresh) {
  const refreshHash = hashRefreshToken(rawRefresh);
  const session = await prisma.session.findFirst({ where: { refreshHash, revokedAt: null, expiresAt: { gt: new Date() } } });
  return session;
}

export async function revokeSession(sessionId) {
  await prisma.session.update({ where: { id: sessionId }, data: { revokedAt: new Date() } });
}

export async function revokeAllUserSessions(userId) {
  await prisma.session.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
}