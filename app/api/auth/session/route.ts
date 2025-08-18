// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const APPS_URL = process.env.APPS_SCRIPT_ALLOWLIST_URL!;
const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";
const MAX_DAYS = Number(process.env.SESSION_MAX_DAYS ?? 7);
const SECRET = new TextEncoder().encode(process.env.SESSION_JWT_SECRET!);

const oAuthClient = new OAuth2Client(CLIENT_ID);

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json({ error: "missing-credential" }, { status: 400 });
    }

    // 1) Verificar ID token con Google
    const ticket = await oAuthClient.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const email = payload?.email || null;
    const email_verified = payload?.email_verified;

    if (!email || !email_verified) {
      return NextResponse.json({ error: "email-not-verified" }, { status: 401 });
    }

    // 2) Consultar Apps Script (allowlist en Sheet)
    const allow = await fetch(APPS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
      cache: "no-store",
    }).then(r => r.json()).catch(() => ({ allowed: false }));

    if (!allow?.allowed) {
      return NextResponse.json({ error: "not-allowed" }, { status: 403 });
    }

    // 3) Emitir JWT en cookie HttpOnly
    const now = Math.floor(Date.now() / 1000);
    const exp = now + MAX_DAYS * 24 * 60 * 60;

    const token = await new jose.SignJWT({
      sub: email,
      name: payload?.name,
      picture: payload?.picture,
      iss: "crm-app",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuedAt(now)
      .setExpirationTime(exp)
      .sign(SECRET);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: exp - now,
    });
    return res;
  } catch (e) {
    return NextResponse.json({ error: "invalid-token" }, { status: 401 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return res;
}
