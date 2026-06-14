"use client";

import { useState } from "react";

export function ProductDetailActions({
  locale,
}: {
  locale: "th" | "en";
}) {
  const [quantity, setQuantity] = useState(2);

  return (
    <div className="product-detail-actions">
      <div className="product-detail-quantity">
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

      <div className="product-detail-cta-row">
        <button className="product-detail-cart-button" type="button">
          {locale === "th" ? "เพิ่มลงตะกร้า" : "Add to cart"}
        </button>
      </div>

      <div className="product-detail-cta-row product-detail-cta-row-secondary">
        <button className="product-detail-secondary-button" type="button">
          {locale === "th" ? "สอบถามตัวแทนจำหน่าย" : "Contact reseller"}
        </button>
        <button className="product-detail-secondary-button product-detail-secondary-button-dark" type="button">
          {locale === "th" ? "ขอใบเสนอราคา" : "Request quotation"}
        </button>
      </div>

      <p className="product-detail-cta-note">
        {locale === "th"
          ? "เจ้าหน้าที่จะติดต่อกลับพร้อมใบเสนอราคาภายใน 24 ชม."
          : "Our team will contact you with a quotation within 24 hours."}
      </p>
    </div>
  );
}
