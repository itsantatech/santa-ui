export const locales = ["th", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "th";

export const dictionaries = {
  th: {
    nav: [
      "หน้าแรก",
      "สินค้าและบริการ",
      "หมวดหมู่",
      "แบรนด์",
      "ข่าวสารและบทความ",
      "เกี่ยวกับเรา",
    ],
    searchPlaceholder: "ค้นหาสินค้าและบริการ",
    searchAction: "ค้นหา",
    signIn: "ลงชื่อเข้าใช้",
    signOut: "ลงชื่อออก",
    heroTitle: "สินค้าอุตสาหกรรมและโซลูชันจาก SantaTech",
    heroText:
      "ค้นหา เปรียบเทียบ และจัดการสินค้าอุตสาหกรรมด้วยอินเทอร์เฟซที่เร็วและชัดเจน",
    languageLabel: "เปลี่ยนภาษา",
    newsDropdown: {
      news: "ข่าวสารและกิจกรรม",
      articles: "บทความ",
    },
    metadataTitle: "SantaTech",
    metadataDescription: "สินค้าและบริการอุตสาหกรรมจาก SantaTech",
  },
  en: {
    nav: [
      "Home",
      "Products & Services",
      "Categories",
      "Brands",
      "News & Articles",
      "About Us",
    ],
    searchPlaceholder: "Search products and services",
    searchAction: "Search",
    signIn: "Sign in",
    signOut: "Sign out",
    heroTitle: "Industrial products and solutions from SantaTech",
    heroText:
      "Search, compare, and manage industrial products through a fast, clear interface.",
    languageLabel: "Change language",
    newsDropdown: {
      news: "ข่าวสารและกิจกรรม",
      articles: "บทความ",
    },
    metadataTitle: "SantaTech",
    metadataDescription: "Industrial products and services from SantaTech.",
  },
} satisfies Record<
  Locale,
  {
    nav: string[];
    searchPlaceholder: string;
    searchAction: string;
    signIn: string;
    signOut: string;
    heroTitle: string;
    heroText: string;
    languageLabel: string;
    newsDropdown: {
      news: string;
      articles: string;
    };
    metadataTitle: string;
    metadataDescription: string;
  }
>;

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function getAlternateLocale(locale: Locale): Locale {
  return locale === "th" ? "en" : "th";
}
