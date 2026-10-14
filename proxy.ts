import { NextResponse, type NextRequest } from "next/server";
import { authCookies, decodeJwtPayload, keycloakConfig } from "@/lib/auth/keycloak";

type TokenPayload = {
  exp?: number;
};

type KeycloakRefreshResponse = {
  access_token?: string;
  expires_in?: number;
  id_token?: string;
  refresh_expires_in?: number;
  refresh_token?: string;
};

export async function proxy(request: NextRequest) {
  const accessToken = request.cookies.get(authCookies.accessToken)?.value;

  if (accessToken && !isTokenExpired(accessToken)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(authCookies.refreshToken)?.value;

  if (!refreshToken) {
    return NextResponse.next();
  }

  const tokens = await refreshAccessToken(refreshToken);

  if (!tokens?.access_token) {
    return NextResponse.next();
  }

  // Redirect once so the subsequent Server Component render receives the new cookies.
  const response = NextResponse.redirect(request.nextUrl);
  const secure = request.nextUrl.protocol === "https:";

  response.cookies.set(authCookies.accessToken, tokens.access_token, {
    httpOnly: true,
    maxAge: tokens.expires_in ?? 300,
    path: "/",
    sameSite: "lax",
    secure,
  });

  if (tokens.refresh_token && tokens.refresh_expires_in) {
    response.cookies.set(authCookies.refreshToken, tokens.refresh_token, {
      httpOnly: true,
      maxAge: tokens.refresh_expires_in,
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

  return response;
}

export const config = {
  matcher: [
    "/:locale(th|en)/admin/:path*",
    "/:locale(th|en)/profile",
    "/:locale(th|en)/cart",
    "/:locale(th|en)/orders/:path*",
  ],
};

function isTokenExpired(token: string) {
  const payload = decodeJwtPayload<TokenPayload>(token);

  return !payload?.exp || payload.exp * 1000 <= Date.now() + 15_000;
}

async function refreshAccessToken(refreshToken: string) {
  try {
    const body = new URLSearchParams({
      client_id: keycloakConfig.clientId,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    });
    const clientSecret = process.env.KEYCLOAK_CLIENT_SECRET;

    if (clientSecret) {
      body.set("client_secret", clientSecret);
    }

    const response = await fetch(keycloakConfig.tokenEndpoint, {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
    });

    return response.ok ? ((await response.json()) as KeycloakRefreshResponse) : null;
  } catch {
    return null;
  }
}
