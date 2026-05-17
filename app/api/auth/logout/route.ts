import { NextResponse, type NextRequest } from "next/server";
import {
  authCookies,
  getBaseUrl,
  keycloakConfig,
} from "@/lib/auth/keycloak";
import { defaultLocale } from "@/lib/i18n";

export async function GET(request: NextRequest) {
  const idToken = request.cookies.get(authCookies.idToken)?.value;
  const postLogoutRedirectUri = `${getBaseUrl(request.url)}/${defaultLocale}`;
  const logoutUrl = new URL(keycloakConfig.logoutEndpoint);

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
