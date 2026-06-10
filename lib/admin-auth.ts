import "server-only";
import { createHmac, scryptSync, timingSafeEqual, randomBytes } from "crypto";
import { ADMIN_COOKIE } from "./admin-auth-edge";

export { ADMIN_COOKIE };

/**
 * Built-in admin password auth — used when Clerk isn't configured.
 *
 * - Password is stored as a scrypt hash ("saltHex:derivedHex") in
 *   ADMIN_PASSWORD_HASH; the plaintext never touches disk or source.
 * - The session is a stateless, HMAC-signed token in an httpOnly cookie.
 *   Node verifies it here; the Edge middleware verifies the same token with
 *   Web Crypto (see lib/admin-auth-edge.ts).
 *
 * Clerk, when configured, takes precedence over this entirely (see getAdminContext).
 */

const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12h

function b64url(buf: Buffer) {
  return buf.toString("base64url");
}

/** Verify an email + password against the configured admin credentials. */
export function verifyCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.ADMIN_EMAIL;
  const stored = process.env.ADMIN_PASSWORD_HASH;
  if (!expectedEmail || !stored) return false;

  if (email.trim().toLowerCase() !== expectedEmail.trim().toLowerCase()) return false;

  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  let derived: Buffer;
  try {
    derived = scryptSync(password, salt, expected.length);
  } catch {
    return false;
  }
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

/** Build a signed session token: `<payloadB64>.<sigB64>`. */
export function createSessionToken(email: string): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET is not set");
  const payload = b64url(
    Buffer.from(
      JSON.stringify({
        e: email.trim().toLowerCase(),
        exp: Math.floor(nowSeconds()) + SESSION_TTL_SECONDS,
        n: randomBytes(6).toString("hex"),
      }),
    ),
  );
  const sig = b64url(createHmac("sha256", secret).update(payload).digest());
  return `${payload}.${sig}`;
}

/** Verify a session token (signature + expiry). Returns the email, or null. */
export function verifySessionToken(token: string | undefined): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;

  const expected = b64url(createHmac("sha256", secret).update(payload).digest());
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString()) as {
      e?: string;
      exp?: number;
    };
    if (!data.e || !data.exp || data.exp < nowSeconds()) return null;
    return data.e;
  } catch {
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
};

// new Date()/Date.now() are fine in server runtime; isolated for clarity.
function nowSeconds() {
  return Date.now() / 1000;
}
