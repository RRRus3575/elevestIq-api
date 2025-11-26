import HttpError from "../helpers/HttpError.js";
import { verifyAccessToken } from "../helpers/jwt.js";
import {prisma} from "../helpers/db.js"

export default async function auth(req, _res, next) {
  const authHeader = req.headers.authorization || "";
  const [bearer, token] = authHeader.split(" ");
  if (bearer !== "Bearer" || !token) return next(HttpError(401, "Not authorized"));

  const { payload, error } = verifyAccessToken(token);
  if (error || !payload?.sub) return next(HttpError(401, "Not authorized"));

  const user = await prisma.user.findUnique({ where: { id: String(payload.sub) } });
  if (!user) return next(HttpError(401, "Not authorized"));

  // Optional: tokenVersion hard kill
  if ((user.tokenVersion ?? 0) !== Number(payload.tv ?? 0)) {
    return next(HttpError(401, "Not authorized"));
  }

  // Optional strict: verify session by sid in payload
  if (payload.sid) {
    const session = await prisma.session.findUnique({ where: { id: String(payload.sid) } });
    if (!session || session.revokedAt || session.expiresAt <= new Date()) {
      return next(HttpError(401, "Not authorized"));
    }
  }

  req.user = user;
  next();
}
