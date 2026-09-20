import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function GET(request: NextRequest) {
  return proxySantaApiRequest(request, "/customer-auth/profile");
}

export async function PATCH(request: NextRequest) {
  return proxySantaApiRequest(request, "/customer-auth/profile");
}
