import express from "express";
import validateBody from "../helpers/validateBody.js";
import {
  startupProfileSchema,
  investorProfileSchema,
  profileUpdateSchema,
} from "../schemas/profileSchemas.js";
import profileController from "../controllers/profileController.js";
import auth from "../middlewares/auth.js";
import { requireRole } from "../middlewares/requireRole.js";

const {
  createStartupProfileController,
  updateStartupProfileController,
  deleteStartupProfileController,
  createInvestorProfileController,
  updateInvestorProfileController,
  deleteInvestorProfileController,
  getMyProfileController,
  updateMyProfileController,
  getProfileController,
} = profileController;

const profileRouter = express.Router();

profileRouter.post(
  "/startup",
  auth,
  requireRole("STARTUP"),
  validateBody(startupProfileSchema),
  createStartupProfileController
);

profileRouter.put(
  "/startup",
  auth,
  requireRole("STARTUP"),
  validateBody(startupProfileSchema),
  updateStartupProfileController
);

profileRouter.delete(
  "/startup",
  auth,
  requireRole("STARTUP"),
  deleteStartupProfileController
);

profileRouter.post(
  "/investor",
  auth,
  requireRole("INVESTOR"),
  validateBody(investorProfileSchema),
  createInvestorProfileController
);

profileRouter.put(
  "/investor",
  auth,
  requireRole("INVESTOR"),
  validateBody(investorProfileSchema),
  updateInvestorProfileController
);

profileRouter.delete(
  "/investor",
  auth,
  requireRole("INVESTOR"),
  deleteInvestorProfileController
);

profileRouter.get(
  "/me",
  auth,
  getMyProfileController
);

profileRouter.put(
  "/me",
  auth,
  validateBody(profileUpdateSchema),
  updateMyProfileController
);

profileRouter.get("/:userId", getProfileController);

export default profileRouter;
