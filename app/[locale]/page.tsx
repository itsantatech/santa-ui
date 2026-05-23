import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductFilter } from "@/components/product-filter";
import { fetchAdminList } from "@/lib/admin-api";
import { SiteNavbar } from "@/components/site-navbar";
import { getDictionary, isLocale, locales } from "@/lib/i18n";

type HomeProps = {
  params: Promise<{ locale: string }>;
};

type CategoryOption = {
  code: string;
  nameTh: string;
  nameEn: string;
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

  const isThaiLocale = locale === "th";
  const categoryResponse = await fetchAdminList<CategoryOption>("/categories", {
    page: 1,
    pageSize: 100,
  });
  const categoryOptions = (categoryResponse?.items ?? []).map((category) => ({
    label: isThaiLocale ? category.nameTh : category.nameEn,
    value: category.code,
  }));
  const productFilterContent = {
    fields: [
      {
        id: "category",
        label: isThaiLocale ? "หมวดหมู่" : "Category",
        options: categoryOptions,
        placeholder: isThaiLocale ? "เลือกหมวดหมู่" : "Select category",
      },
      {
        id: "subCategory",
        label: isThaiLocale ? "หมวดหมู่ย่อย" : "Sub-category",
        selected: [
          {
            label: isThaiLocale
              ? "เครื่องมือวัดงานทางด้านคุณภาพน้ำ"
              : "Water quality measuring tools",
            value: "water-quality-measuring-tools",
          },
        ],
      },
      {
        id: "brand",
        label: isThaiLocale ? "แบรนด์" : "Brand",
        selected: [
          {
            label: "Tenmars",
            value: "tenmars",
          },
        ],
      },
    ],
    removeFilterLabel: isThaiLocale ? "ลบตัวกรอง" : "Remove filter",
    resultLabel: isThaiLocale ? "ผลการค้นหาจำนวน" : "Search results",
    resultUnit: isThaiLocale ? "รายการ" : "items",
    title: isThaiLocale ? "ตัวกรอง" : "Filters",
  };

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />

      <Suspense fallback={null}>
        <ProductFilter
          fields={productFilterContent.fields}
          locale={isThaiLocale ? "th-TH" : "en-US"}
          removeFilterLabel={productFilterContent.removeFilterLabel}
          resultCount={289}
          resultLabel={productFilterContent.resultLabel}
          resultUnit={productFilterContent.resultUnit}
          title={productFilterContent.title}
        />
      </Suspense>
    </main>
  );
}
