"use client";

import Image from "next/image";
import { useState } from "react";
import type { Locale } from "@/lib/i18n";
import {
  getAvailableSocialLinks,
  type SocialContact,
} from "@/lib/social-links";

function ChatBubbleIcon() {
  return (
    <svg
      aria-hidden="true"
      className="floating-social-chat-toggle-icon"
      viewBox="0 0 24 24"
    >
      <path
        d="M7 9.5h10M7 13h6m-7.5 7 2.4-3.8a2 2 0 0 1 1.69-.92H17a4 4 0 0 0 4-4V8a4 4 0 0 0-4-4H7A4 4 0 0 0 3 8v4.28a4 4 0 0 0 2.5 3.72Z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

export function FloatingSocialChat({
  locale,
  socialContacts,
}: {
  locale: Locale;
  socialContacts: SocialContact[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const availableSocials = getAvailableSocialLinks(socialContacts);

  if (availableSocials.length === 0) {
    return null;
  }

  const ctaLabel = locale === "th" ? "ติดต่อสอบถาม คลิก" : "Contact us";
  const toggleLabel = isOpen
    ? locale === "th"
      ? "ปิดเมนูติดต่อ"
      : "Close contact menu"
    : locale === "th"
      ? "เปิดเมนูติดต่อ"
      : "Open contact menu";

  return (
    <div className="floating-social-chat">
      <div
        className={
          isOpen
            ? "floating-social-chat-links floating-social-chat-links-open"
            : "floating-social-chat-links"
        }
      >
        {availableSocials.map((social) => (
          <a
            aria-label={social.label}
            className="floating-social-chat-link"
            href={social.href}
            key={social.code}
            rel="noreferrer"
            target="_blank"
          >
            <Image
              alt={social.label}
              height={26}
              src={social.src}
              unoptimized
              width={26}
            />
          </a>
        ))}
      </div>

      <div className="floating-social-chat-controls">
        {!isOpen ? <span className="floating-social-chat-label">{ctaLabel}</span> : null}
        <button
          aria-expanded={isOpen}
          aria-label={toggleLabel}
          className="floating-social-chat-toggle"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <ChatBubbleIcon />
        </button>
      </div>
    </div>
  );
}
