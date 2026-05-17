import { requireAdminSession } from "@/lib/auth/keycloak";
import { isLocale } from "@/lib/i18n";
import { notFound } from "next/navigation";

type AdminPageProps = {
  params: Promise<{ locale: string }>;
};

export const metadata = {
  title: "Admin | SantaTech",
};

export default async function AdminPage({ params }: AdminPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const session = await requireAdminSession({
    returnTo: `/${locale}/admin`,
    forbiddenRedirectTo: `/${locale}`,
  });

  return (
    <main className="admin-shell">
      <section className="admin-panel">
        <p className="admin-eyebrow">SantaTech Admin</p>
        <h1>Admin</h1>
        <p>Signed in as {session.username}</p>
      </section>
    </main>
  );
}
