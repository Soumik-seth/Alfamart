
import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma";

const COOKIE_NAME = "alfamart_session";

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is missing from .env");
  }

  return new TextEncoder().encode(secret);
}

// Get currently logged-in user
export async function getCurrentUser() {
  await connection();
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getAuthSecret(), {
      algorithms: ["HS256"],
    });

    if (!payload.sub) {
      return null;
    }

    return await prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
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

// Protect admin pages
export async function requireAdmin() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role !== "ADMIN") {
    redirect("/");
  }

  return user;
}
