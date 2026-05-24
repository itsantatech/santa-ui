import { type NextRequest } from "next/server";
import { proxySantaApiRequest } from "@/lib/admin-api-proxy";

const allowedResources = new Set([
  "admin-users",
  "about-page-settings",
  "brands",
  "categories",
  "home-section-settings",
  "inventory-stocks",
  "social-media-contacts",
  "sub-categories",
]);

type ResourceRouteProps = {
  params: Promise<{ resource: string }>;
};

export async function GET(request: NextRequest, props: ResourceRouteProps) {
  const resource = await getAllowedResource(props);

  if (!resource) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  return proxySantaApiRequest(withDefaultListPagination(request), `/${resource}`, {
    requireAuth: resource === "admin-users",
  });
}

export async function POST(request: NextRequest, props: ResourceRouteProps) {
  const resource = await getAllowedResource(props);

  if (!resource) {
    return Response.json({ message: "Not found." }, { status: 404 });
  }

  return proxySantaApiRequest(request, `/${resource}`);
}

async function getAllowedResource({ params }: ResourceRouteProps) {
  const { resource } = await params;

  return allowedResources.has(resource) ? resource : null;
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
