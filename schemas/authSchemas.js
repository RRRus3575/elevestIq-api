import Joi from "joi";
import { emailRegex } from "../constants/auth.js";


export const authRegisterSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required(),
    name: Joi.string().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('STARTUP', 'INVESTOR').required(),
})

export const authLoginSchema = Joi.object({
    email: Joi.string().pattern(emailRegex).required(),
    password: Joi.string().required(),
})

export const requestPasswordResetSchema = Joi.object({
  email: Joi.string().pattern(emailRegex).required(),
});


export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),         
  newPassword: Joi.string().min(8).required(), 
});

export const changePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string()
    .min(8)
    .invalid(Joi.ref("currentPassword")) 
    .required(),
});

