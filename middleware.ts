// middleware.ts
import { NextResponse, NextRequest } from "next/server";
import * as jose from "jose";

const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";
const SECRET_RAW = process.env.SESSION_JWT_SECRET;

const PUBLIC_PATHS = [
  "/",                 // redirige a /login
  "/login",            // login
  "/api/auth/session", // login/logout/session info
  "/favicon.ico",
  "/robots.txt",
  "/manifest.webmanifest",
];

function isPublic(pathname: string) {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p))) return true;
  if (pathname.startsWith("/_next") || pathname.startsWith("/public")) return true;
  return false;
}

const PROTECTED_PREFIXES = ["/dashboard", "/ventas", "/finanzas", "/soporte", "/accounting"];

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  if (isPublic(pathname)) {
    // Dejar pasar paths públicos
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) {
    // Cualquier otro path no listado se considera público por ahora
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE)?.value;
  if (!token || !SECRET_RAW) {
    const url = new URL("/login", req.url);
    url.search = "?error=session";
    return NextResponse.redirect(url);
  }

  try {
    await jose.jwtVerify(token, new TextEncoder().encode(SECRET_RAW), { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    const url = new URL("/login", req.url);
    url.search = "?error=session";
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
