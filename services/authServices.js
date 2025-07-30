import HttpError from "../helpers/HttpError.js";
import crypto from 'crypto';
import bcrypt from "bcrypt";
import { generateToken } from "../helpers/jwt.js";
import { sendVerificationEmail } from '../helpers/sendVerificationEmail.js';
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();



export const registerUser = async(data) => {
    const { email, password } = data;

    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw HttpError(409, "Email in use");
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');


    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
        data: {
        ...data,
        verificationToken,
        password: hashPassword
        }
    });

    await sendVerificationEmail(newUser.email, newUser.name, verificationToken);

    return newUser;
};


export const loginUser = async(data) => {
    const { email, password } = data;

    const user = await prisma.user.findUnique({
        where: { email }
    });

    if (!user) {
        throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const payload = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded
    };

    const token = generateToken(payload);

    await prisma.user.update({
        where: { id: user.id },
        data: { token }
    });

    return { token, payload };
};



export const findUser = query => prisma.user.findUnique({
    where: query
})


export const logoutUser = async(id) => {
    const user = await findUser({ id });

    if (!user || !user.token) {
        throw HttpError(401, "Not authorized");
    }

    await prisma.user.update({
        where: { id },
        data: { token: null }
    });
};


export const updateData = async(id, data) => {
    const user = await findUser({ id });

    if (!user || !user.token) {
        throw HttpError(401, "Not authorized");
    } 

    console.log("data", data);

    await prisma.user.update({
        where: { id },
        data
    });

    return prisma.user.findUnique({ where: { id } }); 
};


export const verifyEmailService = async(token) =>{
    const user = await prisma.user.findFirst({ where: { verificationToken: token } });
    if (!user) throw HttpError(400,'Invalid token');

    return await prisma.user.update({
        where: { id: user.id },
        data: { isVerified: true, verificationToken: null }
    });
}


export const resendVerificationService = async(email) => {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    throw HttpError(404, "User not found");
  }
  if (user.isVerified) {
    throw HttpError(400, "Email already verified");
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  await prisma.user.update({
    where: { email },
    data: { verificationToken }
  });

  await sendVerificationEmail(user.email, user.name, verificationToken);

  return { message: "Verification email resent successfully" }
}