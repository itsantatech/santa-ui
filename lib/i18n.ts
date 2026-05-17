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
    adminNavigationLabel: "เมนูผู้ดูแลระบบ",
    adminPageTitle: "สินค้าและบริการ",
    adminNav: {
      "products-services": "สินค้าและบริการ",
      categories: "หมวดหมู่",
      brands: "แบรนด์",
      inventory: "คลังสินค้า",
      orders: "คำสั่งซื้อ",
      quotations: "ใบเสนอราคา",
      "news-activities": "ข่าวสารและกิจกรรม",
      articles: "บทความ",
      settings: "ตั้งค่า",
    },
    adminSections: {
      "products-services": {
        title: "สินค้าและบริการ",
        description: "จัดการรายการสินค้าและบริการสำหรับเว็บไซต์ SantaTech",
      },
      categories: {
        title: "หมวดหมู่",
        description: "จัดกลุ่มสินค้าและบริการเพื่อให้ผู้ใช้ค้นหาได้ง่าย",
      },
      brands: {
        title: "แบรนด์",
        description: "จัดการข้อมูลแบรนด์ที่เชื่อมกับสินค้าและบริการ",
      },
      inventory: {
        title: "คลังสินค้า",
        description: "ติดตามสถานะสินค้าและข้อมูลคงคลัง",
      },
      orders: {
        title: "คำสั่งซื้อ",
        description: "ตรวจสอบและจัดการคำสั่งซื้อจากลูกค้า",
      },
      quotations: {
        title: "ใบเสนอราคา",
        description: "จัดการคำขอและเอกสารใบเสนอราคา",
      },
      "news-activities": {
        title: "ข่าวสารและกิจกรรม",
        description: "ดูแลข่าวสาร กิจกรรม และประกาศของเว็บไซต์",
      },
      articles: {
        title: "บทความ",
        description: "จัดการบทความและเนื้อหาความรู้",
      },
      settings: {
        title: "ตั้งค่า",
        description: "ปรับแต่งการตั้งค่าหลักของระบบผู้ดูแล",
      },
    },
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
    adminNavigationLabel: "Admin navigation",
    adminPageTitle: "Products & Services",
    adminNav: {
      "products-services": "Products & Services",
      categories: "Categories",
      brands: "Brands",
      inventory: "Inventory",
      orders: "Orders",
      quotations: "Quotations",
      "news-activities": "News & Activities",
      articles: "Articles",
      settings: "Settings",
    },
    adminSections: {
      "products-services": {
        title: "Products & Services",
        description: "Manage SantaTech products and services shown on the website.",
      },
      categories: {
        title: "Categories",
        description: "Organize products and services so visitors can browse faster.",
      },
      brands: {
        title: "Brands",
        description: "Manage brand information connected to products and services.",
      },
      inventory: {
        title: "Inventory",
        description: "Track product status and inventory information.",
      },
      orders: {
        title: "Orders",
        description: "Review and manage customer orders.",
      },
      quotations: {
        title: "Quotations",
        description: "Manage quotation requests and documents.",
      },
      "news-activities": {
        title: "News & Activities",
        description: "Maintain website news, activities, and announcements.",
      },
      articles: {
        title: "Articles",
        description: "Manage articles and knowledge content.",
      },
      settings: {
        title: "Settings",
        description: "Configure core admin system settings.",
      },
    },
    newsDropdown: {
      news: "News & Activities",
      articles: "Articles",
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
    adminNavigationLabel: string;
    adminPageTitle: string;
    adminNav: Record<string, string>;
    adminSections: Record<
      string,
      {
        title: string;
        description: string;
      }
    >;
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
