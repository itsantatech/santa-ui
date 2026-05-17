import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { SiteNavbar } from "@/components/site-navbar";
import { requireAdminSession } from "@/lib/auth/keycloak";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: HomeProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const dictionary = getDictionary(locale);

  return {
    title: dictionary.metadataTitle,
    description: dictionary.metadataDescription,
    alternates: {
      languages: {
        th: "/th",
        en: "/en",
      },
    },
  };
}

export default async function Home({ params }: HomeProps) {
  const { locale } = await params;

  if (typeof locale !== "string" || !isLocale(locale)) {
    notFound();
  }

  await requireAdminSession({
    returnTo: `/${locale}/admin`,
    forbiddenRedirectTo: `/${locale}`,
  });
  const dictionary = getDictionary(locale);

  return (
    <main className="admin-page">
      <SiteNavbar locale={locale} variant="admin" />

      <div className="admin-layout">
        <AdminSidebar locale={locale} />
        <section className="admin-content" aria-labelledby="admin-heading">
          <h1 id="admin-heading">{dictionary.adminPageTitle}</h1>
        </section>
      </div>
    </main>
  );
}
