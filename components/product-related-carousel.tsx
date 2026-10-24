"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

export function ProductRelatedCarousel({
  locale,
  products,
}: {
  locale: Locale;
  products: ProductCardData[];
}) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const track = trackRef.current;

    if (!track) return;

    const updateScrollState = () => {
      const maxScrollLeft = track.scrollWidth - track.clientWidth;
      setCanScrollLeft(track.scrollLeft > 4);
      setCanScrollRight(maxScrollLeft - track.scrollLeft > 4);
    };

    updateScrollState();
    track.addEventListener("scroll", updateScrollState, { passive: true });
    const observer = new ResizeObserver(updateScrollState);
    observer.observe(track);

    return () => {
      track.removeEventListener("scroll", updateScrollState);
      observer.disconnect();
    };
  }, [products]);

  function scroll(direction: "left" | "right") {
    const track = trackRef.current;

    if (!track) return;

    track.scrollBy({
      behavior: "smooth",
      left: (direction === "left" ? -1 : 1) * track.clientWidth * 0.9,
    });
  }

  return (
    <div className="product-detail-related-carousel">
      <button
        aria-label={locale === "th" ? "เลื่อนสินค้าย้อนกลับ" : "Scroll products left"}
        className="product-detail-related-nav product-detail-related-nav-left"
        disabled={!canScrollLeft}
        onClick={() => scroll("left")}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          arrow_back_ios_new
        </span>
      </button>
      <div className="product-detail-related-track" ref={trackRef}>
        {products.map((product) => (
          <div className="product-detail-related-track-item" key={product.sku}>
            <ProductCard locale={locale} product={product} />
          </div>
        ))}
      </div>
      <button
        aria-label={locale === "th" ? "เลื่อนสินค้าถัดไป" : "Scroll products right"}
        className="product-detail-related-nav product-detail-related-nav-right"
        disabled={!canScrollRight}
        onClick={() => scroll("right")}
        type="button"
      >
        <span aria-hidden="true" className="material-symbols-outlined">
          arrow_forward_ios
        </span>
      </button>
    </div>
  );
}
