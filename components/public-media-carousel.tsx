"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";

export function PublicMediaCarousel({
  alt,
  locale,
  media,
  variant = "detail",
}: {
  alt: string;
  locale: Locale;
  media: string[];
  variant?: "about" | "detail";
}) {
  const normalizedMedia = media.filter((item) => item.trim().length > 0);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeMedia = normalizedMedia[activeIndex] ?? null;
  const hasMultipleMedia = normalizedMedia.length > 1;

  function showPreviousMedia() {
    setActiveIndex((current) =>
      normalizedMedia.length === 0
        ? 0
        : (current - 1 + normalizedMedia.length) % normalizedMedia.length,
    );
  }

  function showNextMedia() {
    setActiveIndex((current) =>
      normalizedMedia.length === 0 ? 0 : (current + 1) % normalizedMedia.length,
    );
  }

  return (
    <div
      className={
        variant === "about" ? "public-media-carousel public-media-carousel-about" : "public-media-carousel"
      }
    >
      {hasMultipleMedia ? (
        <div
          aria-label={locale === "th" ? "รายการสื่อ" : "Media items"}
          className="public-media-carousel-thumbs"
        >
          {normalizedMedia.map((item, index) => (
            <button
              aria-label={
                locale === "th"
                  ? `เลือกสื่อรายการที่ ${index + 1}`
                  : `Select media item ${index + 1}`
              }
              className={
                index === activeIndex
                  ? "public-media-carousel-thumb public-media-carousel-thumb-active"
                  : "public-media-carousel-thumb"
              }
              key={`${item}-${index}`}
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              {isVideoUrl(item) ? (
                <>
                  <video
                    aria-hidden="true"
                    className="public-media-carousel-thumb-video"
                    muted
                    playsInline
                    src={item}
                  />
                  <span className="public-media-carousel-thumb-badge">Video</span>
                </>
              ) : (
                <Image
                  alt=""
                  className="public-media-carousel-thumb-image"
                  fill
                  sizes="96px"
                  src={item}
                  unoptimized
                />
              )}
            </button>
          ))}
        </div>
      ) : null}

      <div
        className={
          variant === "about"
            ? "public-media-carousel-main public-media-carousel-main-about"
            : "public-media-carousel-main"
        }
      >
        {activeMedia ? (
          <>
            {isVideoUrl(activeMedia) ? (
              <video
                className="public-media-carousel-main-video"
                controls
                playsInline
                src={activeMedia}
              />
            ) : (
              <Image
                alt={alt}
                className="public-media-carousel-main-image"
                fill
                sizes="100vw"
                src={activeMedia}
                unoptimized
              />
            )}
            {hasMultipleMedia ? (
              <>
                <button
                  aria-label={locale === "th" ? "สื่อก่อนหน้า" : "Previous media"}
                  className="public-media-carousel-nav public-media-carousel-nav-prev"
                  onClick={showPreviousMedia}
                  type="button"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  aria-label={locale === "th" ? "สื่อถัดไป" : "Next media"}
                  className="public-media-carousel-nav public-media-carousel-nav-next"
                  onClick={showNextMedia}
                  type="button"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </>
            ) : null}
          </>
        ) : (
          <span className="public-media-carousel-placeholder" aria-hidden="true" />
        )}
      </div>
    </div>
  );
}

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}
