import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import {
  fetchDataDeletionSetting,
  fetchPublicChrome,
  stripHtmlToPlainText,
} from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };
type LegalPageChrome = Awaited<ReturnType<typeof fetchPublicChrome>>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  if (locale !== "th" && locale !== "en") return {};

  const setting = await fetchDataDeletionSetting();
  const fallbackTitle = locale === "th" ? "คำแนะนำการลบข้อมูลผู้ใช้" : "User Data Deletion Instructions";
  const title = (locale === "th" ? setting?.headlineTh : setting?.headlineEn)?.trim() || fallbackTitle;
  const content = locale === "th" ? setting?.contentTh : setting?.contentEn;
  const description = stripHtmlToPlainText(content).slice(0, 160) || (locale === "th"
      ? "ขั้นตอนขอลบข้อมูลส่วนบุคคลและข้อมูลบัญชี Facebook Login ของ Santa Technology"
      : "How to request deletion of personal data and Facebook Login data held by Santa Technology.");

  return pageMetadata({
    title,
    description,
    locale,
    path: "/data-deletion",
  });
}

export default async function DataDeletionPage({ params }: PageProps) {
  const { locale } = await params;
  if (locale !== "th" && locale !== "en") notFound();

  const [chrome, setting] = await Promise.all([
    fetchPublicChrome(),
    fetchDataDeletionSetting(),
  ]);

  const content = locale === "th" ? setting?.contentTh : setting?.contentEn;
  const title = locale === "th" ? setting?.headlineTh : setting?.headlineEn;

  if (content?.trim()) {
    return <ManagedDataDeletion chrome={chrome} content={content} locale={locale} title={title?.trim()} />;
  }

  if (locale === "en") return <DataDeletionEnglish chrome={chrome} />;

  const { categories, socialContacts } = chrome;

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="products-page-section">
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <header className="border-b border-neutral-200 pb-6">
            <h1 className="text-3xl font-bold text-neutral-900">คำแนะนำการลบข้อมูลผู้ใช้</h1>
            <p className="mt-3 text-sm text-neutral-600">บริษัท แซนต้า เทคโนโลยี จำกัด (Santa Technology Co., Ltd.) · ปรับปรุงล่าสุด 16 ตุลาคม 2569</p>
          </header>
          <div className="mt-8 space-y-7 leading-8 text-neutral-700">
            <LegalSection title="1. ขอบเขตของคำขอ"><p>ผู้ใช้เว็บไซต์ Santa Technology สามารถขอลบข้อมูลส่วนบุคคลที่บริษัทประมวลผลผ่านเว็บไซต์ รวมถึงข้อมูลบัญชีที่เชื่อมต่อผ่าน Facebook Login ได้ตามสิทธิและเงื่อนไขของกฎหมายที่เกี่ยวข้อง</p></LegalSection>
            <LegalSection title="2. วิธีส่งคำขอลบข้อมูล"><LegalList items={["ส่งอีเมลถึง santatech@gmail.com โดยใช้หัวข้อ “คำขอลบข้อมูลส่วนบุคคล / Facebook Login – Santa Technology”", "ระบุชื่อและอีเมลที่ใช้สมัครหรือเข้าสู่ระบบเว็บไซต์ (ถ้าเข้าสู่ระบบด้วย Facebook ให้แจ้งว่าเป็นบัญชี Facebook Login) รวมทั้งระบุว่าต้องการ “ลบบัญชีเว็บไซต์” หรือ “ลบข้อมูลที่เชื่อมกับ Facebook” หรือทั้งสองอย่าง", "ไม่ต้องส่งรหัสผ่าน Facebook รหัส OTP หรือข้อมูลบัตรชำระเงิน บริษัทจะติดต่อกลับเพื่อขอข้อมูลเพิ่มเติมเฉพาะกรณีที่จำเป็นต่อการยืนยันตัวตน", "หลังยืนยันตัวตน บริษัทจะตรวจสอบข้อมูลที่เกี่ยวข้อง ดำเนินการลบหรือทำให้ไม่สามารถระบุตัวบุคคลได้ตามสิทธิที่กฎหมายกำหนด และแจ้งผลหรือข้อจำกัดในการดำเนินการผ่านช่องทางที่ผู้ใช้ติดต่อมา"]} /></LegalSection>
            <LegalSection title="3. การยกเลิกสิทธิ์ Facebook Login"><p>หากต้องการยกเลิกการเชื่อมต่อกับ Facebook ผู้ใช้สามารถเข้าสู่บัญชี Facebook ของตน ไปที่ การตั้งค่าและความเป็นส่วนตัว → การตั้งค่า → แอปและเว็บไซต์ (Apps and Websites) จากนั้นเลือกแอปของ Santa Technology และลบการเชื่อมต่อ (ชื่อเมนูอาจต่างกันตามเวอร์ชัน Facebook)</p><p>โปรดทราบ: การลบการเชื่อมต่อใน Facebook เป็นการเพิกถอนสิทธิ์ของแอป แต่ไม่ได้รับประกันว่าข้อมูลที่บริษัทเก็บไว้ก่อนหน้านั้นจะถูกลบทั้งหมดโดยอัตโนมัติ หากต้องการลบข้อมูลที่เว็บไซต์เก็บไว้ โปรดส่งคำขอตามข้อ 2 เพิ่มเติม</p></LegalSection>
            <LegalSection title="4. ข้อมูลที่อาจต้องเก็บไว้"><p>ข้อมูลบางประเภท เช่น รายการซื้อขาย เอกสารภาษี บัญชี หรือหลักฐานที่จำเป็นต่อการปฏิบัติตามกฎหมาย การดำเนินข้อเรียกร้อง หรือการป้องกันการทุจริต อาจไม่สามารถลบได้ทันที บริษัทจะเก็บเฉพาะเท่าที่จำเป็น และแจ้งเหตุผลเมื่อมีข้อจำกัดตามกฎหมาย</p></LegalSection>
            <LegalSection title="5. ระยะเวลาดำเนินการและการติดต่อกลับ"><p>บริษัทจะพิจารณาและดำเนินการตามคำขอโดยไม่ล่าช้าเกินสมควรและภายในกรอบเวลาที่กฎหมายใช้บังคับกำหนด โดยอาจติดต่อกลับเพื่อยืนยันตัวตนหรือแจ้งความคืบหน้าหากจำเป็น</p></LegalSection>
            <LegalSection title="6. ติดต่อเกี่ยวกับข้อมูลส่วนบุคคล"><p>บริษัท แซนต้า เทคโนโลยี จำกัด (Santa Technology Co., Ltd.)</p><p>ที่อยู่: 35/218 หมู่ 2 ตำบลคลองสาม อำเภอคลองหลวง จังหวัดปทุมธานี 12120 ประเทศไทย</p><p>อีเมลรับคำขอ: <a className="text-orange-700 underline" href="mailto:santatech@gmail.com">santatech@gmail.com</a></p><p>อ่านรายละเอียดอื่น ๆ ได้ที่หน้า <Link className="text-orange-700 underline" href="/th/privacy-policy">นโยบายความเป็นส่วนตัว</Link></p></LegalSection>
          </div>
          <p className="mt-8 rounded-lg bg-orange-50 px-5 py-4 text-neutral-700">เอกสารที่เกี่ยวข้อง: <Link className="text-orange-700 underline" href="/th/privacy-policy">นโยบายความเป็นส่วนตัว</Link></p>
        </article>
      </section>
      <SiteFooter categories={categories} locale={locale} socialContacts={socialContacts} />
    </main>
  );
}

