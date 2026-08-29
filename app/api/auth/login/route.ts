import { NextResponse, type NextRequest } from "next/server";
import {
  authCookies,
  createCodeChallenge,
  createRandomValue,
  getCallbackUrl,
  keycloakConfig,
} from "@/lib/auth/keycloak";
import { defaultLocale, isLocale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const state = createRandomValue();
  const verifier = createRandomValue();
  const locale = request.nextUrl.searchParams.get("locale");
  const requestedReturnTo = request.nextUrl.searchParams.get("returnTo");
  const returnTo = getSafeReturnTo(
    requestedReturnTo,
    isLocale(locale ?? "") ? `/${locale}` : `/${defaultLocale}`,
  );

  const authUrl = new URL(keycloakConfig.authorizationEndpoint);
  authUrl.searchParams.set("client_id", keycloakConfig.clientId);
  authUrl.searchParams.set("redirect_uri", getCallbackUrl(request.url));
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid profile email");
  authUrl.searchParams.set("prompt", "login");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("code_challenge", createCodeChallenge(verifier));
  authUrl.searchParams.set("code_challenge_method", "S256");

  const response = NextResponse.redirect(authUrl);
  const secure = request.nextUrl.protocol === "https:";

  response.cookies.set(authCookies.state, state, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure,
  });
  response.cookies.set(authCookies.verifier, verifier, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure,
  });
  response.cookies.set(authCookies.returnTo, returnTo, {
    httpOnly: true,
    maxAge: 10 * 60,
    path: "/",
    sameSite: "lax",
    secure,
  });

  return response;
}

function getSafeReturnTo(value: string | null, fallback: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}
