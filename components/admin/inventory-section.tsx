import { getDictionary, type Locale } from "@/lib/i18n";
import { fetchAdminList, formatAdminDateTime } from "@/lib/admin-api";
import {
  AdminDataTable,
  type AdminDataTableColumn,
  AdminRowActions,
  AdminStatusBadge,
} from "./admin-data-table";

type SubCategoryRow = {
  code: string;
  categoryCode: string;
  id: number;
  rank: number;
  nameTh: string;
  nameEn: string;
  slug: string;
  isActive: boolean;
  category?: {
    code: string;
    nameTh: string;
    nameEn: string;
  } | null;
  updatedAt?: string;
  updatedBy?: string;
};

export async function InventorySection({
  locale,
  page,
}: {
  locale: Locale;
  page: number;
}) {
  const content = getDictionary(locale).adminSections.inventory;
  const labels = getInventoryLabels(locale);
  const response = await fetchAdminList<SubCategoryRow>("/sub-categories", {
    page,
  });
  const rows = response?.items ?? [];
  const columns: AdminDataTableColumn<SubCategoryRow>[] = [
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
      key: "category",
      header: labels.columns.category,
      className: "admin-table-category-column",
      render: (row) =>
        row.category ? (
          locale === "th" ? row.category.nameTh : row.category.nameEn
        ) : (
          <span className="admin-table-muted">{row.categoryCode}</span>
        ),
    },
    {
      key: "nameTh",
      header: labels.columns.nameTh,
      className: "admin-table-name-column",
      render: (row) => row.nameTh,
    },
    {
      key: "nameEn",
      header: labels.columns.nameEn,
      className: "admin-table-name-column",
      render: (row) => row.nameEn,
    },
    {
      key: "slug",
      header: labels.columns.slug,
      className: "admin-table-slug-column",
      render: (row) => row.slug,
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
        emptyLabel={response ? labels.empty : labels.fetchError}
        getRowId={(row) => row.code}
        pagination={{
          currentPage: response?.meta.page ?? page,
          totalPages: response?.meta.totalPages ?? 1,
          getPageHref: (page) => `/${locale}/admin?section=inventory&page=${page}`,
          previousLabel: labels.previousPage,
          nextLabel: labels.nextPage,
        }}
        rows={rows}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.code}`}
        wide
      />
    </div>
  );
}

function getInventoryLabels(locale: Locale) {
  return locale === "th"
    ? {
        columns: {
          code: "รหัส",
          rank: "ลำดับ",
          category: "หมวดหมู่",
          nameTh: "ชื่อภาษาไทย",
          nameEn: "ชื่อภาษาอังกฤษ",
          slug: "Slug",
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
        empty: "ไม่พบข้อมูลหมวดย่อย",
        fetchError: "ไม่สามารถโหลดข้อมูลหมวดย่อยได้",
      }
    : {
        columns: {
          code: "Code",
          rank: "Rank",
          category: "Category",
          nameTh: "Thai Name",
          nameEn: "English Name",
          slug: "Slug",
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
        empty: "No sub-categories found",
        fetchError: "Unable to load sub-categories",
      };
}
