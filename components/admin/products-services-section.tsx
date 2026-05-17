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

type ProductRelation = {
  code: string;
  nameTh: string;
  nameEn: string;
};

type ProductRow = {
  sku: string;
  id: number;
  rank: number;
  nameTh: string;
  nameEn: string;
  shortDescriptionTh: string;
  shortDescriptionEn: string;
  descriptionTh: string;
  descriptionEn: string;
  datasheetUrl: string | null;
  imgUrl: string[];
  slug: string;
  price: number | null;
  model: string | null;
  seoTitleTh: string;
  seoTitleEn: string;
  seoDescriptionTh: string;
  seoDescriptionEn: string;
  googleCategoryId: string | null;
  isActive: boolean;
  isNewProduct: boolean;
  isBestSeller: boolean;
  isPromotion: boolean;
  discountedPrice: number | null;
  categoryCods?: ProductRelation[];
  categories?: ProductRelation[];
  subCategories: ProductRelation[];
  brands: ProductRelation[];
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
};

type ProductResponse = AdminListResponse<ProductRow>;

export async function ProductsServicesSection({
  locale,
  page,
}: {
  locale: Locale;
  page: number;
}) {
  const dictionary = getDictionary(locale);
  const content = dictionary.adminSections["products-services"];
  const table = dictionary.adminProductTable;
  const response = await getProducts(page);
  const rows = response?.items ?? [];
  const totalPages = response?.meta.totalPages ?? 1;
  const currentPage = response?.meta.page ?? page;
  const columns: AdminDataTableColumn<ProductRow>[] = [
    {
      key: "sku",
      header: table.columns.sku,
      className: "admin-table-code-column",
      render: (row) => <strong>{row.sku}</strong>,
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
      key: "model",
      header: table.columns.model,
      className: "admin-table-model-column",
      render: (row) => row.model ?? table.noModel,
    },
    {
      key: "price",
      header: table.columns.price,
      className: "admin-table-price-column",
      render: (row) => formatPrice(row.discountedPrice ?? row.price, locale, table.noPrice),
    },
    {
      key: "category",
      header: table.columns.category,
      className: "admin-table-relations-column",
      render: (row) => (
        <ProductRelationList
          locale={locale}
          noRelationsLabel={table.noRelations}
          relations={row.categories ?? row.categoryCods ?? []}
        />
      ),
    },
    {
      key: "subCategory",
      header: table.columns.subCategory,
      className: "admin-table-sub-category-column",
      render: (row) => (
        <ProductRelationList
          locale={locale}
          noRelationsLabel={table.noRelations}
          relations={row.subCategories}
        />
      ),
    },
    {
      key: "brands",
      header: table.columns.brands,
      className: "admin-table-brands-column",
      render: (row) => (
        <ProductRelationList
          locale={locale}
          noRelationsLabel={table.noRelations}
          relations={row.brands}
        />
      ),
    },
    {
      key: "flags",
      header: table.columns.flags,
      className: "admin-table-flags-column",
      render: (row) => (
        <ProductFlags
          bestSellerLabel={table.bestSeller}
          noFlagsLabel={table.noFlags}
          newProductLabel={table.newProduct}
          product={row}
          promotionLabel={table.promotion}
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
        getRowId={(row) => row.sku}
        pagination={{
          currentPage,
          totalPages,
          getPageHref: (page) => `/${locale}/admin?section=products-services&page=${page}`,
          previousLabel: table.previousPage,
          nextLabel: table.nextPage,
        }}
        rows={rows}
        selectAllLabel={table.selectAll}
        selectRowLabel={(row) => `${table.selectRow} ${row.sku}`}
        wide
      />
    </div>
  );
}

async function getProducts(page: number): Promise<ProductResponse | null> {
  return fetchAdminList<ProductRow>("/products", { page });
}

function ProductRelationList({
  locale,
  noRelationsLabel,
  relations,
}: {
  locale: Locale;
  noRelationsLabel: string;
  relations: ProductRelation[];
}) {
  if (relations.length === 0) {
    return <span className="admin-table-muted">{noRelationsLabel}</span>;
  }

  return (
    <div className="admin-table-relations">
      {relations.map((relation) => (
        <strong key={relation.code}>
          {locale === "th" ? relation.nameTh : relation.nameEn}
        </strong>
      ))}
    </div>
  );
}

function ProductFlags({
  bestSellerLabel,
  noFlagsLabel,
  newProductLabel,
  product,
  promotionLabel,
}: {
  bestSellerLabel: string;
  noFlagsLabel: string;
  newProductLabel: string;
  product: ProductRow;
  promotionLabel: string;
}) {
  const flags = [
    product.isNewProduct ? newProductLabel : null,
    product.isBestSeller ? bestSellerLabel : null,
    product.isPromotion ? promotionLabel : null,
  ].filter((flag): flag is string => Boolean(flag));

  if (flags.length === 0) {
    return <span className="admin-table-muted">{noFlagsLabel}</span>;
  }

  return (
    <div className="admin-table-flag-list">
      {flags.map((flag) => (
        <span key={flag}>{flag}</span>
      ))}
    </div>
  );
}

function formatPrice(value: number | null, locale: Locale, fallback: string) {
  if (value === null) {
    return fallback;
  }

  return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
    currency: "THB",
    style: "currency",
  }).format(value);
}