function LegalSection({ children, title }: { children: React.ReactNode; title: string }) {
  return <section><h2 className="mb-3 border-b border-neutral-200 pb-2 text-xl font-semibold text-orange-700">{title}</h2><div className="space-y-3">{children}</div></section>;
}

function LegalList({ items }: { items: string[] }) {
  return <ul className="list-disc space-y-2 pl-6 marker:text-orange-600">{items.map((item) => <li key={item}>{item}</li>)}</ul>;
}

function ManagedDataDeletion({
  chrome,
  content,
  locale,
  title,
}: {
  chrome: LegalPageChrome;
  content: string;
  locale: "th" | "en";
  title?: string;
}) {
  const fallbackTitle = locale === "th" ? "คำแนะนำการลบข้อมูลผู้ใช้" : "User Data Deletion Instructions";

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="products-page-section">
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <header className="border-b border-neutral-200 pb-6"><h1 className="text-3xl font-bold text-neutral-900">{title || fallbackTitle}</h1></header>
          <div className="public-richtext mt-8 leading-8 text-neutral-700" dangerouslySetInnerHTML={{ __html: content }} />
        </article>
      </section>
      <SiteFooter categories={chrome.categories} locale={locale} socialContacts={chrome.socialContacts} />
    </main>
  );
}

