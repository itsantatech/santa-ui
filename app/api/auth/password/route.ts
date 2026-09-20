import { NextResponse, type NextRequest } from "next/server";
import { authCookies, decodeJwtPayload, getBaseUrl, getUserRoles, hasAdminRole, keycloakConfig } from "@/lib/auth/keycloak";
import { defaultLocale, isLocale } from "@/lib/i18n";

type TokenResponse = { access_token: string; refresh_token?: string; id_token?: string; expires_in?: number; refresh_expires_in?: number };

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const username = String(form.get("username") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const locale = String(form.get("locale") ?? defaultLocale);
  const returnTo = safeReturnTo(String(form.get("returnTo") ?? ""), isLocale(locale) ? `/${locale}` : `/${defaultLocale}`);
  if (!username || !password) return NextResponse.redirect(new URL(`/${isLocale(locale) ? locale : defaultLocale}/login?error=missing`, request.url));
  const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;
  const body = new URLSearchParams({ client_id: keycloakConfig.clientId, grant_type: "password", password, scope: "openid profile email", username });
  if (clientSecret) body.set("client_secret", clientSecret);
  const tokenResponse = await fetch(keycloakConfig.tokenEndpoint, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body, cache: "no-store" }).catch(() => null);
  if (!tokenResponse?.ok) {
    const detail = tokenResponse ? await tokenResponse.json().catch(() => null) as { error?: string } | null : null;
    const error = getSafeLoginError(detail?.error);
    return NextResponse.redirect(new URL(`/${isLocale(locale) ? locale : defaultLocale}/login?error=${error}`, request.url));
  }
  const tokens = await tokenResponse.json() as TokenResponse;
  const payload = decodeJwtPayload(tokens.access_token);
  const redirectTo = payload && hasAdminRole(getUserRoles(payload)) ? `/${isLocale(locale) ? locale : defaultLocale}/admin` : returnTo;
  const response = NextResponse.redirect(new URL(redirectTo, getBaseUrl(request.url)));
  const secure = request.nextUrl.protocol === "https:";
  response.cookies.set(authCookies.accessToken, tokens.access_token, { httpOnly: true, maxAge: tokens.expires_in ?? 300, path: "/", sameSite: "lax", secure });
  if (tokens.refresh_token) response.cookies.set(authCookies.refreshToken, tokens.refresh_token, { httpOnly: true, maxAge: tokens.refresh_expires_in ?? 1800, path: "/", sameSite: "lax", secure });
  if (tokens.id_token) response.cookies.set(authCookies.idToken, tokens.id_token, { httpOnly: true, maxAge: tokens.expires_in ?? 300, path: "/", sameSite: "lax", secure });
  return response;
}

function safeReturnTo(value: string, fallback: string) { return value.startsWith("/") && !value.startsWith("//") ? value : fallback; }

function getSafeLoginError(error?: string) {
  if (error === "unauthorized_client") return "client";
  if (error === "invalid_client") return "client";
  if (error === "invalid_grant") return "credentials";
  return "unavailable";
}
