import { getDictionary, type Locale } from "@/lib/i18n";
import { fetchAdminList } from "@/lib/admin-api";
import {
  AdminDataTable,
  type AdminDataTableColumn,
  AdminStatusBadge,
} from "./admin-data-table";

type HomeSettingRow = {
  id: string;
  name: string;
  headlineTh: string;
  headlineEn: string;
  isActive: boolean;
};

type AboutSettingRow = {
  id: string;
  headlineTh: string;
  headlineEn: string;
  imgUrl: string[];
};

type SocialContactRow = {
  code: string;
  rank: number;
  name: string;
  contactUrl: string;
  isActive: boolean;
};

type FaqRow = {
  id: string;
  rank: number;
  questionTh: string | null;
  questionEn: string | null;
  categoryCode: string | null;
  isActive: boolean;
};

export async function SettingsSection({ locale }: { locale: Locale }) {
  const content = getDictionary(locale).adminSections.settings;
  const labels = getSettingsLabels(locale);
  const [homeSettings, aboutSettings, socialContacts, faqs] = await Promise.all([
    fetchAdminList<HomeSettingRow>("/home-section-settings", {
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<AboutSettingRow>("/about-page-settings", {
      isActive: false,
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<SocialContactRow>("/social-media-contacts", {
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<FaqRow>("/faqs", {
      page: 1,
      pageSize: 20,
    }),
  ]);

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
      <SettingsTable
        columns={[
          {
            key: "name",
            header: labels.columns.name,
            className: "admin-table-code-column",
            render: (row) => <strong>{row.name}</strong>,
          },
          {
            key: "headlineTh",
            header: labels.columns.headlineTh,
            className: "admin-table-name-column",
            render: (row) => row.headlineTh,
          },
          {
            key: "headlineEn",
            header: labels.columns.headlineEn,
            className: "admin-table-name-column",
            render: (row) => row.headlineEn,
          },
          {
            key: "status",
            header: labels.columns.status,
            className: "admin-table-status-column",
            render: (row) => (
              <AdminStatusBadge
                label={row.isActive ? labels.active : labels.inactive}
                tone={row.isActive ? "active" : "inactive"}
              />
            ),
          },
        ]}
        emptyLabel={homeSettings ? labels.empty.home : labels.fetchError.home}
        getRowId={(row) => row.id}
        rows={homeSettings?.items ?? []}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.name}`}
        title={labels.homeTitle}
      />
      <SettingsTable
        columns={[
          {
            key: "headlineTh",
            header: labels.columns.headlineTh,
            className: "admin-table-name-column",
            render: (row) => row.headlineTh,
          },
          {
            key: "headlineEn",
            header: labels.columns.headlineEn,
            className: "admin-table-name-column",
            render: (row) => row.headlineEn,
          },
          {
            key: "images",
            header: labels.columns.images,
            className: "admin-table-number-column",
            render: (row) => row.imgUrl.length,
          },
        ]}
        emptyLabel={aboutSettings ? labels.empty.about : labels.fetchError.about}
        getRowId={(row) => row.id}
        rows={aboutSettings?.items ?? []}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.id}`}
        title={labels.aboutTitle}
      />
      <SettingsTable
        columns={[
          {
            key: "code",
            header: labels.columns.code,
            className: "admin-table-code-column",
            render: (row) => <strong>{row.code}</strong>,
          },
          {
            key: "rank",
            header: labels.columns.rank,
            className: "admin-table-rank-column",
            render: (row) => row.rank,
          },
          {
            key: "name",
            header: labels.columns.name,
            className: "admin-table-name-column",
            render: (row) => row.name,
          },
          {
            key: "contactUrl",
            header: labels.columns.contactUrl,
            className: "admin-table-slug-column",
            render: (row) => (
              <a href={row.contactUrl} rel="noreferrer" target="_blank">
                {labels.open}
              </a>
            ),
          },
          {
            key: "status",
            header: labels.columns.status,
            className: "admin-table-status-column",
            render: (row) => (
              <AdminStatusBadge
                label={row.isActive ? labels.active : labels.inactive}
                tone={row.isActive ? "active" : "inactive"}
              />
            ),
          },
        ]}
        emptyLabel={socialContacts ? labels.empty.social : labels.fetchError.social}
        getRowId={(row) => row.code}
        rows={socialContacts?.items ?? []}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.code}`}
        title={labels.socialTitle}
      />
      <SettingsTable
        columns={[
          {
            key: "rank",
            header: labels.columns.rank,
            className: "admin-table-rank-column",
            render: (row) => row.rank,
          },
          {
            key: "questionTh",
            header: labels.columns.questionTh,
            className: "admin-table-name-column",
            render: (row) => row.questionTh ?? "-",
          },
          {
            key: "questionEn",
            header: labels.columns.questionEn,
            className: "admin-table-name-column",
            render: (row) => row.questionEn ?? "-",
          },
          {
            key: "categoryCode",
            header: labels.columns.categoryCode,
            className: "admin-table-category-column",
            render: (row) => row.categoryCode ?? "-",
          },
          {
            key: "status",
            header: labels.columns.status,
            className: "admin-table-status-column",
            render: (row) => (
              <AdminStatusBadge
                label={row.isActive ? labels.active : labels.inactive}
                tone={row.isActive ? "active" : "inactive"}
              />
            ),
          },
        ]}
        emptyLabel={faqs ? labels.empty.faqs : labels.fetchError.faqs}
        getRowId={(row) => row.id}
        rows={faqs?.items ?? []}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.id}`}
        title={labels.faqsTitle}
      />
    </div>
  );
}

function SettingsTable<Row>({
  columns,
  emptyLabel,
  getRowId,
  rows,
  selectAllLabel,
  selectRowLabel,
  title,
}: {
  columns: AdminDataTableColumn<Row>[];
  emptyLabel: string;
  getRowId: (row: Row) => string;
  rows: Row[];
  selectAllLabel: string;
  selectRowLabel: (row: Row) => string;
  title: string;
}) {
  return (
    <>
      <h2 className="admin-subsection-heading">{title}</h2>
      <AdminDataTable
        columns={columns}
        emptyLabel={emptyLabel}
        getRowId={getRowId}
        rows={rows}
        selectAllLabel={selectAllLabel}
        selectRowLabel={selectRowLabel}
        wide
      />
    </>
  );
}

function getSettingsLabels(locale: Locale) {
  return locale === "th"
    ? {
        homeTitle: "หน้าแรก",
        aboutTitle: "เกี่ยวกับเรา",
        socialTitle: "ช่องทางติดต่อ",
        faqsTitle: "คำถามที่พบบ่อย",
        columns: {
          code: "รหัส",
          rank: "ลำดับ",
          name: "ชื่อ",
          headlineTh: "หัวข้อภาษาไทย",
          headlineEn: "หัวข้อภาษาอังกฤษ",
          questionTh: "คำถามภาษาไทย",
          questionEn: "คำถามภาษาอังกฤษ",
          categoryCode: "หมวดหมู่",
          images: "รูปภาพ",
          contactUrl: "ลิงก์",
          status: "สถานะ",
        },
        active: "ACTIVE",
        inactive: "INACTIVE",
        open: "เปิด",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
        empty: {
          home: "ไม่พบข้อมูลหน้าแรก",
          about: "ไม่พบข้อมูลเกี่ยวกับเรา",
          social: "ไม่พบข้อมูลช่องทางติดต่อ",
          faqs: "ไม่พบข้อมูลคำถามที่พบบ่อย",
        },
        fetchError: {
          home: "ไม่สามารถโหลดข้อมูลหน้าแรกได้",
          about: "ไม่สามารถโหลดข้อมูลเกี่ยวกับเราได้",
          social: "ไม่สามารถโหลดข้อมูลช่องทางติดต่อได้",
          faqs: "ไม่สามารถโหลดข้อมูลคำถามที่พบบ่อยได้",
        },
      }
    : {
        homeTitle: "Home",
        aboutTitle: "About Us",
        socialTitle: "Social Contacts",
        faqsTitle: "FAQs",
        columns: {
          code: "Code",
          rank: "Rank",
          name: "Name",
          headlineTh: "Thai Headline",
          headlineEn: "English Headline",
          questionTh: "Thai Question",
          questionEn: "English Question",
          categoryCode: "Category",
          images: "Images",
          contactUrl: "Link",
          status: "Status",
        },
        active: "ACTIVE",
        inactive: "INACTIVE",
        open: "Open",
        selectAll: "Select all rows",
        selectRow: "Select row",
        empty: {
          home: "No home settings found",
          about: "No about settings found",
          social: "No social contacts found",
          faqs: "No FAQs found",
        },
        fetchError: {
          home: "Unable to load home settings",
          about: "Unable to load about settings",
          social: "Unable to load social contacts",
          faqs: "Unable to load FAQs",
        },
      };
}
