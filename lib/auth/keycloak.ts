import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { randomBytes, createHash } from "node:crypto";

const keycloakBaseUrl =
  process.env.KEYCLOAK_BASE_URL ??
  process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL ??
  "http://localhost:8080";
const appBaseUrl =
  process.env.APP_BASE_URL ??
  process.env.NEXT_PUBLIC_APP_BASE_URL ??
  "http://localhost:3000";
const keycloakRealm = process.env.KEYCLOAK_REALM ?? "santa-web";
const keycloakClientId = process.env.KEYCLOAK_CLIENT_ID ?? "santa-ui";

const issuerUrl = `${keycloakBaseUrl}/realms/${keycloakRealm}`;
const oidcUrl = `${issuerUrl}/protocol/openid-connect`;

export const keycloakConfig = {
  clientId: keycloakClientId,
  authorizationEndpoint: `${oidcUrl}/auth`,
  tokenEndpoint: `${oidcUrl}/token`,
  logoutEndpoint: `${oidcUrl}/logout`,
};

export const authCookies = {
  accessToken: "santa_ui_access_token",
  refreshToken: "santa_ui_refresh_token",
  idToken: "santa_ui_id_token",
  state: "santa_ui_auth_state",
  verifier: "santa_ui_pkce_verifier",
  returnTo: "santa_ui_return_to",
} as const;

type KeycloakTokenPayload = {
  preferred_username?: string;
  name?: string;
  email?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] } | undefined>;
};

export type AuthSession = {
  username: string;
  roles: string[];
  isAdmin: boolean;
};

export function getBaseUrl(requestUrl: string) {
  if (appBaseUrl) {
    return appBaseUrl.replace(/\/$/, "");
  }

  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}`;
}

export function createRandomValue() {
  return base64UrlEncode(randomBytes(32));
}

export function createCodeChallenge(verifier: string) {
  return base64UrlEncode(createHash("sha256").update(verifier).digest());
}

export function getCallbackUrl(requestUrl: string) {
  return `${getBaseUrl(requestUrl)}/api/auth/callback`;
}

export const getSession = cache(async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(authCookies.accessToken)?.value;

  if (!accessToken) {
    return null;
  }

  const payload = decodeJwtPayload<KeycloakTokenPayload>(accessToken);

  if (!payload) {
    return null;
  }

  const roles = getUserRoles(payload);
  const username =
    payload.preferred_username ?? payload.name ?? payload.email ?? "User";

  return {
    username,
    roles,
    isAdmin: hasAdminRole(roles),
  };
});

export async function requireAdminSession({
  returnTo = "/th/admin",
  forbiddenRedirectTo = "/th",
}: {
  returnTo?: string;
  forbiddenRedirectTo?: string;
} = {}) {
  const session = await getSession();

  if (!session) {
    redirect(`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`);
  }

  if (!session.isAdmin) {
    redirect(forbiddenRedirectTo);
  }

  return session;
}

export function getUserRoles(payload: KeycloakTokenPayload) {
  const realmRoles = payload.realm_access?.roles ?? [];
  const clientRoles =
    payload.resource_access?.[keycloakConfig.clientId]?.roles ?? [];

  return Array.from(new Set([...realmRoles, ...clientRoles]));
}

export function hasAdminRole(roles: string[]) {
  return roles.some((role) => {
    const normalized = normalizeRole(role);
    return (
      normalized === "admin" ||
      normalized === "sales" ||
      normalized === "engineer" ||
      normalized === "accounting" ||
      normalized === "store" ||
      normalized === "super_admin" ||
      normalized === "superadmin"
    );
  });
}

export function decodeJwtPayload<T>(token: string): T | null {
  const [, payload] = token.split(".");

  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function base64UrlEncode(value: Buffer) {
  return value
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replaceAll("=", "");
}

function normalizeRole(role: string) {
  return role.toLowerCase().replace(/[\s-]+/g, "_");
}
