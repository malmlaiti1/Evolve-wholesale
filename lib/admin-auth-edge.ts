/**
 * Edge-runtime verification of the admin session token, mirroring
 * verifySessionToken() in lib/admin-auth.ts but using Web Crypto so it can run
 * inside middleware. Same token format: `<payloadB64url>.<sigB64url>`.
 *
 * This module is dependency-free (no node:crypto, no "server-only") so it is
 * safe to import from both the Edge middleware and Node server code.
 */

export const ADMIN_COOKIE = "ew_admin_session";

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlToString(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/") + pad;
  const bin = atob(b64);
  return decodeURIComponent(
    Array.from(bin)
      .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(""),
  );
}

export async function verifySessionTokenEdge(
  token: string | undefined,
  secret: string | undefined,
): Promise<boolean> {
  if (!token || !secret) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  if (bufToB64url(mac) !== sig) return false;

  try {
    const data = JSON.parse(b64urlToString(payload)) as { exp?: number };
    if (!data.exp || data.exp < Date.now() / 1000) return false;
    return true;
  } catch {
    return false;
  }
}
