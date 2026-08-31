import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function GET(request: Request) {
  return proxySantaApiRequest(request, "/quotation-requests/admin/export");
}
