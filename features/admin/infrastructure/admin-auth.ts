import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const sessionCookieName = "jade_admin_session";
const sessionDurationSeconds = 60 * 60 * 8;

function getAdminConfiguration() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !password || !secret || secret.length < 32) return null;
  return { username, password, secret };
}

function constantTimeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

function signExpiry(expiry: string, secret: string) {
  return createHmac("sha256", secret).update(expiry).digest("base64url");
}

export function isAdminAuthConfigured() {
  return getAdminConfiguration() !== null;
}

export function verifyAdminCredentials(username: string, password: string) {
  const configuration = getAdminConfiguration();
  if (!configuration) return false;

  return (
    constantTimeEqual(username, configuration.username) &&
    constantTimeEqual(password, configuration.password)
  );
}

export async function createAdminSession() {
  const configuration = getAdminConfiguration();
  if (!configuration) throw new Error("Admin authentication is not configured");

  const expiry = String(Date.now() + sessionDurationSeconds * 1000);
  const cookieStore = await cookies();
  cookieStore.set(
    sessionCookieName,
    `${expiry}.${signExpiry(expiry, configuration.secret)}`,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/admin",
      maxAge: sessionDurationSeconds,
    },
  );
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(sessionCookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/admin",
    maxAge: 0,
  });
}

export async function hasValidAdminSession() {
  const configuration = getAdminConfiguration();
  if (!configuration) return false;

  const value = (await cookies()).get(sessionCookieName)?.value;
  if (!value) return false;

  const [expiry, signature, ...extraParts] = value.split(".");
  if (
    !expiry ||
    !signature ||
    extraParts.length > 0 ||
    !/^\d+$/.test(expiry) ||
    Number(expiry) <= Date.now()
  ) {
    return false;
  }

  return constantTimeEqual(signature, signExpiry(expiry, configuration.secret));
}
