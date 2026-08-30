import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";
export async function GET(request: NextRequest) { return proxySantaApiRequest(request, "/payments/omise/config"); }
