import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function GET(request: NextRequest) {
  return proxyToProductsApi(withDefaultListPagination(request));
}

export async function POST(request: NextRequest) {
  return proxyToProductsApi(request);
}

export function proxyToProductsApi(request: Request, path = "") {
  return proxySantaApiRequest(request, `/products${path}`, {
    requireAuth: request.method !== "GET" || path.length > 0,
  });
}

function withDefaultListPagination(request: NextRequest) {
  if (
    request.nextUrl.searchParams.has("page") &&
    request.nextUrl.searchParams.has("pageSize")
  ) {
    return request;
  }

  const url = request.nextUrl.clone();
  url.searchParams.set("page", url.searchParams.get("page") ?? "1");
  url.searchParams.set("pageSize", url.searchParams.get("pageSize") ?? "10");

  return new Request(url, request);
}
