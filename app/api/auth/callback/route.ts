import { NextResponse, type NextRequest } from "next/server";
import {
  authCookies,
  decodeJwtPayload,
  getCallbackUrl,
  getBaseUrl,
  getUserRoles,
  hasAdminRole,
  keycloakConfig,
} from "@/lib/auth/keycloak";
import { defaultLocale, isLocale } from "@/lib/i18n";

type TokenResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
};

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const storedState = request.cookies.get(authCookies.state)?.value;
  const verifier = request.cookies.get(authCookies.verifier)?.value;
  const returnTo =
    request.cookies.get(authCookies.returnTo)?.value ?? `/${defaultLocale}`;

  if (!code || !state || !storedState || state !== storedState || !verifier) {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const tokenResponse = await fetch(keycloakConfig.tokenEndpoint, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: keycloakConfig.clientId,
      code,
      code_verifier: verifier,
      grant_type: "authorization_code",
      redirect_uri: getCallbackUrl(request.url),
    }),
    cache: "no-store",
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url));
  }

  const tokens = (await tokenResponse.json()) as TokenResponse;
  const payload = decodeJwtPayload(tokens.access_token);
  const roles = payload ? getUserRoles(payload) : [];
  const redirectTo = hasAdminRole(roles)
    ? getLocalizedAdminPath(returnTo)
    : returnTo;
  const response = NextResponse.redirect(new URL(redirectTo, getBaseUrl(request.url)));
  const secure = request.nextUrl.protocol === "https:";

  response.cookies.set(authCookies.accessToken, tokens.access_token, {
    httpOnly: true,
    maxAge: tokens.expires_in ?? 300,
    path: "/",
    sameSite: "lax",
    secure,
  });

  if (tokens.refresh_token) {
    response.cookies.set(authCookies.refreshToken, tokens.refresh_token, {
      httpOnly: true,
      maxAge: tokens.refresh_expires_in ?? 30 * 60,
      path: "/",
      sameSite: "lax",
      secure,
    });
  }

  if (tokens.id_token) {
    response.cookies.set(authCookies.idToken, tokens.id_token, {
      httpOnly: true,
      maxAge: tokens.expires_in ?? 300,
      path: "/",
      sameSite: "lax",
      secure,
    });
  }

  response.cookies.set(authCookies.state, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.verifier, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.returnTo, "", { maxAge: 0, path: "/" });

  return response;
}

function getLocalizedAdminPath(returnTo: string) {
  const [, maybeLocale] = returnTo.split("/");
  const locale = isLocale(maybeLocale) ? maybeLocale : defaultLocale;

  return `/${locale}/admin`;
}
