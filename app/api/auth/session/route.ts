import { getSession } from "@/lib/auth/keycloak";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();

  return Response.json(
    { session },
    {
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    },
  );
}
