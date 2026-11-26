
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

export const COOKIE_NAME = "alfamart_session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is missing from .env");
  }

  return new TextEncoder().encode(secret);
}

// Verify token and get user
export async function getUserFromToken(token?: string) {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub) return null;

    return await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });
  } catch (error) {
    console.error("JWT Verification Failed:", error);
    return null;
  }
}

// Get currently logged-in user (Server Components)
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  return getUserFromToken(token);
}

// Protect admin pages
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");
  if (user.role !== "ADMIN") redirect("/");

  return user;
}
