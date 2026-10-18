import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/site-footer";
import { SiteNavbar } from "@/components/site-navbar";
import {
  fetchPrivacyPolicySetting,
  fetchPublicChrome,
  stripHtmlToPlainText,
} from "@/lib/public-content";
import { pageMetadata } from "@/lib/seo";

type PageProps = { params: Promise<{ locale: string }> };
type LegalPageChrome = Awaited<ReturnType<typeof fetchPublicChrome>>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;

  if (locale !== "th" && locale !== "en") return {};

  const policy = await fetchPrivacyPolicySetting();
  const fallbackTitle = locale === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy";
  const title = (locale === "th" ? policy?.headlineTh : policy?.headlineEn)?.trim() || fallbackTitle;
  const content = locale === "th" ? policy?.contentTh : policy?.contentEn;
  const description = stripHtmlToPlainText(content).slice(0, 160) || (locale === "th"
      ? "นโยบายความเป็นส่วนตัวของบริษัท แซนต้า เทคโนโลยี จำกัด"
      : "Privacy policy of Santa Technology Co., Ltd.");

  return pageMetadata({
    title,
    description,
    locale,
    path: "/privacy-policy",
  });
}

export default async function PrivacyPolicyPage({ params }: PageProps) {
  const { locale } = await params;

  if (locale !== "th" && locale !== "en") notFound();

  const [chrome, policy] = await Promise.all([
    fetchPublicChrome(),
    fetchPrivacyPolicySetting(),
  ]);

  const content = locale === "th" ? policy?.contentTh : policy?.contentEn;
  const title = locale === "th" ? policy?.headlineTh : policy?.headlineEn;

  if (content?.trim()) {
    return <ManagedPrivacyPolicy chrome={chrome} content={content} locale={locale} title={title?.trim()} />;
  }

  if (locale === "en") return <PrivacyPolicyEnglish chrome={chrome} />;

  const { categories, socialContacts } = chrome;

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="products-page-section">
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <header className="border-b border-neutral-200 pb-6">
            <h1 className="text-3xl font-bold text-neutral-900">นโยบายความเป็นส่วนตัว</h1>
            <p className="mt-3 text-sm text-neutral-600">
              บริษัท แซนต้า เทคโนโลยี จำกัด (Santa Technology Co., Ltd.) · ปรับปรุงล่าสุด 16 ตุลาคม 2569
            </p>
          </header>
          <div className="mt-8 space-y-7 leading-8 text-neutral-700">
            <LegalSection title="1. ผู้ควบคุมข้อมูลส่วนบุคคล">
              <p>บริษัท แซนต้า เทคโนโลยี จำกัด (Santa Technology Co., Ltd.) (“บริษัท”) เป็นผู้ควบคุมข้อมูลส่วนบุคคลสำหรับเว็บไซต์ santatechnology.com การให้บริการ การติดต่อสอบถาม การซื้อสินค้า และการลงชื่อเข้าใช้เว็บไซต์ด้วย Facebook ตามที่อธิบายในประกาศนี้</p>
              <p>ที่อยู่ตามข้อมูลที่บริษัทให้ยืนยัน: 35/218 หมู่ 2 ตำบลคลองสาม อำเภอคลองหลวง จังหวัดปทุมธานี 12120 ประเทศไทย</p>
              <p>ช่องทางติดต่อเกี่ยวกับข้อมูลส่วนบุคคล: <a className="text-orange-700 underline" href="mailto:santatech@gmail.com">santatech@gmail.com</a></p>
            </LegalSection>
            <LegalSection title="2. ข้อมูลส่วนบุคคลที่อาจเก็บรวบรวม">
              <LegalList items={["ข้อมูลบัญชีและติดต่อ: ชื่อ อีเมล เบอร์โทรศัพท์ และข้อมูลที่ผู้ใช้กรอกผ่านการสมัครสมาชิกหรือแบบฟอร์ม", "ข้อมูลที่จำเป็นต่อคำสั่งซื้อ: ชื่อผู้สั่งซื้อ ที่อยู่จัดส่ง ที่อยู่ออกใบกำกับภาษี รายละเอียดคำสั่งซื้อ การติดต่อ และหลักฐานธุรกรรมที่จำเป็น (บริษัทไม่ควรจัดเก็บข้อมูลบัตรชำระเงินเต็มรูปแบบด้วยตนเอง หากใช้ผู้ให้บริการชำระเงิน)", "ข้อมูล Facebook Login: ข้อมูลที่ Facebook ส่งให้ตามสิทธิ์ที่ผู้ใช้อนุญาต เช่น ตัวระบุบัญชี ชื่อ รูปโปรไฟล์ และอีเมล (หากมีและได้รับอนุญาต) เพื่อเชื่อมบัญชีและยืนยันตัวตน", "ข้อมูลทางเทคนิคและการใช้งาน: หมายเลข IP ชนิดอุปกรณ์/เบราว์เซอร์ บันทึกการเข้าถึง คุกกี้ และข้อมูลกิจกรรมบนเว็บไซต์ที่ได้จากระบบวิเคราะห์ตามการตั้งค่าจริง", "ข้อมูลที่ผู้ใช้ส่งโดยสมัครใจ: ข้อความสอบถาม คำขอใบเสนอราคา ข้อร้องเรียน และข้อมูลที่จำเป็นต่อการให้บริการ"]} />
            </LegalSection>
            <LegalSection title="3. วัตถุประสงค์และฐานการประมวลผล">
              <LegalList items={["สมัครสมาชิก ยืนยันตัวตน และให้บริการเข้าสู่ระบบ รวมถึง Facebook Login — เพื่อให้บริการตามคำขอหรือข้อตกลงกับผู้ใช้", "จัดการคำสั่งซื้อ จัดส่งสินค้า ออกเอกสารทางบัญชี รับชำระเงิน และบริการหลังการขาย — เพื่อปฏิบัติตามสัญญาและหน้าที่ตามกฎหมาย", "ตอบคำถาม เสนอราคา จัดการเรื่องร้องเรียน และความปลอดภัยของระบบ — เพื่อให้บริการหรือประโยชน์โดยชอบด้วยกฎหมาย โดยคำนึงถึงสิทธิของผู้ใช้", "วิเคราะห์และปรับปรุงเว็บไซต์ เช่น วัดจำนวนผู้เข้าชมและการใช้งานผ่าน Google Analytics — ตามฐานกฎหมายที่เหมาะสม และขอความยินยอมสำหรับคุกกี้ที่ต้องขอความยินยอม", "ส่งข่าวสารและข้อเสนอทางการตลาด — เมื่อมีฐานกฎหมายที่ใช้ได้ รวมถึงความยินยอมในกรณีที่กฎหมายกำหนด และเปิดทางให้ยกเลิกการรับได้"]} />
            </LegalSection>
            <LegalSection title="4. การเข้าสู่ระบบด้วย Facebook"><p>หากผู้ใช้เลือก “เข้าสู่ระบบด้วย Facebook” เว็บไซต์อาจรับข้อมูลโปรไฟล์พื้นฐานและอีเมลผ่าน Meta ตามสิทธิ์ที่อนุญาต เพื่อนำมาใช้สร้างหรือเชื่อมบัญชีและเข้าสู่ระบบเท่านั้นตามการทำงานจริงของระบบ บริษัทจะไม่ขอรหัสผ่าน Facebook ของผู้ใช้ และการยกเลิกการเชื่อมต่อ Facebook ไม่ได้หมายความว่ารายการสั่งซื้อหรือข้อมูลที่กฎหมายกำหนดให้เก็บจะถูกลบโดยอัตโนมัติ</p></LegalSection>
            <LegalSection title="5. การเปิดเผยข้อมูลและผู้ให้บริการ"><p>บริษัทอาจส่งต่อข้อมูลเท่าที่จำเป็นแก่ผู้ให้บริการที่เกี่ยวข้อง เช่น ผู้ให้บริการโฮสติ้ง/ระบบคลาวด์ ผู้ให้บริการพิสูจน์ตัวตน (รวมถึง Meta) ผู้ให้บริการชำระเงิน ผู้ให้บริการขนส่ง ผู้ดูแลเว็บไซต์ และผู้ให้บริการวิเคราะห์การใช้งาน (เช่น Google Analytics) รวมถึงหน่วยงานรัฐตามที่กฎหมายกำหนด</p></LegalSection>
            <LegalSection title="6. การโอนข้อมูลไปต่างประเทศ"><p>ผู้ให้บริการระบบบางรายอาจมีการประมวลผลหรือจัดเก็บข้อมูลในต่างประเทศ บริษัทจะดำเนินการตามหลักเกณฑ์การคุ้มครองข้อมูลส่วนบุคคลที่กฎหมายใช้บังคับกำหนด และใช้มาตรการคุ้มครองที่เหมาะสมตามลักษณะการประมวลผล</p></LegalSection>
            <LegalSection title="7. คุกกี้และข้อมูลวิเคราะห์เว็บไซต์"><p>เว็บไซต์อาจใช้คุกกี้ที่จำเป็นต่อการเข้าสู่ระบบ ตะกร้าสินค้า และการทำงานของเว็บไซต์ รวมถึงคุกกี้วิเคราะห์การใช้งาน เช่น Google Analytics ตามการติดตั้งจริง ผู้ใช้สามารถจัดการคุกกี้ผ่านการตั้งค่าเบราว์เซอร์หรือระบบจัดการความยินยอมของเว็บไซต์ (หากมี) ทั้งนี้การปิดคุกกี้บางรายการอาจทำให้บริการบางส่วนใช้งานไม่ได้</p></LegalSection>
            <LegalSection title="8. ระยะเวลาการเก็บข้อมูล"><p>บริษัทเก็บข้อมูลเท่าที่จำเป็นต่อวัตถุประสงค์ที่แจ้งไว้ และตามระยะเวลาที่กฎหมายกำหนด เช่น เอกสารทางบัญชี ภาษี หรือข้อมูลที่จำเป็นสำหรับข้อพิพาท เมื่อหมดความจำเป็น บริษัทจะลบ ทำลาย หรือทำให้ข้อมูลไม่สามารถระบุตัวบุคคลได้ตามความเหมาะสม</p></LegalSection>
            <LegalSection title="9. มาตรการรักษาความมั่นคงปลอดภัย"><p>บริษัทใช้มาตรการด้านองค์กรและเทคนิคตามความเหมาะสม เพื่อจำกัดการเข้าถึงข้อมูล ป้องกันการเข้าถึงโดยไม่มีสิทธิ์ และจัดการเหตุการณ์ด้านความปลอดภัย</p></LegalSection>
            <LegalSection title="10. สิทธิของเจ้าของข้อมูลส่วนบุคคล"><p>ผู้ใช้อาจมีสิทธิตามกฎหมายที่ใช้บังคับ เช่น ขอเข้าถึงหรือรับสำเนาข้อมูล ขอแก้ไข ขอให้ลบหรือทำลาย ขอระงับการใช้ ขอคัดค้าน ขอถอนความยินยอม และขอรับหรือโอนข้อมูลในกรณีที่กฎหมายกำหนด โดยสิทธิบางประการอาจมีข้อยกเว้นตามกฎหมาย</p><p>สามารถส่งคำขอโดยอีเมลไปที่ <a className="text-orange-700 underline" href="mailto:santatech@gmail.com">santatech@gmail.com</a> พร้อมระบุชื่อ อีเมลที่ผูกกับบัญชี และรายละเอียดคำขอ บริษัทอาจขอข้อมูลเพิ่มเติมเท่าที่จำเป็นเพื่อยืนยันตัวตน โดยไม่ขอรหัสผ่าน Facebook หรือรหัสผ่านเว็บไซต์</p></LegalSection>
            <LegalSection title="11. การขอลบข้อมูลและบัญชีที่เชื่อมต่อกับ Facebook"><p>ดูขั้นตอนเฉพาะที่หน้า <Link className="text-orange-700 underline" href="/th/data-deletion">คำแนะนำการลบข้อมูลผู้ใช้</Link> ผู้ใช้สามารถขอให้ลบข้อมูลที่ได้จาก Facebook Login และบัญชีเว็บไซต์ตามขอบเขตที่กฎหมายอนุญาต โดยบริษัทจะแจ้งผลการดำเนินการหรือเหตุที่จำเป็นต้องเก็บข้อมูลบางส่วนต่อไป</p></LegalSection>
            <LegalSection title="12. การปรับปรุงประกาศ"><p>บริษัทอาจปรับปรุงประกาศนี้เมื่อระบบบริการหรือข้อกฎหมายเปลี่ยนแปลง โดยเผยแพร่ฉบับล่าสุดบนเว็บไซต์และระบุวันที่มีผลใช้บังคับ หากมีการเปลี่ยนแปลงสำคัญ บริษัทจะแจ้งให้ทราบตามวิธีที่เหมาะสม</p></LegalSection>
          </div>
          <p className="mt-8 rounded-lg bg-orange-50 px-5 py-4 text-neutral-700">เอกสารที่เกี่ยวข้อง: <Link className="text-orange-700 underline" href="/th/data-deletion">คำแนะนำการลบข้อมูลผู้ใช้</Link></p>
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

function ManagedPrivacyPolicy({
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
  const fallbackTitle = locale === "th" ? "นโยบายความเป็นส่วนตัว" : "Privacy Policy";

  return (
    <main className="site-shell">
      <SiteNavbar locale={locale} />
      <section className="products-page-section">
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <header className="border-b border-neutral-200 pb-6"><h1 className="text-3xl font-bold text-neutral-900">{title || fallbackTitle}</h1></header>
          <div className="public-richtext mt-8 leading-8 text-neutral-700" dangerouslySetInnerHTML={{ __html: content }} />
          <p className="mt-8 rounded-lg bg-orange-50 px-5 py-4 text-neutral-700">
            {locale === "th" ? "เอกสารที่เกี่ยวข้อง: " : "Related document: "}
            <Link className="text-orange-700 underline" href={`/${locale}/data-deletion`}>
              {locale === "th" ? "คำแนะนำการลบข้อมูลผู้ใช้" : "User Data Deletion Instructions"}
            </Link>
          </p>
        </article>
      </section>
      <SiteFooter categories={chrome.categories} locale={locale} socialContacts={chrome.socialContacts} />
    </main>
  );
}

function PrivacyPolicyEnglish({ chrome }: { chrome: LegalPageChrome }) {
  return (
    <main className="site-shell">
      <SiteNavbar locale="en" />
      <section className="products-page-section">
        <article className="mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white px-5 py-8 shadow-sm sm:px-10 sm:py-12">
          <header className="border-b border-neutral-200 pb-6"><h1 className="text-3xl font-bold text-neutral-900">Privacy Policy</h1><p className="mt-3 text-sm text-neutral-600">Santa Technology Co., Ltd. · Last updated 16 October 2026</p></header>
          <div className="mt-8 space-y-7 leading-8 text-neutral-700">
            <LegalSection title="1. Data Controller"><p>Santa Technology Co., Ltd. (“the Company”) is the data controller for santatechnology.com, our services, enquiries, purchases, and Facebook Login, as described in this notice.</p><p>Address: 35/218 Moo 2, Khlong Sam, Khlong Luang, Pathum Thani 12120, Thailand.</p><p>For personal-data enquiries: <a className="text-orange-700 underline" href="mailto:santatech@gmail.com">santatech@gmail.com</a></p></LegalSection>
            <LegalSection title="2. Personal Data We May Collect"><LegalList items={["Account and contact information, including name, email address, telephone number, and information submitted through registration or forms.", "Order information, including purchaser name, delivery and tax-invoice addresses, order details, contact information, and necessary transaction records. The Company should not independently store complete payment-card information when a payment provider is used.", "Facebook Login information that Meta provides according to permissions you grant, such as account identifier, name, profile picture, and email address when available and permitted.", "Technical and usage information, such as IP address, device or browser type, access logs, cookies, and website activity collected through analytics according to the actual configuration.", "Information you provide voluntarily, such as enquiries, quotation requests, complaints, and information necessary to provide services."]} /></LegalSection>
            <LegalSection title="3. Purposes and Legal Bases"><LegalList items={["To register users, verify identity, and provide login services, including Facebook Login, in order to provide the service requested or agreed with you.", "To manage orders, deliver goods, issue accounting documents, receive payment, and provide after-sales service, to perform contracts and meet legal obligations.", "To answer enquiries, provide quotations, manage complaints, and maintain system security, to provide services or pursue legitimate interests while considering your rights.", "To analyse and improve the website, for example by measuring visitors and usage through Google Analytics, under an appropriate legal basis and with consent for cookies that require it.", "To send news and marketing offers when a valid legal basis applies, including consent where required by law, with an option to unsubscribe."]} /></LegalSection>
            <LegalSection title="4. Facebook Login"><p>If you choose to log in with Facebook, the website may receive basic profile information and email from Meta according to your authorised permissions. This is used only to create or link your account and enable login. The Company does not request your Facebook password. Disconnecting Facebook does not automatically delete order records or data that must be retained by law.</p></LegalSection>
            <LegalSection title="5. Disclosure and Service Providers"><p>We may disclose data only as necessary to relevant providers, such as hosting or cloud providers, identity providers including Meta, payment and shipping providers, website administrators, and analytics providers such as Google Analytics, as well as government authorities where required by law.</p></LegalSection>
            <LegalSection title="6. International Transfers"><p>Some service providers may process or store data outside Thailand. The Company will follow applicable personal-data protection requirements and use safeguards appropriate to the processing.</p></LegalSection>
            <LegalSection title="7. Cookies and Website Analytics"><p>The website may use cookies necessary for login, shopping-cart, and website functions, as well as analytics cookies such as Google Analytics where installed. You can manage cookies through your browser settings or the website’s consent-management system, if available. Disabling some cookies may affect parts of the service.</p></LegalSection>
            <LegalSection title="8. Retention Period"><p>We retain personal data only for as long as necessary for the stated purposes and periods required by law, such as accounting, tax, or dispute-related records. When it is no longer needed, we delete, destroy, or anonymise it as appropriate.</p></LegalSection>
            <LegalSection title="9. Security Measures"><p>The Company uses appropriate organisational and technical measures to limit access, prevent unauthorised access, and manage security incidents.</p></LegalSection>
            <LegalSection title="10. Your Rights"><p>Subject to applicable law, you may have rights to access or obtain a copy of your data, correct it, request erasure or destruction, restrict processing, object, withdraw consent, and receive or transfer data. Some rights may be subject to legal exceptions.</p><p>Send your request to <a className="text-orange-700 underline" href="mailto:santatech@gmail.com">santatech@gmail.com</a>, stating your name, the email associated with your account, and request details. We may request additional information only as needed to verify identity; we will never ask for your Facebook or website password.</p></LegalSection>
            <LegalSection title="11. Deleting Data and Facebook-Connected Accounts"><p>See our <Link className="text-orange-700 underline" href="/en/data-deletion">User Data Deletion Instructions</Link>. You may request deletion of Facebook Login data and your website account to the extent permitted by law. We will notify you of the result or why some data must be retained.</p></LegalSection>
            <LegalSection title="12. Updates to This Notice"><p>We may update this notice when our systems, services, or applicable laws change. The latest version will be published on this website with its effective date. We will notify you of material changes using an appropriate method.</p></LegalSection>
          </div>
          <p className="mt-8 rounded-lg bg-orange-50 px-5 py-4 text-neutral-700">Related document: <Link className="text-orange-700 underline" href="/en/data-deletion">User Data Deletion Instructions</Link></p>
        </article>
      </section>
      <SiteFooter categories={chrome.categories} locale="en" socialContacts={chrome.socialContacts} />
    </main>
  );
}
