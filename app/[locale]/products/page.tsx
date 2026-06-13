import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList } from "@/lib/admin-api";
import { isLocale, locales } from "@/lib/i18n";

type LocalePageProps = {
  params: Promise<{ locale: string }>;
};

type FooterCategory = {
  code: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
};

type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
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

  return {
    title: locale === "th" ? "สินค้า" : "Product",
    description: locale === "th" ? "สินค้า" : "Product",
  };
}

export default async function ProductPage({ params }: LocalePageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [categoriesResponse, socialContactsResponse] = await Promise.all([
    fetchAdminList<FooterCategory>("/categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
    fetchAdminList<FooterSocialContact>("/social-media-contacts", {
      isActive: true,
      page: 1,
      pageSize: 20,
    }),
  ]);

  const categories = sortFooterCategories(categoriesResponse?.items ?? []);
  const title = locale === "th" ? "สินค้า" : "Product";

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="public-page-empty-section" aria-labelledby="public-page-title">
        <div className="public-page-empty-copy">
          <h1 id="public-page-title">{title}</h1>
        </div>
      </section>
      <SiteFooter
        categories={categories}
        locale={locale}
        socialContacts={socialContactsResponse?.items ?? []}
      />
    </main>
  );
}

function sortFooterCategories(categories: FooterCategory[]) {
  return [...categories]
    .filter((item) => item.isActive)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
}
