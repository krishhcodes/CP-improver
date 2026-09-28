import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "cp_session";

export interface SessionPayload {
  userId: string;
  username: string;
  handle?: string;
  role?: string;
}

const getSecretKey = () => {
  const secret = process.env.NEXTAUTH_SECRET || "cp-intelligence-development-secret-key-32-chars-long";
  return new TextEncoder().encode(secret);
};

/**
 * Generate a signed JWT session token (7-day validity)
 */
export async function createSessionToken(payload: SessionPayload): Promise<string> {
  const secretKey = getSecretKey();

  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify and decode a JWT session token
 */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);

    return {
      userId: payload.userId as string,
      username: payload.username as string,
      handle: payload.handle as string | undefined,
      role: payload.role as string | undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Resolves session payload from request cookies
 */
export async function getSessionUser(req: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): Promise<SessionPayload | null> {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

