// middlewares/optionalAuth.js
import { verifyAccessToken } from "../helpers/jwt.js";
import { findUser } from "../services/authServices.js"; 
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const [bearer, token] = authHeader.split(" ");
    if (bearer !== "Bearer" || !token) return next(); 

    const { payload, error } = verifyAccessToken(token);
    if (error || !payload?.sub) return next();         

    // Берём пользователя по id из sub
    const userId = String(payload.sub);
    const user = await findUser({ id: userId });
    if (user) req.user = user;                         

    return next();
  } catch {
    return next();
  }
};

export default optionalAuth;
