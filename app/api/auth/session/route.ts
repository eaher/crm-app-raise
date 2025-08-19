// app/api/auth/session/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { OAuth2Client } from "google-auth-library";
import * as jose from "jose";

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const APPS_URL = process.env.APPS_SCRIPT_ALLOWLIST_URL!;
const COOKIE = process.env.SESSION_COOKIE_NAME ?? "__session";
const MAX_DAYS = Number(process.env.SESSION_MAX_DAYS ?? 7);
const SECRET = new TextEncoder().encode(process.env.SESSION_JWT_SECRET!);

const oAuthClient = new OAuth2Client(CLIENT_ID);

type AllowResp = { allow?: boolean };

export async function GET() {
  // Devuelve info mínima de sesión (email) si el JWT es válido
  try {
    const token = cookies().get(COOKIE)?.value;
    if (!token) return NextResponse.json({ email: null }, { status: 200 });
    const { payload } = await jose.jwtVerify(token, SECRET, { algorithms: ["HS256"] });
    return NextResponse.json({ email: payload.email ?? null }, { status: 200 });
  } catch {
    return NextResponse.json({ email: null }, { status: 200 });
  }
}

export async function POST(req: Request) {
  try {
    const { credential } = await req.json();
    if (!credential) {
      return NextResponse.json({ error: "missing-credential" }, { status: 400 });
    }

    // 1) Verificar ID Token de Google
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

    // 2) Chequear allowlist opcional vía Apps Script (espera {allow:true})
    let allowed = true;
    try {
      const r = await fetch(APPS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (r.ok) {
        const data = (await r.json()) as AllowResp;
        allowed = Boolean(data?.allow ?? true);
      }
    } catch {
      // Si falla el allowlist, por defecto dejamos pasar (ajusta a tu gusto)
      allowed = true;
    }

    if (!allowed) {
      return NextResponse.json({ error: "not-allowed" }, { status: 403 });
    }

    // 3) Firmar JWT y setear cookie
    const expSec = Math.floor(Date.now() / 1000) + MAX_DAYS * 24 * 60 * 60;
    const jwt = await new jose.SignJWT({ email })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime(expSec)
      .sign(SECRET);

    const res = NextResponse.json({ ok: true });
    res.cookies.set(COOKIE, jwt, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: MAX_DAYS * 24 * 60 * 60,
    });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "invalid-credential" }, { status: 401 });
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
