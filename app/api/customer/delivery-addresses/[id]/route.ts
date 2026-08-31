import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

type Props = { params: Promise<{ id: string }> };
export async function PATCH(request: NextRequest, { params }: Props) { const { id } = await params; return proxySantaApiRequest(request, `/customer/delivery-addresses/${encodeURIComponent(id)}`); }
export async function DELETE(request: NextRequest, { params }: Props) { const { id } = await params; return proxySantaApiRequest(request, `/customer/delivery-addresses/${encodeURIComponent(id)}`); }
