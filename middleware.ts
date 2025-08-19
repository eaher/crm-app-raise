// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import * as jose from "jose";

const BASE = "/crm";
const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";
const SECRET = new TextEncoder().encode(process.env.SESSION_JWT_SECRET!);

const PUBLIC_PATHS = [
  `${BASE}/login`,
  `${BASE}/api/auth/session`,
  "/favicon.ico",
  "/robots.txt",
  "/manifest.webmanifest",
];

function isPublic(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) return true;
  if (pathname.startsWith("/_next") || pathname.startsWith("/public")) return true;
  return false;
}

export async function middleware(req: NextRequest) {
  if (isPublic(req)) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = `${BASE}/login`;
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  try {
    await jose.jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const url = new URL(`${BASE}/login?error=session`, req.url);
    return NextResponse.redirect(url);
  }
}

// Ejecutar SOLO bajo /crm/*
export const config = {
  matcher: ["/crm/:path*"],
};
