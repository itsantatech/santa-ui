import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

type CartItemRouteProps = { params: Promise<{ productSku: string }> };

export async function PATCH(request: NextRequest, { params }: CartItemRouteProps) {
  const { productSku } = await params;
  return proxySantaApiRequest(request, `/cart/items/${encodeURIComponent(productSku)}`);
}

export async function DELETE(request: NextRequest, { params }: CartItemRouteProps) {
  const { productSku } = await params;
  return proxySantaApiRequest(request, `/cart/items/${encodeURIComponent(productSku)}`);
}
