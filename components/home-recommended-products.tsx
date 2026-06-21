"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ProductCard, type ProductCardData } from "@/components/product-card";
import type { Locale } from "@/lib/i18n";

export type RecommendedProductTab = {
  key: "best-seller" | "new-product" | "promotion";
  label: string;
  products: ProductCardData[];
};

export function HomeRecommendedProducts({
  ctaHref,
  ctaLabel,
  emptyLabel,
  locale,
  tabs,
}: {
  ctaHref: string;
  ctaLabel: string;
  emptyLabel: string;
  locale: Locale;
  tabs: RecommendedProductTab[];
}) {
  const firstTabWithProducts = tabs.find((tab) => tab.products.length > 0)?.key ?? tabs[0]?.key;
  const [activeTab, setActiveTab] = useState<RecommendedProductTab["key"] | undefined>(
    firstTabWithProducts,
  );
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const currentTab = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];

  useEffect(() => {
    const node = trackRef.current;

    if (!node) {
      return;
    }

    const updateScrollState = () => {
      const maxLeft = node.scrollWidth - node.clientWidth;
      setCanScrollLeft(node.scrollLeft > 4);
      setCanScrollRight(maxLeft - node.scrollLeft > 4);
    };

    updateScrollState();
    node.scrollLeft = 0;

    node.addEventListener("scroll", updateScrollState, { passive: true });
    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [activeTab]);

  const scrollTrack = (direction: "left" | "right") => {
    const node = trackRef.current;

    if (!node) {
      return;
    }

    const amount = Math.max(node.clientWidth * 0.85, 320);
    node.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (!currentTab) {
    return null;
  }

  return (
    <div className="home-recommended-section-content">
      <div className="home-recommended-toolbar">
        <div className="home-recommended-tabs" role="tablist" aria-label="Recommended products">
          {tabs.map((tab) => {
            const isActive = tab.key === currentTab.key;

            return (
              <button
                aria-selected={isActive}
                className={
                  isActive
                    ? "home-recommended-tab home-recommended-tab-active"
                    : "home-recommended-tab"
                }
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {currentTab.products.length > 0 ? (
        <div className="home-recommended-carousel">
          <button
            aria-label={locale === "th" ? "เลื่อนซ้าย" : "Scroll left"}
            className="home-recommended-nav-button home-recommended-nav-button-left"
            disabled={!canScrollLeft}
            onClick={() => scrollTrack("left")}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              arrow_back_ios_new
            </span>
          </button>

          <div className="home-recommended-track" ref={trackRef}>
            {currentTab.products.map((product) => (
              <div className="home-recommended-track-item" key={`${currentTab.key}-${product.sku}`}>
                <ProductCard locale={locale} product={product} />
              </div>
            ))}
          </div>

          <button
            aria-label={locale === "th" ? "เลื่อนขวา" : "Scroll right"}
            className="home-recommended-nav-button home-recommended-nav-button-right"
            disabled={!canScrollRight}
            onClick={() => scrollTrack("right")}
            type="button"
          >
            <span aria-hidden="true" className="material-symbols-outlined">
              arrow_forward_ios
            </span>
          </button>
        </div>
      ) : (
        <div className="home-recommended-empty">{emptyLabel}</div>
      )}

      <Link className="home-recommended-cta" href={ctaHref}>
        {ctaLabel}
      </Link>
    </div>
  );
}
