import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

type Props = { params: Promise<{ orderCode: string }> };

export async function PATCH(request: NextRequest, { params }: Props) {
  const { orderCode } = await params;
  return proxySantaApiRequest(request, `/orders/admin/${encodeURIComponent(orderCode)}`);
}
