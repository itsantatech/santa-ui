import { getDictionary, type Locale } from "@/lib/i18n";
import {
  fetchAdminList,
  formatAdminDateTime,
  type AdminListResponse,
} from "@/lib/admin-api";
import {
  AdminDataTable,
  type AdminDataTableColumn,
  AdminRowActions,
  AdminStatusBadge,
} from "./admin-data-table";

type CategoryRow = {
  code: string;
  id: number;
  rank: number;
  nameTh: string;
  nameEn: string;
  descriptionTh: string | null;
  descriptionEn: string | null;
  slug: string;
  iconImgUrl: string | null;
  coverImgUrl: string | null;
  seoTitleTh: string;
  seoTitleEn: string;
  seoDescriptionTh: string;
  seoDescriptionEn: string;
  isActive: boolean;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
};

type CategoryResponse = AdminListResponse<CategoryRow>;

export async function CategoriesSection({
  locale,
  page,
}: {
  locale: Locale;
  page: number;
}) {
  const dictionary = getDictionary(locale);
  const content = dictionary.adminSections.categories;
  const table = dictionary.adminCategoryTable;
  const response = await getCategories(page);
  const rows = response?.items ?? [];
  const totalPages = response?.meta.totalPages ?? 1;
  const currentPage = response?.meta.page ?? page;
  const columns: AdminDataTableColumn<CategoryRow>[] = [
    {
      key: "code",
      header: table.columns.code,
      className: "admin-table-code-column",
      render: (row) => <strong>{row.code}</strong>,
    },
    {
      key: "rank",
      header: table.columns.rank,
      className: "admin-table-rank-column",
      render: (row) => row.rank,
    },
    {
      key: "nameTh",
      header: table.columns.nameTh,
      className: "admin-table-name-column",
      render: (row) => row.nameTh,
    },
    {
      key: "nameEn",
      header: table.columns.nameEn,
      className: "admin-table-name-column",
      render: (row) => row.nameEn,
    },
    {
      key: "slug",
      header: table.columns.slug,
      className: "admin-table-slug-column",
      render: (row) => row.slug,
    },
    {
      key: "image",
      header: table.columns.image,
      className: "admin-table-image-column",
      render: (row) => (
        <CategoryImageLinks
          coverImgUrl={row.coverImgUrl}
          coverLabel={table.coverImage}
          iconImgUrl={row.iconImgUrl}
          iconLabel={table.iconImage}
          noImageLabel={table.noImage}
        />
      ),
    },
    {
      key: "status",
      header: table.columns.status,
      className: "admin-table-status-column",
      render: (row) => (
        <AdminStatusBadge
          label={row.isActive ? table.active : table.inactive}
          tone={row.isActive ? "active" : "inactive"}
        />
      ),
    },
    {
      key: "updatedBy",
      header: table.columns.updatedBy,
      className: "admin-table-user-column",
      render: (row) => row.updatedBy,
    },
    {
      key: "updatedAt",
      header: table.columns.updatedAt,
      className: "admin-table-date-column",
      render: (row) => formatAdminDateTime(row.updatedAt, locale),
    },
    {
      key: "actions",
      header: table.columns.actions,
      className: "admin-table-actions-column",
      render: () => (
        <AdminRowActions deleteLabel={table.delete} editLabel={table.edit} />
      ),
    },
  ];

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <p>{content.description}</p>
      <AdminDataTable
        columns={columns}
        emptyLabel={response ? table.empty : table.fetchError}
        getRowId={(row) => row.code}
        pagination={{
          currentPage,
          totalPages,
          getPageHref: (page) => `/${locale}/admin?section=categories&page=${page}`,
          previousLabel: table.previousPage,
          nextLabel: table.nextPage,
        }}
        rows={rows}
        selectAllLabel={table.selectAll}
        selectRowLabel={(row) => `${table.selectRow} ${row.code}`}
      />
    </div>
  );
}

async function getCategories(page: number): Promise<CategoryResponse | null> {
  return fetchAdminList<CategoryRow>("/categories", { page });
}

function CategoryImageLinks({
  coverImgUrl,
  coverLabel,
  iconImgUrl,
  iconLabel,
  noImageLabel,
}: {
  coverImgUrl: string | null;
  coverLabel: string;
  iconImgUrl: string | null;
  iconLabel: string;
  noImageLabel: string;
}) {
  if (!iconImgUrl && !coverImgUrl) {
    return <span className="admin-table-muted">{noImageLabel}</span>;
  }

  return (
    <div className="admin-table-image-links">
      {iconImgUrl ? (
        <a href={iconImgUrl} rel="noreferrer" target="_blank">
          {iconLabel}
        </a>
      ) : null}
      {coverImgUrl ? (
        <a href={coverImgUrl} rel="noreferrer" target="_blank">
          {coverLabel}
        </a>
      ) : null}
    </div>
  );
}
