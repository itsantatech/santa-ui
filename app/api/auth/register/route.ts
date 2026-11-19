import { NextResponse, type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";
import { getBaseUrl } from "@/lib/auth/keycloak";

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const locale = String(form.get("locale") ?? "th");
  const firstName = String(form.get("firstName") ?? "").trim();
  const lastName = String(form.get("lastName") ?? "").trim();
  const registrationPayload = new URLSearchParams();

  for (const [key, value] of form.entries()) {
    if (key !== "firstName" && key !== "lastName") {
      registrationPayload.append(key, String(value));
    }
  }
  registrationPayload.set("firstName", firstName);
  registrationPayload.set("lastName", lastName);
  registrationPayload.set("fullName", [firstName, lastName].filter(Boolean).join(" "));

  const registrationRequest = new Request(request.url, {
    body: registrationPayload,
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  });
  const response = await proxySantaApiRequest(registrationRequest, "/customer-auth/register", {
    requireAuth: false,
  });
  const redirectTo = response.ok
    ? `/${locale}`
    : `/${locale}/register?register=error`;

  return NextResponse.redirect(new URL(redirectTo, getBaseUrl(request)), 303);
}
