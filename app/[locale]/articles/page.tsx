import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteNavbar } from "@/components/site-navbar";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const content = getDictionary(locale);

  return {
    title: content.newsDropdown.articles,
    description: content.newsDropdown.articles,
  };
}

export default async function ArticlesPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="hero-band">
        <div className="hero-copy">
          <h1>{getDictionary(locale).newsDropdown.articles}</h1>
        </div>
      </section>
    </main>
  );
}
