import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

const allowedResources = new Set([
  "admin-users",
  "about-page-settings",
  "brands",
  "categories",
  "home-section-settings",
  "social-media-contacts",
  "sub-categories",
]);

type ResourcePathRouteProps = {
  params: Promise<{ path?: string[]; resource: string }>;
};

export async function GET(request: NextRequest, props: ResourcePathRouteProps) {
  return proxyResourcePath(request, props);
}

export async function PATCH(request: NextRequest, props: ResourcePathRouteProps) {
  return proxyResourcePath(request, props);
}

export async function POST(request: NextRequest, props: ResourcePathRouteProps) {
  return proxyResourcePath(request, props);
}

export async function DELETE(
  request: NextRequest,
  props: ResourcePathRouteProps,
) {
  return proxyResourcePath(request, props);
}

async function proxyResourcePath(
  request: NextRequest,
  { params }: ResourcePathRouteProps,
) {
  const { path = [], resource } = await params;

  if (!allowedResources.has(resource)) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  const encodedPath = path.map(encodeURIComponent).join("/");

  return proxySantaApiRequest(request, `/${resource}/${encodedPath}`);
}
