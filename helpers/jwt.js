import jwt from "jsonwebtoken";
import crypto from "crypto";

const {
  JWT_SECRET,
  JWT_ISSUER = "your-app",
  JWT_AUDIENCE = "your-app-web",
} = process.env;

if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");

export const ACCESS_TTL = process.env.ACCESS_TTL ?? "15m";
export const SESSION_MAX_DAYS = Number(process.env.SESSION_MAX_DAYS ?? 90);

// access jwt 
export function generateAccessToken({ userId, role = "USER", tokenVersion = 0, sid }) {
  return jwt.sign(
    { role, tv: tokenVersion, sid },
    JWT_SECRET,
    {
      subject: String(userId),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: ACCESS_TTL,
      algorithm: "HS256",
    }
  );
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      algorithms: ["HS256"],
      clockTolerance: 5,
    });
    return { payload, error: null };
  } catch (error) {
    return { payload: null, error };
  }
}

// refresh helpers (raw + hash) 
export function generateRefreshTokenRaw(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
export function hashRefreshToken(raw) {
  return crypto.createHash("sha256").update(raw).digest("hex");
}
