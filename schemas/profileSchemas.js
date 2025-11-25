import Joi from "joi";

export const startupProfileSchema = Joi.object({
  companyName: Joi.string().allow(null, "").optional(),
  description: Joi.string().allow(null, "").optional(),
  goals: Joi.string().allow(null, "").optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  industry: Joi.string().allow(null, "").optional(),
  stage: Joi.string().allow(null, "").optional(),
  location: Joi.string().allow(null, "").optional(),
});

export const investorProfileSchema = Joi.object({
  companyName: Joi.string().allow(null, "").optional(),
  description: Joi.string().allow(null, "").optional(),
  interests: Joi.string().allow(null, "").optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  region: Joi.string().allow(null, "").optional(),
  budgetMin: Joi.number().integer().min(0).allow(null).optional(),
  budgetMax: Joi.number().integer().min(0).allow(null).optional(),
});

export const profileUpdateSchema = Joi.object({
  companyName: Joi.string().allow(null, "").optional(),
  description: Joi.string().allow(null, "").optional(),
  goals: Joi.string().allow(null, "").optional(),
  interests: Joi.string().allow(null, "").optional(),
  tags: Joi.array().items(Joi.string()).default([]),
  industry: Joi.string().allow(null, "").optional(),
  stage: Joi.string().allow(null, "").optional(),
  location: Joi.string().allow(null, "").optional(),
  region: Joi.string().allow(null, "").optional(),
  budgetMin: Joi.number().integer().min(0).allow(null).optional(),
  budgetMax: Joi.number().integer().min(0).allow(null).optional(),
});

