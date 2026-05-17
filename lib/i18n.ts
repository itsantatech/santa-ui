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
    adminCategoryTable: {
      columns: {
        code: "รหัส",
        rank: "ลำดับ",
        nameTh: "ชื่อภาษาไทย",
        nameEn: "ชื่อภาษาอังกฤษ",
        slug: "Slug",
        image: "รูปภาพ",
        status: "สถานะ",
        updatedBy: "อัปเดตโดย",
        updatedAt: "อัปเดตล่าสุด",
        actions: "จัดการ",
      },
      selectAll: "เลือกรายการทั้งหมด",
      selectRow: "เลือกรายการ",
      active: "ACTIVE",
      inactive: "INACTIVE",
      edit: "แก้ไข",
      delete: "ลบ",
      previousPage: "หน้าก่อนหน้า",
      nextPage: "หน้าถัดไป",
      iconImage: "ไอคอน",
      coverImage: "ปก",
      noImage: "ไม่มีรูป",
      empty: "ไม่พบข้อมูลหมวดหมู่",
      fetchError: "ไม่สามารถโหลดข้อมูลหมวดหมู่ได้",
    },
    adminProductTable: {
      columns: {
        sku: "SKU",
        rank: "ลำดับ",
        nameTh: "ชื่อภาษาไทย",
        nameEn: "ชื่อภาษาอังกฤษ",
        model: "รุ่น",
        price: "ราคา",
        category: "หมวดหมู่",
        subCategory: "หมวดย่อย",
        brands: "แบรนด์",
        flags: "ประเภท",
        status: "สถานะ",
        updatedBy: "อัปเดตโดย",
        updatedAt: "อัปเดตล่าสุด",
        actions: "จัดการ",
      },
      selectAll: "เลือกรายการทั้งหมด",
      selectRow: "เลือกรายการ",
      active: "ACTIVE",
      inactive: "INACTIVE",
      newProduct: "ใหม่",
      bestSeller: "ขายดี",
      promotion: "โปรโมชัน",
      noFlags: "-",
      noRelations: "-",
      noPrice: "-",
      noModel: "-",
      categories: "หมวดหมู่",
      subCategories: "หมวดย่อย",
      brands: "แบรนด์",
      edit: "แก้ไข",
      delete: "ลบ",
      previousPage: "หน้าก่อนหน้า",
      nextPage: "หน้าถัดไป",
      empty: "ไม่พบข้อมูลสินค้าและบริการ",
      fetchError: "ไม่สามารถโหลดข้อมูลสินค้าและบริการได้",
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
    adminCategoryTable: {
      columns: {
        code: "Code",
        rank: "Rank",
        nameTh: "Thai Name",
        nameEn: "English Name",
        slug: "Slug",
        image: "Images",
        status: "Status",
        updatedBy: "Updated By",
        updatedAt: "Updated At",
        actions: "Actions",
      },
      selectAll: "Select all rows",
      selectRow: "Select row",
      active: "ACTIVE",
      inactive: "INACTIVE",
      edit: "Edit",
      delete: "Delete",
      previousPage: "Previous page",
      nextPage: "Next page",
      iconImage: "Icon",
      coverImage: "Cover",
      noImage: "No image",
      empty: "No categories found",
      fetchError: "Unable to load categories",
    },
    adminProductTable: {
      columns: {
        sku: "SKU",
        rank: "Rank",
        nameTh: "Thai Name",
        nameEn: "English Name",
        model: "Model",
        price: "Price",
        category: "Category",
        subCategory: "Sub-category",
        brands: "Brands",
        flags: "Type",
        status: "Status",
        updatedBy: "Updated By",
        updatedAt: "Updated At",
        actions: "Actions",
      },
      selectAll: "Select all rows",
      selectRow: "Select row",
      active: "ACTIVE",
      inactive: "INACTIVE",
      newProduct: "New",
      bestSeller: "Best seller",
      promotion: "Promotion",
      noFlags: "-",
      noRelations: "-",
      noPrice: "-",
      noModel: "-",
      categories: "Categories",
      subCategories: "Sub Categories",
      brands: "Brands",
      edit: "Edit",
      delete: "Delete",
      previousPage: "Previous page",
      nextPage: "Next page",
      empty: "No products or services found",
      fetchError: "Unable to load products and services",
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
    adminCategoryTable: {
      columns: {
        code: string;
        rank: string;
        nameTh: string;
        nameEn: string;
        slug: string;
        image: string;
        status: string;
        updatedBy: string;
        updatedAt: string;
        actions: string;
      };
      selectAll: string;
      selectRow: string;
      active: string;
      inactive: string;
      edit: string;
      delete: string;
      previousPage: string;
      nextPage: string;
      iconImage: string;
      coverImage: string;
      noImage: string;
      empty: string;
      fetchError: string;
    };
    adminProductTable: {
      columns: {
        sku: string;
        rank: string;
        nameTh: string;
        nameEn: string;
        model: string;
        price: string;
        category: string;
        subCategory: string;
        brands: string;
        flags: string;
        status: string;
        updatedBy: string;
        updatedAt: string;
        actions: string;
      };
      selectAll: string;
      selectRow: string;
      active: string;
      inactive: string;
      newProduct: string;
      bestSeller: string;
      promotion: string;
      noFlags: string;
      noRelations: string;
      noPrice: string;
      noModel: string;
      categories: string;
      subCategories: string;
      brands: string;
      edit: string;
      delete: string;
      previousPage: string;
      nextPage: string;
      empty: string;
      fetchError: string;
    };
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
