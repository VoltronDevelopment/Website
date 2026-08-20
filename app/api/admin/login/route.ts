import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createSessionToken,
  sessionCookieOptions,
  verifyLogin
} from "@/lib/admin-auth";
import { validationError, isValidationError } from "@/lib/errors";

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    const isFormPost =
      contentType.includes("application/x-www-form-urlencoded") ||
      contentType.includes("multipart/form-data");
    const body = isFormPost ? Object.fromEntries(await request.formData()) : await parseJsonBody(request);
    const username = typeof body.username === "string" ? body.username : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!username || !password) {
      validationError("Username and password are required.");
    }

    const user = verifyLogin(username, password);
    if (!user) {
      if (isFormPost) {
        const url = new URL("/admin/login?error=invalid", request.url);
        return NextResponse.redirect(url, { status: 303 });
      }
      return NextResponse.json({ ok: false, message: "Invalid credentials." }, { status: 401 });
    }

    const token = await createSessionToken(user);
    const response = isFormPost
      ? NextResponse.redirect(new URL("/admin/projects", request.url), { status: 303 })
      : NextResponse.json({ ok: true, user });
    response.cookies.set(sessionCookieOptions(token));
    return response;
  } catch (error) {
    if (isValidationError(error)) {
      return NextResponse.json({ ok: false, message: error.message }, { status: 400 });
    }
    console.error("[api/admin/login]", error);
    return NextResponse.json({ ok: false, message: "Login failed." }, { status: 500 });
  }
}

async function parseJsonBody(request: Request): Promise<Record<string, unknown>> {
  const text = await request.text();
  if (!text.trim()) return {};

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    validationError("Invalid login request.");
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: "",
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  });
  return response;
}
