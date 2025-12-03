import HttpError from "../helpers/HttpError.js";
import controllerWrapper from "../controllers/controllerWrapper.js";
import { verifyGoogleIdToken } from './googleClient.js'; 
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  verifyEmailService, 
  resendVerificationService, 
  findUserById, 
  requestPasswordReset, 
  resetPasswordByToken, 
  changePasswordUser,
  requestEmailChange, 
  confirmEmailChange,
  socialLogin
} from "../services/authServices.js";
import { generateAccessToken, ACCESS_TTL } from '../helpers/jwt.js';
import { createSession, rotateSession, findValidSessionByRawRefresh, revokeSession } from "../services/sessionService.js";

function setRefreshCookie(res, raw) {
  const secure = process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production";
  const maxDays = Number(process.env.SESSION_MAX_DAYS ?? 90);   
  res.cookie("refresh", raw, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/api/auth",
    maxAge: 1000 * 60 * 60 * 24 * maxDays,
  });
}


const registerController = async (req, res) => {
  const user = await registerUser({ ...req.body }); 
  res.status(201).json(user);
};

const loginController = async (req, res) => {
  const user = await loginUser(req.body);
  if (!user) throw HttpError(401, "Invalid credentials");

  const { session, rawRefresh } = await createSession(user.id, { ip: req.ip, userAgent: req.get("user-agent") });
  setRefreshCookie(res, rawRefresh);

  const access = generateAccessToken({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0, sid: session.id });
  res.json({ access, accessTtl: ACCESS_TTL, user: { id: user.id, email: user.email, role: user.role } });
};

const refreshController = async (req, res) => {
  const raw = req.cookies?.refresh;
  if (!raw) return res.status(401).json({ error: "No refresh" });

  const session = await findValidSessionByRawRefresh(raw);
  if (!session) return res.status(401).json({ error: "Invalid refresh" });

  const user = await findUserById(session.userId);
  if (!user) return res.status(401).json({ error: "Invalid session" });

  const { session: updated, rawRefresh } = await rotateSession(session.id);
  setRefreshCookie(res, rawRefresh);

  const access = generateAccessToken({ userId: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0, sid: updated.id });
  res.json({ access, accessTtl: ACCESS_TTL });
};

const logoutController = async (req, res) => {
  const raw = req.cookies?.refresh;
  if (raw) {
    const session = await findValidSessionByRawRefresh(raw);
    if (session) await revokeSession(session.id);
  }
  await logoutUser(req.user.id); 
  res.clearCookie("refresh", { path: "/api/auth" });
  res.status(204).send();
};

const getCurrentController = (req, res) => {
  const { id, email, name, role, isVerified } = req.user;
  res.json({ id, email, name, role, isVerified });
};

const verifyEmail = async (req, res) => {
  const { token } = req.params;
  const result = await verifyEmailService(token);
  if (!result?.isVerified) return res.status(400).json({ error: "Invalid or expired token" });
  res.json({ message: "Email successfully confirmed!" });
};

const resendVerification = async (req, res) => {
  const { email } = req.body;
  const result = await resendVerificationService(email);
  res.json(result);
};


const forgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email)
  const result = await requestPasswordReset(email);
  res.json(result); 
};


const applyNewPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const result = await resetPasswordByToken(token, newPassword);
  res.json(result); 
};


const changePassword = async (req, res) => {
  const userId = req.user.id
  const {currentPassword, newPassword} = req.body;
  const keepSessionId = req.sessionId ?? null;

  const result = await changePasswordUser(userId, currentPassword, newPassword, { keepSessionId })

  res.json(result)
} 

const requestChangeEmail = async (req, res) => {
  const { newEmail } = req.body;
  const result = await requestEmailChange(req.user.id, newEmail);
  res.json(result);
};


const confirmChangeEmail = async (req, res) => {
  const { token } = req.params;
  const result = await confirmEmailChange(token);
  res.json(result);
};

const googleLogin = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    throw HttpError(400, "idToken is required");
  }

  const googlePayload = await verifyGoogleIdToken(idToken);

  const user = await socialLogin({
    provider: 'GOOGLE',
    providerId: googlePayload.sub,
    email: googlePayload.email,
    emailVerified: googlePayload.email_verified,
    profile: { name: googlePayload.name },
  });

  const { session, rawRefresh } = await createSession(user.id, {
    ip: req.ip,
    userAgent: req.get("user-agent"),
  });
  setRefreshCookie(res, rawRefresh);

  const access = generateAccessToken({
    userId: user.id,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
    sid: session.id,
  });

  res.json({
    access,
    accessTtl: ACCESS_TTL,
    user: { id: user.id, email: user.email, role: user.role },
  });
};


export default {
  registerController: controllerWrapper(registerController),
  loginController: controllerWrapper(loginController),
  refreshController: controllerWrapper(refreshController),
  getCurrentController: controllerWrapper(getCurrentController),
  logoutController: controllerWrapper(logoutController),
  verifyEmail: controllerWrapper(verifyEmail),
  resendVerification: controllerWrapper(resendVerification),
  forgotPassword: controllerWrapper(forgotPassword),
  applyNewPassword: controllerWrapper(applyNewPassword),
  changePassword: controllerWrapper(changePassword),
  requestChangeEmail: controllerWrapper(requestChangeEmail),
  confirmChangeEmail: controllerWrapper(confirmChangeEmail),
  googleLogin: controllerWrapper(googleLogin),
};
