import { PrismaClient } from "@prisma/client";
import HttpError from "../helpers/HttpError.js";

const prisma = new PrismaClient();

export const createStartupProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");
  if (user.role !== "STARTUP") throw HttpError(403, "User must have STARTUP role");

  const existing = await prisma.startupProfile.findUnique({
    where: { userId },
  });

  if (existing) throw HttpError(409, "Startup profile already exists");

  const profile = await prisma.startupProfile.create({
    data: {
      userId,
      companyName: data.companyName || null,
      description: data.description || null,
      goals: data.goals || null,
      tags: data.tags ?? [],
      industry: data.industry || null,
      stage: data.stage || null,
      location: data.location || null,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return {
    userId: profile.user.id,
    email: profile.user.email,
    name: profile.user.name,
    role: profile.user.role,
    profile: {
      id: profile.id,
      companyName: profile.companyName,
      description: profile.description,
      goals: profile.goals,
      tags: profile.tags,
      industry: profile.industry,
      stage: profile.stage,
      location: profile.location,
    },
  };
};

export const updateStartupProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");
  if (user.role !== "STARTUP") throw HttpError(403, "User must have STARTUP role");

  const existing = await prisma.startupProfile.findUnique({
    where: { userId },
  });

  if (!existing) throw HttpError(404, "Startup profile not found");

  const profile = await prisma.startupProfile.update({
    where: { userId },
    data: {
      companyName: data.companyName !== undefined ? data.companyName : existing.companyName,
      description: data.description !== undefined ? data.description : existing.description,
      goals: data.goals !== undefined ? data.goals : existing.goals,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      industry: data.industry !== undefined ? data.industry : existing.industry,
      stage: data.stage !== undefined ? data.stage : existing.stage,
      location: data.location !== undefined ? data.location : existing.location,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return {
    userId: profile.user.id,
    email: profile.user.email,
    name: profile.user.name,
    role: profile.user.role,
    profile: {
      id: profile.id,
      companyName: profile.companyName,
      description: profile.description,
      goals: profile.goals,
      tags: profile.tags,
      industry: profile.industry,
      stage: profile.stage,
      location: profile.location,
    },
  };
};

export const createInvestorProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");
  if (user.role !== "INVESTOR") throw HttpError(403, "User must have INVESTOR role");

  const existing = await prisma.investorProfile.findUnique({
    where: { userId },
  });

  if (existing) throw HttpError(409, "Investor profile already exists");

  if (data.budgetMin !== undefined && data.budgetMax !== undefined) {
    if (data.budgetMin > data.budgetMax) {
      throw HttpError(400, "budgetMin cannot be greater than budgetMax");
    }
  }

  const profile = await prisma.investorProfile.create({
    data: {
      userId,
      companyName: data.companyName || null,
      description: data.description || null,
      interests: data.interests || null,
      tags: data.tags ?? [],
      region: data.region || null,
      budgetMin: data.budgetMin !== undefined ? data.budgetMin : null,
      budgetMax: data.budgetMax !== undefined ? data.budgetMax : null,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return {
    userId: profile.user.id,
    email: profile.user.email,
    name: profile.user.name,
    role: profile.user.role,
    profile: {
      id: profile.id,
      companyName: profile.companyName,
      description: profile.description,
      interests: profile.interests,
      tags: profile.tags,
      region: profile.region,
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
    },
  };
};

export const updateInvestorProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");
  if (user.role !== "INVESTOR") throw HttpError(403, "User must have INVESTOR role");

  const existing = await prisma.investorProfile.findUnique({
    where: { userId },
  });

  if (!existing) throw HttpError(404, "Investor profile not found");

  const budgetMin = data.budgetMin !== undefined ? data.budgetMin : existing.budgetMin;
  const budgetMax = data.budgetMax !== undefined ? data.budgetMax : existing.budgetMax;
  
  if (budgetMin !== null && budgetMax !== null && budgetMin > budgetMax) {
    throw HttpError(400, "budgetMin cannot be greater than budgetMax");
  }

  const profile = await prisma.investorProfile.update({
    where: { userId },
    data: {
      companyName: data.companyName !== undefined ? data.companyName : existing.companyName,
      description: data.description !== undefined ? data.description : existing.description,
      interests: data.interests !== undefined ? data.interests : existing.interests,
      tags: data.tags !== undefined ? data.tags : existing.tags,
      region: data.region !== undefined ? data.region : existing.region,
      budgetMin: data.budgetMin !== undefined ? data.budgetMin : existing.budgetMin,
      budgetMax: data.budgetMax !== undefined ? data.budgetMax : existing.budgetMax,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
  });

  return {
    userId: profile.user.id,
    email: profile.user.email,
    name: profile.user.name,
    role: profile.user.role,
    profile: {
      id: profile.id,
      companyName: profile.companyName,
      description: profile.description,
      interests: profile.interests,
      tags: profile.tags,
      region: profile.region,
      budgetMin: profile.budgetMin,
      budgetMax: profile.budgetMax,
    },
  };
};

export const deleteStartupProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");
  if (user.role !== "STARTUP") throw HttpError(403, "User must have STARTUP role");

  const existing = await prisma.startupProfile.findUnique({
    where: { userId },
  });

  if (!existing) throw HttpError(404, "Startup profile not found");

  await prisma.startupProfile.delete({
    where: { userId },
  });

  return { message: "Startup profile deleted successfully" };
};

export const deleteInvestorProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");
  if (user.role !== "INVESTOR") throw HttpError(403, "User must have INVESTOR role");

  const existing = await prisma.investorProfile.findUnique({
    where: { userId },
  });

  if (!existing) throw HttpError(404, "Investor profile not found");

  await prisma.investorProfile.delete({
    where: { userId },
  });

  return { message: "Investor profile deleted successfully" };
};

export const getMyProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isVerified: true,
      isOnboarded: true,
      startupProfile: true,
      investorProfile: true,
    },
  });

  if (!user) throw HttpError(404, "User not found");

  if (user.role === "STARTUP" && user.startupProfile) {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      isOnboarded: user.isOnboarded,
      profile: user.startupProfile,
    };
  }

  if (user.role === "INVESTOR" && user.investorProfile) {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isVerified: user.isVerified,
      isOnboarded: user.isOnboarded,
      profile: user.investorProfile,
    };
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isVerified: user.isVerified,
    isOnboarded: user.isOnboarded,
    profile: null,
  };
};

