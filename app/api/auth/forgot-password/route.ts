import { NextResponse, type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function POST(request: NextRequest) {
  const form = await request.clone().formData();
  const locale = String(form.get("locale") ?? "th");
  const response = await proxySantaApiRequest(request, "/customer-auth/password-reset", {
    requireAuth: false,
  });
  const suffix = response.ok ? "?reset=sent" : "?reset=error";
  return NextResponse.redirect(new URL(`/${locale}/forgot-password${suffix}`, request.url));
}
