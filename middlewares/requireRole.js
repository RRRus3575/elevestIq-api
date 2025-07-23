import HttpError from "../helpers/HttpError.js";

export const requireRole = (role) => (req, res, next) => {
  if (!req.user) return next(HttpError(401)); 
  if (req.user.role !== role) return next(HttpError(403)); 
  next();
};
