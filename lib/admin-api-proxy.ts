import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  authCookies,
  decodeJwtPayload,
  keycloakConfig,
} from "@/lib/auth/keycloak";
import { createSantaApiUrl } from "@/lib/admin-api";

type AdminProxyOptions = {
  method?: string;
  requireAuth?: boolean;
};

type TokenPayload = {
  exp?: number;
};

type RefreshedTokens = {
  accessToken: string;
  accessTokenMaxAge: number;
  refreshToken?: string;
  refreshTokenMaxAge?: number;
  idToken?: string;
};

type KeycloakRefreshResponse = {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  refresh_expires_in?: number;
};

export async function proxySantaApiRequest(
  request: Request,
  resourcePath: string,
  { method = request.method, requireAuth = true }: AdminProxyOptions = {},
) {
  const url = createSantaApiUrl(resourcePath);
  const requestUrl = new URL(request.url);
  requestUrl.searchParams.forEach((value, key) => {
    url.searchParams.append(key, value);
  });

  const headers = new Headers();
  const accept = request.headers.get("accept");
  const contentType = request.headers.get("content-type");

  if (accept) {
    headers.set("accept", accept);
  }

  if (contentType) {
    headers.set("content-type", contentType);
  }

  let refreshedTokens: RefreshedTokens | undefined;
  let refreshToken: string | undefined;

  if (requireAuth) {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(authCookies.accessToken)?.value;
    refreshToken = cookieStore.get(authCookies.refreshToken)?.value;
    const authState = await getAuthorizationState({
      accessToken,
      refreshToken,
    });

    if (!authState.accessToken) {
      return Response.json(
        { message: "Authentication required." },
        { status: 401 },
      );
    }

    headers.set("authorization", `Bearer ${authState.accessToken}`);
    refreshedTokens = authState.refreshedTokens;
  }

  const body = await readRequestBody(request, method);
  const response = await fetchSantaApi(url, {
    body,
    cache: "no-store",
    headers,
    method,
  });

  if (
    requireAuth &&
    response.status === 401 &&
    refreshToken &&
    !refreshedTokens
  ) {
    const retriedTokens = await refreshAccessToken(refreshToken);

    if (retriedTokens) {
      headers.set("authorization", `Bearer ${retriedTokens.accessToken}`);
      refreshedTokens = retriedTokens;

      const retriedResponse = await fetchSantaApi(url, {
        body,
        cache: "no-store",
        headers,
        method,
      });

      return createProxyResponse(retriedResponse, request.url, refreshedTokens);
    }
  }

  return createProxyResponse(response, request.url, refreshedTokens);
}

async function readRequestBody(request: Request, method: string) {
  if (method === "GET" || method === "HEAD") {
    return undefined;
  }

  const body = await request.arrayBuffer();

  return body.byteLength > 0 ? body : undefined;
}

function createProxyResponse(
  response: Response,
  requestUrl: string,
  refreshedTokens?: RefreshedTokens,
) {
  const headers = new Headers();

  for (const headerName of [
    "content-disposition",
    "content-length",
    "content-type",
  ]) {
    const value = response.headers.get(headerName);

    if (value) {
      headers.set(headerName, value);
    }
  }

  headers.set("cache-control", "no-store");

  const proxyResponse = new NextResponse(response.body, {
    headers,
    status: response.status,
    statusText: response.statusText,
  });

  if (refreshedTokens) {
    const secure = new URL(requestUrl).protocol === "https:";

    proxyResponse.cookies.set(authCookies.accessToken, refreshedTokens.accessToken, {
      httpOnly: true,
      maxAge: refreshedTokens.accessTokenMaxAge,
      path: "/",
      sameSite: "lax",
      secure,
    });

    if (refreshedTokens.refreshToken && refreshedTokens.refreshTokenMaxAge) {
      proxyResponse.cookies.set(authCookies.refreshToken, refreshedTokens.refreshToken, {
        httpOnly: true,
        maxAge: refreshedTokens.refreshTokenMaxAge,
        path: "/",
        sameSite: "lax",
        secure,
      });
    }

    if (refreshedTokens.idToken) {
      proxyResponse.cookies.set(authCookies.idToken, refreshedTokens.idToken, {
        httpOnly: true,
        maxAge: refreshedTokens.accessTokenMaxAge,
        path: "/",
        sameSite: "lax",
        secure,
      });
    }
  }

  return proxyResponse;
}

async function fetchSantaApi(url: URL, init: RequestInit) {
  try {
    return await fetch(url, init);
  } catch {
    return Response.json(
      { message: "Unable to reach santa-api." },
      { status: 502 },
    );
  }
}

async function getAuthorizationState({
  accessToken,
  refreshToken,
}: {
  accessToken?: string;
  refreshToken?: string;
}) {
  if (accessToken && !isTokenExpired(accessToken)) {
    return { accessToken };
  }

  if (!refreshToken) {
    return { accessToken: undefined };
  }

  const refreshedTokens = await refreshAccessToken(refreshToken);

  if (!refreshedTokens) {
    return { accessToken: undefined };
  }

  return {
    accessToken: refreshedTokens.accessToken,
    refreshedTokens,
  };
}

function isTokenExpired(token: string) {
  const payload = decodeJwtPayload<TokenPayload>(token);

  if (!payload?.exp) {
    return true;
  }

  return payload.exp * 1000 <= Date.now() + 15_000;
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<RefreshedTokens | undefined> {
  try {
    const response = await fetch(keycloakConfig.tokenEndpoint, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: keycloakConfig.clientId,
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return undefined;
    }

    const tokens = (await response.json()) as KeycloakRefreshResponse;

    if (!tokens.access_token) {
      return undefined;
    }

    return {
      accessToken: tokens.access_token,
      accessTokenMaxAge: tokens.expires_in ?? 300,
      refreshToken: tokens.refresh_token,
      refreshTokenMaxAge: tokens.refresh_expires_in,
      idToken: tokens.id_token,
    };
  } catch {
    return undefined;
  }
}
