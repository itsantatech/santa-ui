import { NextResponse, type NextRequest } from "next/server";
import {
  authCookies,
  getBaseUrl,
  keycloakConfig,
} from "@/lib/auth/keycloak";
import { defaultLocale, isLocale } from "@/lib/i18n";

function signOutResponse(request: NextRequest) {
  const requestedLocale = request.nextUrl.searchParams.get("locale");
  const locale = isLocale(requestedLocale ?? "") ? requestedLocale : defaultLocale;
  const postLogoutRedirectUri = `${getBaseUrl(request.url)}/${locale}`;
  const logoutUrl = new URL(keycloakConfig.logoutEndpoint);
  const idToken = request.cookies.get(authCookies.idToken)?.value;

  logoutUrl.searchParams.set("client_id", keycloakConfig.clientId);
  logoutUrl.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  if (idToken) {
    logoutUrl.searchParams.set("id_token_hint", idToken);
  }

  const response = NextResponse.redirect(logoutUrl);

  response.cookies.set(authCookies.accessToken, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.refreshToken, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.idToken, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.state, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.verifier, "", { maxAge: 0, path: "/" });
  response.cookies.set(authCookies.returnTo, "", { maxAge: 0, path: "/" });

  return response;
}

export async function GET(request: NextRequest) {
  return signOutResponse(request);
}

export async function POST(request: NextRequest) {
  return signOutResponse(request);
}
