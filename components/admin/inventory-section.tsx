import Link from "next/link";
import Image from "next/image";
import type { ProductSearchSuggestion } from "@/components/product-search";
import { fetchAdminList, createSantaApiUrl } from "@/lib/admin-api";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  AdminDataTable,
  type AdminDataTableContextAction,
  type AdminDataTableColumn,
} from "./admin-data-table";
import {
  InventorySearchBar,
  InventoryRowActions,
  InventoryTableEditController,
  InventoryToolbarActions,
} from "./inventory-section.client";

type InventorySummary = {
  lowStockCount: number;
  totalStockQuantity: number;
};

type ProductRelation = {
  code: string;
  nameTh: string;
  nameEn: string;
};

type InventoryRow = {
  id: string;
  productSku: string;
  stockQuantity: number;
  lowStockThreshold: number;
  isActive: boolean;
  isLowStock: boolean;
  updatedAt?: string;
  updatedBy?: string;
  product: ProductSearchSuggestion & {
    shortDescriptionTh: string;
    shortDescriptionEn: string;
    imgUrl: string[];
    categories: ProductRelation[];
    subCategories: ProductRelation[];
    brands: ProductRelation[];
  };
};

export async function InventorySection({
  filters,
  locale,
  page,
}: {
  filters?: {
    lowStockOnly?: boolean;
    pageSize?: number;
    search?: string;
  };
  locale: Locale;
  page: number;
}) {
  const content = getDictionary(locale).adminSections.inventory;
  const labels = getInventoryLabels(locale);
  const [response, summary] = await Promise.all([
    fetchAdminList<InventoryRow>("/inventory-stocks", {
      lowStockOnly: filters?.lowStockOnly,
      page,
      pageSize: filters?.pageSize ?? 50,
      search: filters?.search,
    }),
    getInventorySummary(),
  ]);
  const rows = response?.items ?? [];
  const currentPageSize = response?.meta.pageSize ?? filters?.pageSize ?? 50;
  const lowStockHref = createInventoryHref(locale, {
    lowStockOnly: true,
    page: 1,
    pageSize: currentPageSize,
    search: filters?.search,
  });
  const clearLowStockHref = createInventoryHref(locale, {
    lowStockOnly: false,
    page: 1,
    pageSize: currentPageSize,
    search: filters?.search,
  });
  const columns: AdminDataTableColumn<InventoryRow>[] = [
    {
      key: "image",
      header: labels.columns.image,
      className: "admin-table-image-column",
      width: "118px",
      render: (row) => (
        <ProductImage
          alt={locale === "th" ? row.product.nameTh : row.product.nameEn}
          src={row.product.imgUrl[0]}
        />
      ),
    },
    {
      key: "sku",
      header: labels.columns.sku,
      className: "admin-table-code-column",
      width: "128px",
      render: (row) => <strong>{row.productSku}</strong>,
    },
    {
      key: "nameTh",
      header: labels.columns.nameTh,
      className: "admin-table-name-column",
      width: "240px",
      render: (row) => row.product.nameTh,
    },
    {
      key: "nameEn",
      header: labels.columns.nameEn,
      className: "admin-table-name-column",
      width: "250px",
      render: (row) => row.product.nameEn,
    },
    {
      key: "category",
      header: labels.columns.category,
      className: "admin-table-category-column",
      width: "190px",
      render: (row) => relationLabel(row.product.categories, locale),
    },
    {
      key: "subCategory",
      header: labels.columns.subCategory,
      className: "admin-table-category-column",
      width: "200px",
      render: (row) => relationLabel(row.product.subCategories, locale),
    },
    {
      key: "brand",
      header: labels.columns.brand,
      className: "admin-table-code-column",
      width: "120px",
      render: (row) => relationLabel(row.product.brands, locale),
    },
    {
      key: "stockQuantity",
      header: labels.columns.stockQuantity,
      className: "admin-table-number-fit-column",
      width: "84px",
      render: (row) => row.stockQuantity,
    },
    {
      key: "lowStockThreshold",
      header: labels.columns.lowStockThreshold,
      className: "admin-table-number-fit-column",
      width: "88px",
      render: (row) => row.lowStockThreshold,
    },
    {
      key: "actions",
      header: labels.columns.actions,
      className: "admin-table-actions-column",
      width: "120px",
      render: (row) => (
        <InventoryRowActions inventory={row} labels={labels} locale={locale} />
      ),
    },
  ];
  const contextMenuActions: AdminDataTableContextAction[] = [
    { id: "stockQuantity", label: labels.columns.stockQuantity },
    { id: "lowStockThreshold", label: labels.columns.lowStockThreshold },
    { id: "isActive", label: labels.activeToggle },
  ];

  return (
    <div className="admin-section-panel">
      <div className="admin-inventory-heading">
        <h1 id="admin-heading">{content.title}</h1>
        <div className="admin-inventory-summary-grid">
          <SummaryCard
            title={labels.summary.totalStock}
            value={summary?.totalStockQuantity ?? 0}
          />
          <SummaryCard
            accent
            title={labels.summary.lowStock}
            value={summary?.lowStockCount ?? 0}
            helper={filters?.lowStockOnly ? labels.summary.showAll : labels.summary.alert}
            helperHref={filters?.lowStockOnly ? clearLowStockHref : lowStockHref}
          />
        </div>
      </div>

      <div className="admin-product-heading-row">
        <InventorySearchBar
          initialSearch={filters?.search}
          labels={labels}
          locale={locale}
        />
        <InventoryToolbarActions labels={labels} locale={locale} />
      </div>

      <AdminDataTable
        columns={columns}
        contextMenuActions={contextMenuActions}
        emptyLabel={response ? labels.empty : labels.fetchError}
        getRowId={(row) => row.id}
        getRowClassName={(row) =>
          row.lowStockThreshold > 0 && row.stockQuantity < row.lowStockThreshold
            ? "admin-table-row-low-stock"
            : undefined
        }
        pagination={{
          currentPage: response?.meta.page ?? page,
          currentPageSize,
          totalPages: response?.meta.totalPages ?? 1,
          getPageHref: (nextPage) =>
            createInventoryHref(locale, {
              lowStockOnly: filters?.lowStockOnly,
              page: nextPage,
              pageSize: currentPageSize,
              search: filters?.search,
            }),
          previousLabel: labels.previousPage,
          nextLabel: labels.nextPage,
          rowsPerPageLabel: labels.rowsPerPage,
        }}
        rows={rows}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.productSku}`}
        tableId="inventory"
      />
      <InventoryTableEditController labels={labels} locale={locale} rows={rows} />
    </div>
  );
}

async function getInventorySummary(): Promise<InventorySummary | null> {
  try {
    const response = await fetch(createSantaApiUrl("/inventory-stocks/summary"), {
      cache: "no-store",
    });
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as InventorySummary;
  } catch {
    return null;
  }
}

function relationLabel(relations: ProductRelation[], locale: Locale) {
  const first = relations[0];
  if (!first) {
    return "-";
  }

  return locale === "th" ? first.nameTh : first.nameEn;
}

function SummaryCard({
  accent = false,
  helper,
  helperHref,
  title,
  value,
}: {
  accent?: boolean;
  helper?: string;
  helperHref?: string;
  title: string;
  value: number;
}) {
  return (
    <article className={accent ? "admin-inventory-summary-card admin-inventory-summary-card-accent" : "admin-inventory-summary-card"}>
      <h2>{title}</h2>
      <strong>{value.toLocaleString()}</strong>
      {helper && helperHref ? <Link href={helperHref}>{helper}</Link> : null}
    </article>
  );
}

function ProductImage({ alt, src }: { alt: string; src?: string }) {
  if (!src) {
    return <span className="admin-table-product-image" aria-hidden="true" />;
  }

  return (
    <Image
      alt={alt}
      className="admin-table-product-image"
      height={64}
      src={src}
      unoptimized
      width={64}
    />
  );
}

export type InventoryManagementRow = InventoryRow;
export type InventoryLabels = {
  add: string;
  addTitle: string;
  cancel: string;
  chooseFile: string;
  columns: {
    actions: string;
    brand: string;
    category: string;
    image: string;
    lowStockThreshold: string;
    nameEn: string;
    nameTh: string;
    sku: string;
    stockQuantity: string;
    subCategory: string;
  };
  delete: string;
  deleteBodyTemplate: string;
  deleteTitle: string;
  download: string;
  active: string;
  activeToggle: string;
  edit: string;
  editTitle: string;
  empty: string;
  error: string;
  fetchError: string;
  fileSelected: string;
  noFileChosen: string;
  nextPage: string;
  noSuggestions: string;
  previousPage: string;
  rowsPerPage: string;
  save: string;
  saving: string;
  search: string;
  searchPlaceholder: string;
  searchTooShort: string;
  selectAll: string;
  selectRow: string;
  inactive: string;
  summary: {
    alert: string;
    lowStock: string;
    showAll: string;
    totalStock: string;
  };
  template: string;
  upload: string;
};

function getInventoryLabels(locale: Locale): InventoryLabels {
  return locale === "th"
    ? {
        add: "เพิ่มข้อมูลสต๊อค",
        addTitle: "เพิ่มข้อมูลสต๊อค",
        cancel: "ยกเลิก",
        chooseFile: "เลือกไฟล์",
        columns: {
          actions: "จัดการ",
          brand: "แบรนด์",
          category: "หมวดหมู่",
          image: "รูป",
          lowStockThreshold: "ระดับสต๊อกต่ำ",
          nameEn: "ชื่อภาษาอังกฤษ",
          nameTh: "ชื่อภาษาไทย",
          sku: "SKU",
          stockQuantity: "ยอดสินค้าคงคลัง",
          subCategory: "หมวดหมู่ย่อย",
        },
        delete: "ลบ",
        deleteBodyTemplate: "ยืนยันการลบข้อมูลสต๊อคของ {sku}",
        deleteTitle: "ยืนยันการลบข้อมูลสต๊อค",
        download: "ดาวน์โหลด",
        active: "ACTIVE",
        activeToggle: "การแสดงผล",
        edit: "แก้ไข",
        editTitle: "แก้ไขข้อมูลสต๊อค",
        empty: "ไม่พบข้อมูลสต๊อค",
        error: "ไม่สามารถบันทึกข้อมูลสต๊อคได้",
        fetchError: "ไม่สามารถโหลดข้อมูลสต๊อคได้",
        fileSelected: "เลือกไฟล์แล้ว",
        noFileChosen: "ยังไม่ได้เลือกไฟล์",
        nextPage: "หน้าถัดไป",
        noSuggestions: "ไม่พบสินค้า",
        previousPage: "หน้าก่อนหน้า",
        rowsPerPage: "จำนวนต่อหน้า",
        save: "บันทึก",
        saving: "กำลังบันทึก...",
        search: "ค้นหา",
        searchPlaceholder: "ค้นหาสินค้า",
        searchTooShort: "พิมพ์อย่างน้อย 3 ตัวอักษร",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
        inactive: "INACTIVE",
        summary: {
          alert: "ดูรายการ",
          lowStock: "รายการสินค้าคงเหลือน้อย",
          showAll: "แสดงทั้งหมด",
          totalStock: "สินค้าคงคลังทั้งหมด",
        },
        template: "เทมเพลต",
        upload: "อัปโหลด",
      }
    : {
        add: "Add Stock",
        addTitle: "Add Stock",
        cancel: "Cancel",
        chooseFile: "Choose file",
        columns: {
          actions: "Actions",
          brand: "Brand",
          category: "Category",
          image: "Image",
          lowStockThreshold: "Low Stock Level",
          nameEn: "English Name",
          nameTh: "Thai Name",
          sku: "SKU",
          stockQuantity: "Stock Quantity",
          subCategory: "Sub Category",
        },
        delete: "Delete",
        deleteBodyTemplate: "Please confirm deleting inventory stock for {sku}",
        deleteTitle: "Confirm Inventory Delete",
        download: "Download",
        active: "ACTIVE",
        activeToggle: "Visibility",
        edit: "Edit",
        editTitle: "Edit Stock",
        empty: "No inventory stocks found",
        error: "Unable to save inventory stock",
        fetchError: "Unable to load inventory stocks",
        fileSelected: "File selected",
        noFileChosen: "No file chosen",
        nextPage: "Next page",
        noSuggestions: "No products found",
        previousPage: "Previous page",
        rowsPerPage: "Rows per page",
        save: "Save",
        saving: "Saving...",
        search: "Search",
        searchPlaceholder: "Search products",
        searchTooShort: "Enter at least 3 characters",
        selectAll: "Select all rows",
        selectRow: "Select row",
        inactive: "INACTIVE",
        summary: {
          alert: "View",
          lowStock: "Low stock items",
          showAll: "Show all",
          totalStock: "Total inventory",
        },
        template: "Template",
        upload: "Upload",
      };
}

function createInventoryHref(
  locale: Locale,
  {
    lowStockOnly,
    page,
    pageSize,
    search,
  }: {
    lowStockOnly?: boolean;
    page: number;
    pageSize: number;
    search?: string;
  },
) {
  const params = new URLSearchParams();

  params.set("section", "inventory");
  params.set("page", String(page));
  params.set("pageSize", String(pageSize));

  if (search) {
    params.set("search", search);
  }

  if (lowStockOnly) {
    params.set("lowStockOnly", "true");
  }

  return `/${locale}/admin?${params.toString()}`;
}
