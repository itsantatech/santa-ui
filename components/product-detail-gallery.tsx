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

  return (
    <div className="product-detail-gallery">
      <div className="product-detail-gallery-thumbs" aria-label="Product images">
        {(normalizedImages.length > 0 ? normalizedImages : [null]).map((image, index) => (
          <button
            aria-label={`Preview image ${index + 1}`}
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
              <Image
                alt=""
                className="product-detail-thumb-image"
                fill
                sizes="96px"
                src={image}
                unoptimized
              />
            ) : null}
          </button>
        ))}
      </div>

      <div className="product-detail-gallery-main">
        {activeImage ? (
          <Image
            alt={alt}
            className="product-detail-gallery-image"
            fill
            sizes="640px"
            src={activeImage}
            unoptimized
          />
        ) : (
          <span className="product-detail-gallery-placeholder" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}
