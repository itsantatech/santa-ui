import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type ProductRelation = {
  code: string;
  nameTh: string;
  nameEn: string;
};

export type ProductCardData = {
  sku: string;
  slug: string;
  nameTh: string;
  nameEn: string;
  shortDescriptionTh: string;
  shortDescriptionEn: string;
  imgUrl: string[];
  isPromotion?: boolean;
  price: number | null;
  discountedPrice: number | null;
  brands: ProductRelation[];
};

export function ProductCard({
  locale,
  product,
}: {
  locale: Locale;
  product: ProductCardData;
}) {
  const name = locale === "th" ? product.nameTh : product.nameEn;
  const description =
    locale === "th" ? product.shortDescriptionTh : product.shortDescriptionEn;
  const href = `/${locale}/products/${product.slug.trim()}`;
  const imageSrc = product.imgUrl[0] || null;
  const currentPrice = product.discountedPrice ?? product.price;
  const discountPercent =
    product.price && product.discountedPrice && product.price > product.discountedPrice
      ? Math.round(((product.price - product.discountedPrice) / product.price) * 100)
      : null;

  return (
    <article className="product-card">
      <Link className="product-card-media" href={href}>
        {imageSrc ? (
          <Image
            alt={name}
            className="product-card-image"
            fill
            sizes="311px"
            src={imageSrc}
            unoptimized
          />
        ) : (
          <span className="product-card-image-placeholder" aria-hidden="true" />
        )}
      </Link>

      <div className="product-card-copy">
        <p className="product-card-brand">
          {product.isPromotion ? (locale === "th" ? "โปรโมชัน" : "Promotion") : "\u00A0"}
        </p>
        <Link className="product-card-name" href={href}>
          {name}
        </Link>
        <p className="product-card-description">{description}</p>

        {currentPrice ? (
          <div className="product-card-pricing">
            <strong>{formatPrice(currentPrice, locale)}</strong>
            {product.discountedPrice && product.price ? (
              <div className="product-card-price-meta">
                <span>{formatPrice(product.price, locale)}</span>
                {discountPercent ? (
                  <em>
                    {locale === "th" ? `ส่วนลด ${discountPercent}%` : `${discountPercent}% off`}
                  </em>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : (
          <span className="product-card-enquiry">
            {locale === "th" ? "ขอใบเสนอราคา" : "Request a quotation"}
          </span>
        )}
      </div>
    </article>
  );
}

function formatPrice(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
    style: "currency",
    currency: "THB",
    maximumFractionDigits: 0,
  }).format(value);
}
