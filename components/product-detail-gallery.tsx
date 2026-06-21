"use client";

import Image from "next/image";
import { useState } from "react";

export function ProductDetailGallery({
  alt,
  images,
}: {
  alt: string;
  images: string[];
}) {
  const normalizedImages = images.filter((image) => image.trim().length > 0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = normalizedImages[activeIndex] ?? null;
  const hasMultipleImages = normalizedImages.length > 1;

  function showPreviousImage() {
    setActiveIndex((current) =>
      normalizedImages.length === 0
        ? 0
        : (current - 1 + normalizedImages.length) % normalizedImages.length,
    );
  }

  function showNextImage() {
    setActiveIndex((current) =>
      normalizedImages.length === 0 ? 0 : (current + 1) % normalizedImages.length,
    );
  }

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-gallery-thumbs" aria-label="Product media">
        {(normalizedImages.length > 0 ? normalizedImages : [null]).map((image, index) => (
          <button
            aria-label={`Preview media ${index + 1}`}
            className={
              index === activeIndex
                ? "product-detail-thumb product-detail-thumb-active"
                : "product-detail-thumb"
            }
            key={image ?? `placeholder-${index}`}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            {image ? (
              isVideoUrl(image) ? (
                <>
                  <video
                    aria-hidden="true"
                    className="product-detail-thumb-video"
                    muted
                    playsInline
                    preload="metadata"
                    src={image}
                  />
                  <span className="product-detail-thumb-badge">Video</span>
                  <span className="product-detail-thumb-play" aria-hidden="true">▶</span>
                </>
              ) : (
                <Image
                  alt=""
                  className="product-detail-thumb-image"
                  fill
                  sizes="96px"
                  src={image}
                  unoptimized
                />
              )
            ) : null}
          </button>
        ))}
      </div>

      <div className="product-detail-gallery-main">
        {activeImage ? (
          <>
            {isVideoUrl(activeImage) ? (
              <video
                className="product-detail-gallery-video"
                controls
                playsInline
                preload="metadata"
                src={activeImage}
              />
            ) : (
              <Image
                alt={alt}
                className="product-detail-gallery-image"
                fill
                sizes="640px"
                src={activeImage}
                unoptimized
              />
            )}
            {hasMultipleImages ? (
              <>
                <button
                  aria-label="Previous media"
                  className="product-detail-gallery-nav product-detail-gallery-nav-prev"
                  onClick={showPreviousImage}
                  type="button"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  aria-label="Next media"
                  className="product-detail-gallery-nav product-detail-gallery-nav-next"
                  onClick={showNextImage}
                  type="button"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </>
            ) : null}
          </>
        ) : (
          <span className="product-detail-gallery-placeholder" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}
