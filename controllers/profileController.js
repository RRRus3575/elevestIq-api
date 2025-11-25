import controllerWrapper from "./controllerWrapper.js";
import {
  createStartupProfile,
  updateStartupProfile,
  deleteStartupProfile,
  createInvestorProfile,
  updateInvestorProfile,
  deleteInvestorProfile,
  getMyProfile,
  updateMyProfile,
  getProfileByUserId,
} from "../services/profileService.js";

const createStartupProfileController = async (req, res) => {
  const userId = req.user.id;
  const profile = await createStartupProfile(userId, req.body);
  res.status(201).json(profile);
};

const updateStartupProfileController = async (req, res) => {
  const userId = req.user.id;
  const profile = await updateStartupProfile(userId, req.body);
  res.json(profile);
};

const createInvestorProfileController = async (req, res) => {
  const userId = req.user.id;
  const profile = await createInvestorProfile(userId, req.body);
  res.status(201).json(profile);
};

const updateInvestorProfileController = async (req, res) => {
  const userId = req.user.id;
  const profile = await updateInvestorProfile(userId, req.body);
  res.json(profile);
};

const deleteStartupProfileController = async (req, res) => {
  const userId = req.user.id;
  const result = await deleteStartupProfile(userId);
  res.json(result);
};

const deleteInvestorProfileController = async (req, res) => {
  const userId = req.user.id;
  const result = await deleteInvestorProfile(userId);
  res.json(result);
};

const getMyProfileController = async (req, res) => {
  const userId = req.user.id;
  const profile = await getMyProfile(userId);
  res.json(profile);
};

const updateMyProfileController = async (req, res) => {
  const userId = req.user.id;
  const profile = await updateMyProfile(userId, req.body);
  res.json(profile);
};

const getProfileController = async (req, res) => {
  const { userId } = req.params;
  const profile = await getProfileByUserId(userId);
  res.json(profile);
};

export default {
  createStartupProfileController: controllerWrapper(createStartupProfileController),
  updateStartupProfileController: controllerWrapper(updateStartupProfileController),
  deleteStartupProfileController: controllerWrapper(deleteStartupProfileController),
  createInvestorProfileController: controllerWrapper(createInvestorProfileController),
  updateInvestorProfileController: controllerWrapper(updateInvestorProfileController),
  deleteInvestorProfileController: controllerWrapper(deleteInvestorProfileController),
  getMyProfileController: controllerWrapper(getMyProfileController),
  updateMyProfileController: controllerWrapper(updateMyProfileController),
  getProfileController: controllerWrapper(getProfileController),
};