export const updateMyProfile = async (userId, data) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!user) throw HttpError(404, "User not found");

  if (user.role === "STARTUP") {
    const startupData = {
      companyName: data.companyName,
      description: data.description,
      goals: data.goals,
      tags: data.tags,
      industry: data.industry,
      stage: data.stage,
      location: data.location,
    };

    const existing = await prisma.startupProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      return await createStartupProfile(userId, startupData);
    }

    return await updateStartupProfile(userId, startupData);
  }

  if (user.role === "INVESTOR") {
    const investorData = {
      companyName: data.companyName,
      description: data.description,
      interests: data.interests,
      tags: data.tags,
      region: data.region,
      budgetMin: data.budgetMin,
      budgetMax: data.budgetMax,
    };

    const existing = await prisma.investorProfile.findUnique({
      where: { userId },
    });

    if (!existing) {
      return await createInvestorProfile(userId, investorData);
    }

    return await updateInvestorProfile(userId, investorData);
  }

  throw HttpError(400, "Invalid user role");
};

export const getProfileByUserId = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      startupProfile: true,
      investorProfile: true,
    },
  });

  if (!user) throw HttpError(404, "User not found");

  if (user.role === "STARTUP" && user.startupProfile) {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.startupProfile,
    };
  }

  if (user.role === "INVESTOR" && user.investorProfile) {
    return {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      profile: user.investorProfile,
    };
  }

  return {
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    profile: null,
  };
};

