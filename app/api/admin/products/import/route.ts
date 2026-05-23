import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function POST(request: Request) {
  return proxySantaApiRequest(request, "/products/import");
}
