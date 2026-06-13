import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";

type FooterCategory = {
  code: string;
  nameEn: string;
  nameTh: string;
};

type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

const socialIcons = [
  { code: "SM-FACEBOOK", label: "Facebook", src: "/assets/facebook.svg" },
  { code: "SM-LINE", label: "Line", src: "/assets/line.svg" },
  { code: "SM-YOUTUBE", label: "YouTube", src: "/assets/youtube.svg" },
  { code: "SM-INSTAGRAM", label: "Instagram", src: "/assets/ig.svg" },
  { code: "SM-TIKTOK", label: "TikTok", src: "/assets/tiktok.svg" },
] as const;

function getLocalizedCategoryName(locale: Locale, category: FooterCategory) {
  return locale === "th" ? category.nameTh : category.nameEn;
}

function getFooterContent(locale: Locale) {
  return locale === "th"
    ? {
        aboutBody:
          "ผู้นำเข้าและตัวแทนจำหน่ายเครื่องมือวัด เครื่องจักร และสินค้าโรงงานอุตสาหกรรมครบวงจรจากแบรนด์ชั้นนำระดับโลก อาทิ Musashi, Atlas Copco, Robot Epson, SMC พร้อมส่งมอบนวัตกรรมเฉพาะทาง อาทิ ออกแบบห้องคลีนรูม ติดตั้งระบบหัวล่อฟ้า เครื่องมือวัดและเครื่องมือวิทยาศาสตร์ ระบบวิศวกรรมบอยเลอร์ (Boiler) หรือหม้อไอน้ำมาตรฐานสากล สินค้าและอุปกรณ์ ESD ป้องกันไฟฟ้าสถิตย์ โดยทีมงานผู้เชี่ยวชาญที่มุ่งมั่นยกระดับมาตรฐานการผลิตและบริการหลังการขายระดับมืออาชีพ",
        aboutTitle: "เกี่ยวกับเรา",
        address: [
          "บริษัท แซนต้า เทคโนโลยี จำกัด",
          "2/15 หมู่ 4 ซอยกำนันประเสริฐ (ตะวันตก)",
          "ตำบล คลองสี่ อำเภอคลองหลวง ปทุมธานี",
          "12120",
        ],
        categoriesTitle: "หมวดหมู่",
        contactTitle: "ติดต่อเรา",
        copyright: "Santa Technology Co., Ltd. All rights reserved.",
        menu: {
          about: "เกี่ยวกับเรา",
          brands: "แบรนด์",
          faq: "คำถามที่พบบ่อย",
          home: "หน้าแรก",
          news: "ข่าวสารและบทความ",
          products: "สินค้าและบริการ",
        },
        menuTitle: "เมนู",
      }
    : {
        aboutBody:
          "Importer and distributor of measuring instruments, machinery, and industrial products from leading global brands such as Musashi, Atlas Copco, Robot Epson, and SMC. We also deliver specialized solutions including cleanroom design, lightning protection systems, scientific instruments, boiler engineering systems, and ESD protection equipment, backed by experienced specialists and professional after-sales service.",
        aboutTitle: "About Us",
        address: [
          "Santa Technology Co., Ltd.",
          "2/15 Moo 4, Soi Kamnan Prasert (West)",
          "Khlong Si, Khlong Luang, Pathum Thani",
          "12120",
        ],
        categoriesTitle: "Categories",
        contactTitle: "Contact Us",
        copyright: "Santa Technology Co., Ltd. All rights reserved.",
        menu: {
          about: "About Us",
          brands: "Brands",
          faq: "Frequently Asked Questions",
          home: "Home",
          news: "News & Articles",
          products: "Products & Services",
        },
        menuTitle: "Menu",
      };
}

export function SiteFooter({
  categories,
  locale,
  socialContacts,
}: {
  categories: FooterCategory[];
  locale: Locale;
  socialContacts: FooterSocialContact[];
}) {
  const content = getFooterContent(locale);
  const sortedCategories = [...categories]
    .sort((left, right) => left.nameTh.localeCompare(right.nameTh))
    .slice(0, 8);
  const availableSocials = socialIcons
    .map((icon) => {
      const match = socialContacts.find(
        (contact) =>
          contact.isActive &&
          contact.code === icon.code &&
          contact.contactUrl.trim().length > 0,
      );

      return match ? { ...icon, href: match.contactUrl.trim() } : null;
    })
    .filter((item): item is (typeof socialIcons)[number] & { href: string } => Boolean(item));

  return (
    <footer className="site-footer">
      <div className="site-footer-grid">
        <section className="site-footer-column">
          <h2>{content.aboutTitle}</h2>
          <p>{content.aboutBody}</p>
        </section>

        <section className="site-footer-column">
          <h2>{content.categoriesTitle}</h2>
          <ul className="site-footer-list">
            {sortedCategories.map((category) => (
              <li key={category.code}>
                <Link href={`/${locale}/products-services?categoryCode=${encodeURIComponent(category.code)}`}>
                  {getLocalizedCategoryName(locale, category)}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="site-footer-column" aria-label="Footer menu">
          <h2>{content.menuTitle}</h2>
          <ul className="site-footer-list">
            <li><Link href={`/${locale}`}>{content.menu.home}</Link></li>
            <li><Link href={`/${locale}/products-services`}>{content.menu.products}</Link></li>
            <li><Link href={`/${locale}#home-brand-section`}>{content.menu.brands}</Link></li>
            <li><Link href={`/${locale}/news`}>{content.menu.news}</Link></li>
            <li><Link href={`/${locale}#home-about-santa`}>{content.menu.about}</Link></li>
            <li><Link href={`/${locale}#home-faq-section`}>{content.menu.faq}</Link></li>
          </ul>
        </nav>

        <section className="site-footer-column site-footer-contact">
          <h2>{content.contactTitle}</h2>
          <div className="site-footer-contact-copy">
            <a href="mailto:santatech@gmail.com">santatech@gmail.com</a>
            <span>02-101-3453-54</span>
            <span>089-006-2766</span>
            <span>Line: @santatech</span>
          </div>
          <div className="site-footer-contact-copy">
            {content.address.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </div>
          {availableSocials.length > 0 ? (
            <div className="site-footer-socials" aria-label="Social links">
              {availableSocials.map((social) => (
                <a
                  aria-label={social.label}
                  href={social.href}
                  key={social.code}
                  rel="noreferrer"
                  target="_blank"
                >
                  <Image alt={social.label} height={40} src={social.src} unoptimized width={40} />
                </a>
              ))}
            </div>
          ) : null}
        </section>
      </div>

      <p className="site-footer-copyright">
        &copy; {new Date().getFullYear()} {content.copyright}
      </p>
    </footer>
  );
}
