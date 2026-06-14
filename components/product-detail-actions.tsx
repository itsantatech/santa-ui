"use client";

import { useState } from "react";
import { QuotationRequestModal } from "./quotation-request-modal";

export function ProductDetailActions({
  canAddToCart,
  lineUrl,
  locale,
  productNameEn,
  productNameTh,
  productSku,
  productSlug,
}: {
  canAddToCart: boolean;
  lineUrl: string | null;
  locale: "th" | "en";
  productNameEn: string;
  productNameTh: string;
  productSku: string;
  productSlug: string;
}) {
  const [quantity, setQuantity] = useState(1);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);

  return (
    <>
      <div className="product-detail-actions">
        {canAddToCart ? (
          <div className="product-detail-primary-actions">
            <div className="product-detail-quantity product-detail-quantity-block">
              <span>{locale === "th" ? "จำนวน" : "Quantity"}</span>
              <div className="product-detail-quantity-control">
                <button
                  onClick={() => setQuantity((current) => Math.max(1, current - 1))}
                  type="button"
                >
                  -
                </button>
                <strong>{quantity}</strong>
                <button onClick={() => setQuantity((current) => current + 1)} type="button">
                  +
                </button>
              </div>
            </div>

            <button className="product-detail-cart-button" type="button">
              {locale === "th" ? "เพิ่มลงตะกร้า" : "Add to cart"}
            </button>
          </div>
        ) : null}

        <div className="product-detail-cta-row product-detail-cta-row-secondary">
          {lineUrl ? (
            <a
              className="product-detail-secondary-button"
              href={lineUrl}
              rel="noreferrer"
              target="_blank"
            >
              {locale === "th" ? "สอบถามด่วนผ่านไลน์" : "Quick inquiry via Line"}
            </a>
          ) : (
            <button
              className="product-detail-secondary-button product-detail-secondary-button-disabled"
              disabled
              type="button"
            >
              {locale === "th" ? "สอบถามด่วนผ่านไลน์" : "Quick inquiry via Line"}
            </button>
          )}
          <button
            className="product-detail-secondary-button product-detail-secondary-button-dark"
            onClick={() => setIsQuotationModalOpen(true)}
            type="button"
          >
            {locale === "th" ? "ขอใบเสนอราคา" : "Request quotation"}
          </button>
        </div>

        <p className="product-detail-cta-note">
          {locale === "th"
            ? "เจ้าหน้าที่จะติดต่อกลับพร้อมใบเสนอราคาภายใน 24 ชม."
            : "Our team will contact you with a quotation within 24 hours."}
        </p>
      </div>
      {isQuotationModalOpen ? (
        <QuotationRequestModal
          defaultQuantity={quantity}
          locale={locale}
          onClose={() => setIsQuotationModalOpen(false)}
          productNameEn={productNameEn}
          productNameTh={productNameTh}
          productSku={productSku}
          productSlug={productSlug}
        />
      ) : null}
    </>
  );
}
