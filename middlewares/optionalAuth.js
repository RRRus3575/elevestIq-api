import { verifyAccessToken } from "../helpers/jwt.js";
import { findUser } from "../services/authServices.js"; 

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) return next();

    const [scheme, token] = authHeader.split(" ");

    if (!token || scheme.toLowerCase() !== "bearer") {
      return next();
    }

    const { payload, error } = verifyAccessToken(token);

    if (error || !payload?.sub) {
      return next();
    }

    const userId = String(payload.sub);
    const user = await findUser({ id: userId });

    if (user) {
      req.user = user;
    }

    return next();
  } catch (err) {
    return next();
  }
};


export default optionalAuth;
