import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";
type Props = { params: Promise<{ orderCode: string }> };
export async function POST(request: NextRequest, { params }: Props) { const { orderCode } = await params; return proxySantaApiRequest(request, `/payments/omise/orders/${encodeURIComponent(orderCode)}/charge`); }
