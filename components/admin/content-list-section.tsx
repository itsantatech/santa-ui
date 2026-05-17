import { fetchAdminList, formatAdminDateTime } from "@/lib/admin-api";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  AdminDataTable,
  type AdminDataTableColumn,
  AdminRowActions,
  AdminStatusBadge,
} from "./admin-data-table";
import type { AdminSection } from "./admin-sections";

type ContentRow = {
  id: string;
  rank: number;
  topicTh: string;
  topicEn: string;
  slug: string;
  imgUrl: string[];
  relatedSku: string[];
  isActive: boolean;
  updatedAt?: string;
  updatedBy?: string;
};

type ContentListSectionProps = {
  apiPath: "/articles" | "/news-and-activities";
  locale: Locale;
  page: number;
  section: Extract<AdminSection, "articles" | "news-activities">;
};

export async function ContentListSection({
  apiPath,
  locale,
  page,
  section,
}: ContentListSectionProps) {
  const content = getDictionary(locale).adminSections[section];
  const labels = getContentLabels(locale);
  const response = await fetchAdminList<ContentRow>(apiPath, { page });
  const rows = response?.items ?? [];
  const columns: AdminDataTableColumn<ContentRow>[] = [
    {
      key: "rank",
      header: labels.columns.rank,
      className: "admin-table-rank-column",
      render: (row) => row.rank,
    },
    {
      key: "topicTh",
      header: labels.columns.topicTh,
      className: "admin-table-name-column",
      render: (row) => row.topicTh,
    },
    {
      key: "topicEn",
      header: labels.columns.topicEn,
      className: "admin-table-name-column",
      render: (row) => row.topicEn,
    },
    {
      key: "slug",
      header: labels.columns.slug,
      className: "admin-table-slug-column",
      render: (row) => row.slug,
    },
    {
      key: "images",
      header: labels.columns.images,
      className: "admin-table-number-column",
      render: (row) => row.imgUrl.length,
    },
    {
      key: "relatedSku",
      header: labels.columns.relatedSku,
      className: "admin-table-relations-column",
      render: (row) =>
        row.relatedSku.length > 0 ? (
          <div className="admin-table-relations">
            {row.relatedSku.map((sku) => (
              <strong key={sku}>{sku}</strong>
            ))}
          </div>
        ) : (
          <span className="admin-table-muted">-</span>
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
    {
      key: "updatedBy",
      header: labels.columns.updatedBy,
      className: "admin-table-user-column",
      render: (row) => row.updatedBy ?? "-",
    },
    {
      key: "updatedAt",
      header: labels.columns.updatedAt,
      className: "admin-table-date-column",
      render: (row) => formatAdminDateTime(row.updatedAt, locale),
    },
    {
      key: "actions",
      header: labels.columns.actions,
      className: "admin-table-actions-column",
      render: () => (
        <AdminRowActions deleteLabel={labels.delete} editLabel={labels.edit} />
      ),
    },
  ];

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
      <AdminDataTable
        columns={columns}
        emptyLabel={response ? labels.empty[section] : labels.fetchError[section]}
        getRowId={(row) => row.id}
        pagination={{
          currentPage: response?.meta.page ?? page,
          totalPages: response?.meta.totalPages ?? 1,
          getPageHref: (page) => `/${locale}/admin?section=${section}&page=${page}`,
          previousLabel: labels.previousPage,
          nextLabel: labels.nextPage,
        }}
        rows={rows}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.slug}`}
        wide
      />
    </div>
  );
}

function getContentLabels(locale: Locale) {
  return locale === "th"
    ? {
        columns: {
          rank: "ลำดับ",
          topicTh: "หัวข้อภาษาไทย",
          topicEn: "หัวข้อภาษาอังกฤษ",
          slug: "Slug",
          images: "รูปภาพ",
          relatedSku: "SKU ที่เกี่ยวข้อง",
          status: "สถานะ",
          updatedBy: "อัปเดตโดย",
          updatedAt: "อัปเดตล่าสุด",
          actions: "จัดการ",
        },
        active: "ACTIVE",
        inactive: "INACTIVE",
        edit: "แก้ไข",
        delete: "ลบ",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
        previousPage: "หน้าก่อนหน้า",
        nextPage: "หน้าถัดไป",
        empty: {
          articles: "ไม่พบข้อมูลบทความ",
          "news-activities": "ไม่พบข้อมูลข่าวสารและกิจกรรม",
        },
        fetchError: {
          articles: "ไม่สามารถโหลดข้อมูลบทความได้",
          "news-activities": "ไม่สามารถโหลดข้อมูลข่าวสารและกิจกรรมได้",
        },
      }
    : {
        columns: {
          rank: "Rank",
          topicTh: "Thai Topic",
          topicEn: "English Topic",
          slug: "Slug",
          images: "Images",
          relatedSku: "Related SKU",
          status: "Status",
          updatedBy: "Updated By",
          updatedAt: "Updated At",
          actions: "Actions",
        },
        active: "ACTIVE",
        inactive: "INACTIVE",
        edit: "Edit",
        delete: "Delete",
        selectAll: "Select all rows",
        selectRow: "Select row",
        previousPage: "Previous page",
        nextPage: "Next page",
        empty: {
          articles: "No articles found",
          "news-activities": "No news or activities found",
        },
        fetchError: {
          articles: "Unable to load articles",
          "news-activities": "Unable to load news and activities",
        },
      };
}
