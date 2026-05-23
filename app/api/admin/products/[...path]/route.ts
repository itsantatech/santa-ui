import { type NextRequest } from "next/server";
import { proxyToProductsApi } from "../route";

type ProductProxyRouteProps = {
  params: Promise<{ path?: string[] }>;
};

export async function GET(request: NextRequest, props: ProductProxyRouteProps) {
  return proxyProductPath(request, props);
}

export async function PATCH(request: NextRequest, props: ProductProxyRouteProps) {
  return proxyProductPath(request, props);
}

export async function POST(request: NextRequest, props: ProductProxyRouteProps) {
  return proxyProductPath(request, props);
}

export async function DELETE(
  request: NextRequest,
  props: ProductProxyRouteProps,
) {
  return proxyProductPath(request, props);
}

async function proxyProductPath(
  request: NextRequest,
  { params }: ProductProxyRouteProps,
) {
  const { path = [] } = await params;

  return proxyToProductsApi(request, `/${path.map(encodeURIComponent).join("/")}`);
}
