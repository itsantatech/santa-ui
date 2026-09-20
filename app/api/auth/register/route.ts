import { NextResponse, type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function POST(request: NextRequest) {
  const form = await request.clone().formData();
  const locale = String(form.get("locale") ?? "th");
  const response = await proxySantaApiRequest(request, "/customer-auth/register", {
    requireAuth: false,
  });
  const suffix = response.ok ? "?registered=1" : "?register=error";
  return NextResponse.redirect(new URL(`/${locale}/login${suffix}`, request.url));
}
