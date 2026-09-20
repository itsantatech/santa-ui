import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

export async function POST(request: NextRequest) { return proxySantaApiRequest(request, "/orders/checkout"); }
