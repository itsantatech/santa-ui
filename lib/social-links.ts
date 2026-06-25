export type SocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

export const socialLinkMeta = [
  { code: "SM-FACEBOOK", label: "Facebook", src: "/assets/facebook.svg" },
  { code: "SM-LINE", label: "Line", src: "/assets/line.svg" },
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

      return match ? { ...icon, href: match.contactUrl.trim() } : null;
    })
    .filter((item): item is (typeof socialLinkMeta)[number] & { href: string } => Boolean(item));
}
