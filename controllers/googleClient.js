import { OAuth2Client } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

const { GOOGLE_CLIENT_ID } = process.env;

if (!GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined");
}

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

/**
 * @param {string} idToken 
 * @returns {Promise<{
 *   sub: string;
 *   email?: string;
 *   email_verified?: boolean;
 *   name?: string;
 *   picture?: string;
 * }>}
 */
export async function verifyGoogleIdToken(idToken) {
  if (!idToken) {
    throw new Error("idToken is required");
  }

  const ticket = await client.verifyIdToken({
    idToken,
    audience: GOOGLE_CLIENT_ID, 
  });

  const payload = ticket.getPayload();

  if (!payload || !payload.sub) {
    throw new Error("Invalid Google token payload");
  }

  return {
    sub: payload.sub,                  
    email: payload.email,
    email_verified: payload.email_verified,
    name: payload.name,
    picture: payload.picture,
  };
}
