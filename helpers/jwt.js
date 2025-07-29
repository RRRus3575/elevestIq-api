import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
dotenv.config();


const {JWT_SECRET} =process.env;

export const generateToken = payload => jwt.sign(payload, JWT_SECRET, {
    expiresIn: "24h"
})

export const verifyToken =(token) =>{
    try {
        const payload = jwt.verify(token, JWT_SECRET)
        return {
            payload,
            error: null,
        }
    } catch (error) {
        console.error('Token verification failed:', error.message);
        return {
            payload: null,
            error,
        }
    }
}