function DataDeletionEnglish({ chrome }: { chrome: LegalPageChrome }) {
  return (
    <main className="site-shell">
      <SiteNavbar locale="en" />
      <section className="products-page-section">
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <header className="border-b border-neutral-200 pb-6"><h1 className="text-3xl font-bold text-neutral-900">User Data Deletion Instructions</h1><p className="mt-3 text-sm text-neutral-600">Santa Technology Co., Ltd. · Last updated 16 October 2026</p></header>
          <div className="mt-8 space-y-7 leading-8 text-neutral-700">
            <LegalSection title="1. Scope of Requests"><p>Users of the Santa Technology website may request deletion of personal data processed through the website, including account data connected through Facebook Login, subject to applicable legal rights and conditions.</p></LegalSection>
            <LegalSection title="2. How to Request Data Deletion"><LegalList items={["Email santatech@gmail.com with the subject “Personal Data / Facebook Login Deletion Request – Santa Technology”.", "State your name and the email used to register or log in. If you used Facebook Login, say so. Also state whether you request deletion of your website account, Facebook-connected data, or both.", "Do not send your Facebook password, OTP, or payment-card information. We will request additional information only when needed to verify identity.", "After identity verification, we will review the relevant data, delete or anonymise it as permitted by law, and notify you of the result or any limitation through your contact channel."]} /></LegalSection>
            <LegalSection title="3. Removing Facebook Login Access"><p>To remove the Facebook connection, go to your Facebook account’s Settings & privacy → Settings → Apps and Websites, then select Santa Technology and remove the connection. Menu names may vary by Facebook version.</p><p>Removing the Facebook connection revokes the app’s access; it does not automatically guarantee deletion of data previously retained by the Company. To delete data held by the website, also submit a request under section 2.</p></LegalSection>
            <LegalSection title="4. Data That May Need to Be Retained"><p>Some information, such as transaction records, tax or accounting documents, evidence needed for legal claims, or fraud prevention, may not be deleted immediately. We retain only what is necessary and explain any legal restriction.</p></LegalSection>
            <LegalSection title="5. Processing Time and Response"><p>We will consider and process requests without undue delay and within the timeframe required by applicable law. We may contact you to verify identity or provide an update where necessary.</p></LegalSection>
            <LegalSection title="6. Personal Data Contact"><p>Santa Technology Co., Ltd.</p><p>Address: 35/218 Moo 2, Khlong Sam, Khlong Luang, Pathum Thani 12120, Thailand.</p><p>Request email: <a className="text-orange-700 underline" href="mailto:santatech@gmail.com">santatech@gmail.com</a></p><p>Read more in our <Link className="text-orange-700 underline" href="/en/privacy-policy">Privacy Policy</Link>.</p></LegalSection>
          </div>
          <p className="mt-8 rounded-lg bg-orange-50 px-5 py-4 text-neutral-700">Related document: <Link className="text-orange-700 underline" href="/en/privacy-policy">Privacy Policy</Link></p>
        </article>
      </section>
      <SiteFooter categories={chrome.categories} locale="en" socialContacts={chrome.socialContacts} />
    </main>
  );
}
