export type SocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

export const socialLinkMeta = [
  { code: "SM-FACEBOOK", label: "Facebook", src: "/assets/facebook.svg" },
  { code: "SM-PHONE", label: "Phone", src: "/assets/phone.svg" },
  { code: "SM-LINE", label: "Line", src: "/assets/line.svg" },
  { code: "SM-EMAIL", label: "Email", src: "/assets/email.svg" },
  { code: "SM-YOUTUBE", label: "YouTube", src: "/assets/youtube.svg" },
  { code: "SM-INSTAGRAM", label: "Instagram", src: "/assets/ig.svg" },
  { code: "SM-TIKTOK", label: "TikTok", src: "/assets/tiktok.svg" },
] as const;

export function getAvailableSocialLinks(contacts: SocialContact[]) {
  return socialLinkMeta
    .map((icon) => {
      const match = contacts.find(
        (contact) =>
          contact.isActive &&
          contact.code === icon.code &&
          contact.contactUrl.trim().length > 0,
      );

      return match ? { ...icon, href: normalizeSocialHref(icon.code, match.contactUrl.trim()) } : null;
    })
    .filter((item): item is (typeof socialLinkMeta)[number] & { href: string } => Boolean(item));
}

function normalizeSocialHref(code: (typeof socialLinkMeta)[number]["code"], value: string) {
  if (code === "SM-EMAIL") {
    return value.startsWith("mailto:") ? value : `mailto:${value}`;
  }

  if (code === "SM-PHONE") {
    const sanitized = value.replace(/[^\d+]/g, "");
    return value.startsWith("tel:") ? value : `tel:${sanitized}`;
  }

  return value;
}
