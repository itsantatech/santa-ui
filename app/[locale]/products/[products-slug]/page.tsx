import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import { ProductDetailActions } from "@/components/product-detail-actions";
import { ProductDetailGallery } from "@/components/product-detail-gallery";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import { fetchAdminList, santaApiBaseUrl } from "@/lib/admin-api";
import { isLocale, locales, type Locale } from "@/lib/i18n";

type ProductDetailPageProps = {
  params: Promise<{ locale: string; "products-slug": string }>;
};

type FooterCategory = {
  code: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
};

type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

type ProductRelation = {
  code: string;
  categoryCode?: string;
  nameTh: string;
  nameEn: string;
  imgUrl?: string | null;
};

type ProductDetailRow = ProductCardData & {
  sku: string;
  rank: number;
  descriptionTh: string;
  descriptionEn: string;
  datasheetUrl: string | null;
  model: string | null;
  isActive: boolean;
  isPromotion: boolean;
  categories: ProductRelation[];
  subCategories: ProductRelation[];
  brands: ProductRelation[];
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { locale, "products-slug": productSlug } = await params;

  if (!isLocale(locale)) {
    return {};
  }

  const product = await getProductDetail(productSlug);
  const title = product
    ? locale === "th"
      ? product.nameTh
      : product.nameEn
    : formatSlugLabel(productSlug);

  return {
    title,
    description:
      locale === "th"
        ? stripHtml(product?.shortDescriptionTh) || title
        : stripHtml(product?.shortDescriptionEn) || title,
  };
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale, "products-slug": productSlug } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const [product, categoriesResponse, socialContactsResponse] = await Promise.all([
    getProductDetail(productSlug),
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

  if (!product || !product.isActive) {
    notFound();
  }

  const relatedCategoryCode =
    product.categories[0]?.code || product.subCategories[0]?.categoryCode;
  const relatedBrandCode = product.brands[0]?.code;
  const relatedProductsResponse = await fetchAdminList<ProductDetailRow>("/products", {
    brandCode: relatedCategoryCode ? undefined : relatedBrandCode,
    categoryCode: relatedCategoryCode,
    isActive: true,
    page: 1,
    pageSize: 8,
  });

  const footerCategories = sortFooterCategories(categoriesResponse?.items ?? []);
  const relatedProducts = (relatedProductsResponse?.items ?? [])
    .filter((item) => item.slug.trim() !== product.slug.trim())
    .slice(0, 4);
  const productName = locale === "th" ? product.nameTh : product.nameEn;
  const productShortDescription =
    locale === "th" ? product.shortDescriptionTh : product.shortDescriptionEn;
  const productDescriptionHtml = normalizeRichTextHtml(
    locale === "th" ? product.descriptionTh : product.descriptionEn,
  );
  const categoryLabel = product.categories[0]
    ? locale === "th"
      ? product.categories[0].nameTh
      : product.categories[0].nameEn
    : locale === "th"
      ? "สินค้าและบริการ"
      : "Products & Services";
  const brand = product.brands[0];
  const currentPrice = product.discountedPrice ?? product.price;
  const discountPercent =
    product.price && product.discountedPrice && product.price > product.discountedPrice
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : null;

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />

      <section className="product-detail-page">
        <div className="product-detail-shell">
          <nav className="products-page-breadcrumb" aria-label="Breadcrumb">
            <Link href={`/${locale}`}>{locale === "th" ? "หน้าแรก" : "Home"}</Link>
            <span aria-hidden="true">&gt;</span>
            <span>{categoryLabel}</span>
          </nav>

          <div className="product-detail-layout">
            <ProductDetailGallery alt={productName} images={product.imgUrl} />

            <div className="product-detail-summary">
              <p className="product-detail-eyebrow">
                {product.isPromotion ? (locale === "th" ? "โปรโมชัน" : "Promotion") : "\u00A0"}
              </p>
              <h1>{productName}</h1>
              <p className="product-detail-short-description">{productShortDescription}</p>

              <div className="product-detail-brand-meta">
                <div className="product-detail-brand-card">
                  {brand?.imgUrl ? (
                    <Image
                      alt={brand.nameEn}
                      height={48}
                      src={brand.imgUrl}
                      unoptimized
                      width={48}
                    />
                  ) : (
                    <span className="material-symbols-outlined" aria-hidden="true">
                      link
                    </span>
                  )}
                  <strong>
                    {brand ? (locale === "th" ? brand.nameTh : brand.nameEn) : "Santa"}
                  </strong>
                </div>

                <div className="product-detail-meta-copy">
                  <span>SKU: {product.sku}</span>
                  <span>
                    {locale === "th" ? "สินค้าพร้อมจัดส่ง" : "Available for order"}
                  </span>
                </div>
              </div>

              <div className="product-detail-price-block">
                {currentPrice ? <strong>{formatPrice(currentPrice, locale)}</strong> : null}
                {product.discountedPrice && product.price ? (
                  <>
                    <span>{formatPrice(product.price, locale)}</span>
                    {discountPercent ? (
                      <em>
                        {locale === "th"
                          ? `ส่วนลด ${discountPercent} %`
                          : `${discountPercent}% off`}
                      </em>
                    ) : null}
                  </>
                ) : null}
              </div>

              <ProductDetailActions locale={locale} />
            </div>
          </div>

          <section className="product-detail-description-section">
            <h2>{locale === "th" ? "รายละเอียดสินค้า" : "Product details"}</h2>
            <div
              className="product-detail-description-copy"
              dangerouslySetInnerHTML={{ __html: productDescriptionHtml }}
            />
            {product.datasheetUrl ? (
              <a
                className="product-detail-datasheet-button"
                href={product.datasheetUrl}
                rel="noreferrer"
                target="_blank"
              >
                {locale === "th"
                  ? "ดาวน์โหลดข้อมูลสินค้า (PDF)"
                  : "Download product datasheet (PDF)"}
              </a>
            ) : null}
          </section>

          {relatedProducts.length > 0 ? (
            <section className="product-detail-related-section">
              <h2>{locale === "th" ? "สินค้าที่คุณอาจสนใจ" : "You may also like"}</h2>
              <div className="products-page-grid product-detail-related-grid">
                {relatedProducts.map((relatedProduct) => (
                  <ProductCard
                    key={relatedProduct.sku}
                    locale={locale}
                    product={relatedProduct}
                  />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <SiteFooter
        categories={footerCategories}
        locale={locale}
        socialContacts={socialContactsResponse?.items ?? []}
      />
    </main>
  );
}

async function getProductDetail(slug: string) {
  const normalizedSlug = slug.trim();
  const response = await fetch(
    `${santaApiBaseUrl}/products/${encodeURIComponent(normalizedSlug)}`,
    { cache: "no-store" },
  );

  if (response.ok) {
    return (await response.json()) as ProductDetailRow;
  }

  const fallbackResponse = await fetchAdminList<ProductDetailRow>("/products", {
    isActive: true,
    page: 1,
    pageSize: 20,
    search: normalizedSlug,
  });

  return (
    fallbackResponse?.items.find(
      (item) => item.slug.trim().toLowerCase() === normalizedSlug.toLowerCase(),
    ) ?? null
  );
}

function formatSlugLabel(slug: string) {
  return decodeURIComponent(slug).replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function stripHtml(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .trim();
}

function normalizeRichTextHtml(value?: string | null) {
  if (!value?.trim()) {
    return "<p>-</p>";
  }

  return value
    .replace(/<p>\s*<\/p>/gi, "<p>&nbsp;</p>")
    .trim();
}

function sortFooterCategories(categories: FooterCategory[]) {
  return [...categories]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
}

function formatPrice(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}
