import Image from "next/image";
import { ProductFilter, type ProductFilterOption } from "@/components/product-filter";
import { ProductSearch } from "@/components/product-search";
import {
  ProductTableEditController,
  type ProductEditorOption,
  ProductRowManagementActions,
  ProductToolbarActions,
} from "./products-services-section";
import { getProductContextMenuActions } from "./products-services-shared";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  fetchAdminList,
  formatAdminDateTime,
  type AdminListResponse,
} from "@/lib/admin-api";
import {
  AdminDataTable,
  type AdminDataTableColumn,
  AdminStatusBadge,
} from "./admin-data-table";

type ProductRelation = {
  code: string;
  categoryCode?: string;
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
  deliveryFee: number | null;
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
type ProductFilterListResponse = AdminListResponse<ProductRelation>;

type ProductFilters = {
  brandCode?: string;
  categoryCode?: string;
  pageSize?: number;
  search?: string;
  subCategoryCode?: string;
};

export async function ProductsServicesSection({
  filters,
  locale,
  page,
}: {
  filters?: ProductFilters;
  locale: Locale;
  page: number;
}) {
  const dictionary = getDictionary(locale);
  const content = dictionary.adminSections["products-services"];
  const table = dictionary.adminProductTable;
  const [response, categoryResponse, subCategoryResponse, brandResponse] =
    await Promise.all([
      getProducts(page, filters),
      getFilterOptions("/categories"),
      getFilterOptions("/sub-categories"),
      getFilterOptions("/brands"),
    ]);
  const rows = response?.items ?? [];
  const totalPages = response?.meta.totalPages ?? 1;
  const currentPage = response?.meta.page ?? page;
  const currentPageSize = response?.meta.pageSize ?? filters?.pageSize ?? 50;
  const totalItems = response?.meta.totalItems ?? 0;
  const isThaiLocale = locale === "th";
  const productUi = getProductAdminUiLabels(locale);
  const categoryOptions = toProductFilterOptions(
    categoryResponse?.items ?? [],
    locale,
  );
  const subCategoryOptions = toProductFilterOptions(
    subCategoryResponse?.items ?? [],
    locale,
  );
  const brandOptions = toProductFilterOptions(brandResponse?.items ?? [], locale);
  const productEditorCategoryOptions = toProductEditorOptions(
    categoryResponse?.items ?? [],
  );
  const productEditorSubCategoryOptions = toProductEditorOptions(
    subCategoryResponse?.items ?? [],
    true,
  );
  const productEditorBrandOptions = toProductEditorOptions(
    brandResponse?.items ?? [],
  );
  const selectedCategory = findSelectedOption(categoryOptions, filters?.categoryCode);
  const selectedSubCategory = findSelectedOption(
    subCategoryOptions,
    filters?.subCategoryCode,
  );
  const selectedBrand = findSelectedOption(brandOptions, filters?.brandCode);
  const filterStateKey = [
    filters?.categoryCode ?? "",
    filters?.subCategoryCode ?? "",
    filters?.brandCode ?? "",
    filters?.search ?? "",
    filters?.pageSize ?? "",
  ].join(":");
  const filterContent = {
    fields: [
      {
        id: "categoryCode",
        label: table.categories,
        options: categoryOptions,
        placeholder: isThaiLocale ? "เลือกหมวดหมู่" : "Select category",
        selected: selectedCategory ? [selectedCategory] : undefined,
      },
      {
        id: "subCategoryCode",
        dependsOn: "categoryCode",
        disabledPlaceholder: isThaiLocale
          ? "เลือกหมวดหมู่ก่อน"
          : "Select category first",
        label: table.subCategories,
        options: subCategoryOptions,
        placeholder: isThaiLocale ? "เลือกหมวดหมู่ย่อย" : "Select sub-category",
        selected: selectedSubCategory ? [selectedSubCategory] : undefined,
      },
      {
        id: "brandCode",
        label: table.brands,
        options: brandOptions,
        placeholder: isThaiLocale ? "เลือกแบรนด์" : "Select brand",
        selected: selectedBrand ? [selectedBrand] : undefined,
      },
    ],
    removeFilterLabel: isThaiLocale ? "ลบตัวกรอง" : "Remove filter",
    resultLabel: isThaiLocale ? "ผลการค้นหาจำนวน" : "Search results",
    resultUnit: isThaiLocale ? "รายการ" : "items",
    title: isThaiLocale ? "ตัวกรอง" : "Filters",
  };
  const columns: AdminDataTableColumn<ProductRow>[] = [
    {
      key: "image",
      header: productUi.columns.image,
      className: "admin-table-image-column",
      width: "118px",
      render: (row) => (
        <ProductImage
          alt={isThaiLocale ? row.nameTh : row.nameEn}
          fallback={productUi.noImage}
          src={row.imgUrl[0]}
        />
      ),
    },
    {
      key: "sku",
      header: table.columns.sku,
      className: "admin-table-code-column",
      width: "138px",
      render: (row) => <strong>{row.sku}</strong>,
    },
    {
      key: "rank",
      header: table.columns.rank,
      className: "admin-table-rank-column",
      width: "88px",
      render: (row) => row.rank,
    },
    {
      key: "nameTh",
      header: table.columns.nameTh,
      className: "admin-table-name-column",
      width: "240px",
      render: (row) => row.nameTh,
    },
    {
      key: "nameEn",
      header: table.columns.nameEn,
      className: "admin-table-name-column",
      width: "250px",
      render: (row) => row.nameEn,
    },
    {
      key: "model",
      header: table.columns.model,
      className: "admin-table-model-column",
      width: "130px",
      render: (row) => row.model ?? table.noModel,
    },
    {
      key: "price",
      header: table.columns.price,
      className: "admin-table-price-column",
      width: "132px",
      render: (row) => formatPrice(row.price, locale, table.noPrice),
    },
    {
      key: "discountedPrice",
      header: productUi.columns.discountedPrice,
      className: "admin-table-price-column",
      width: "156px",
      render: (row) => formatPrice(row.discountedPrice, locale, table.noPrice),
    },
    {
      key: "category",
      header: table.columns.category,
      className: "admin-table-relations-column",
      width: "220px",
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
      width: "230px",
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
      width: "190px",
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
      width: "160px",
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
      key: "deliveryFee",
      header: productUi.columns.deliveryFee,
      className: "admin-table-price-column",
      width: "132px",
      render: (row) => formatPrice(row.deliveryFee, locale, table.noPrice),
    },
    {
      key: "status",
      header: table.columns.status,
      className: "admin-table-status-column",
      width: "126px",
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
      width: "170px",
      render: (row) => row.updatedBy,
    },
    {
      key: "updatedAt",
      header: table.columns.updatedAt,
      className: "admin-table-date-column",
      width: "190px",
      render: (row) => formatAdminDateTime(row.updatedAt, locale),
    },
    {
      key: "actions",
      header: table.columns.actions,
      className: "admin-table-actions-column",
      width: "96px",
      render: (row) => (
        <ProductRowManagementActions
          brandOptions={productEditorBrandOptions}
          categoryOptions={productEditorCategoryOptions}
          labels={productUi}
          locale={locale}
          product={row}
          subCategoryOptions={productEditorSubCategoryOptions}
        />
      ),
    },
  ];

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{content.title}</h1>
      <div className="admin-product-heading-row">
        <ProductSearch
          key={filters?.search ?? ""}
          initialSearch={filters?.search}
          labels={productUi}
          locale={locale}
        />
        <ProductToolbarActions
          brandOptions={productEditorBrandOptions}
          categoryOptions={productEditorCategoryOptions}
          labels={productUi}
          locale={locale}
          rows={rows}
          subCategoryOptions={productEditorSubCategoryOptions}
        />
      </div>
      <ProductFilter
        key={filterStateKey}
        fields={filterContent.fields}
        locale={isThaiLocale ? "th-TH" : "en-US"}
        removeFilterLabel={filterContent.removeFilterLabel}
        resultCount={totalItems}
        resultLabel={filterContent.resultLabel}
        resultUnit={filterContent.resultUnit}
        syncQueryParams
        title={filterContent.title}
        variant="admin"
      />
      <AdminDataTable
        columns={columns}
        contextMenuActions={getProductContextMenuActions(productUi)}
        emptyLabel={response ? table.empty : table.fetchError}
        getRowId={(row) => row.sku}
        pagination={{
          currentPage,
          currentPageSize,
          totalPages,
          getPageHref: (nextPage) =>
            createProductsPageHref(locale, nextPage, filters),
          previousLabel: table.previousPage,
          nextLabel: table.nextPage,
          rowsPerPageLabel: productUi.rowsPerPage,
        }}
        rows={rows}
        selectAllLabel={table.selectAll}
        selectRowLabel={(row) => `${table.selectRow} ${row.sku}`}
        tableId="products-services"
        wide
      />
      <ProductTableEditController labels={productUi} rows={rows} />
    </div>
  );
}

async function getProducts(
  page: number,
  filters?: ProductFilters,
): Promise<ProductResponse | null> {
  return fetchAdminList<ProductRow>("/products", {
    brandCode: filters?.brandCode,
    categoryCode: filters?.categoryCode,
    page,
    pageSize: filters?.pageSize,
    search: filters?.search,
    subCategoryCode: filters?.subCategoryCode,
  });
}

async function getFilterOptions(
  resourcePath: string,
): Promise<ProductFilterListResponse | null> {
  return fetchAdminList<ProductRelation>(resourcePath, {
    page: 1,
    pageSize: 100,
  });
}

function toProductFilterOptions(
  items: ProductRelation[],
  locale: Locale,
): ProductFilterOption[] {
  return items.map((item) => ({
    label: locale === "th" ? item.nameTh : item.nameEn,
    parentValue: item.categoryCode,
    value: item.code,
  }));
}

function findSelectedOption(
  options: ProductFilterOption[],
  value: string | undefined,
) {
  if (!value) {
    return undefined;
  }

  return options.find((option) => option.value === value);
}

function toProductEditorOptions(
  items: ProductRelation[],
  withParentCode = false,
): ProductEditorOption[] {
  return items.map((item) => ({
    code: item.code,
    nameEn: item.nameEn,
    nameTh: item.nameTh,
    parentCode: withParentCode ? item.categoryCode : undefined,
  }));
}

function createProductsPageHref(
  locale: Locale,
  page: number,
  filters?: ProductFilters,
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    section: "products-services",
  });

  if (filters?.categoryCode) {
    searchParams.set("categoryCode", filters.categoryCode);
  }

  if (filters?.subCategoryCode) {
    searchParams.set("subCategoryCode", filters.subCategoryCode);
  }

  if (filters?.brandCode) {
    searchParams.set("brandCode", filters.brandCode);
  }

  if (filters?.search) {
    searchParams.set("search", filters.search);
  }

  if (filters?.pageSize) {
    searchParams.set("pageSize", String(filters.pageSize));
  }

  return `/${locale}/admin?${searchParams.toString()}`;
}

function ProductImage({
  alt,
  fallback,
  src,
}: {
  alt: string;
  fallback: string;
  src?: string;
}) {
  if (!src) {
    return <span className="admin-table-muted">{fallback}</span>;
  }

  return (
    <Image
      alt={alt}
      className="admin-table-product-image"
      height={64}
      loading="lazy"
      src={src}
      unoptimized
      width={64}
    />
  );
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

function getProductAdminUiLabels(locale: Locale) {
  return locale === "th"
  ? {
      columns: {
        image: "รูปภาพ",
        deliveryFee: "ค่าส่ง",
        discountedPrice: "ราคาลด",
      },
      add: "เพิ่มสินค้าและบริการ",
      addTitle: "เพิ่มสินค้าและบริการ",
      cancel: "ยกเลิก",
      confirmDelete: "ยืนยันการลบ",
      delete: "ลบ",
      deleteBodyTemplate: "ต้องการลบสินค้า {sku} ใช่หรือไม่",
      deleteTitle: "ลบสินค้า",
      download: "ดาวน์โหลด",
      edit: "แก้ไข",
      editTitle: "แก้ไขสินค้า",
      error: "ไม่สามารถบันทึกข้อมูลได้",
      fileSelected: "ไฟล์ที่เลือก",
      fields: {
        brandCodes: "แบรนด์",
        categoryCodes: "หมวดหมู่",
        datasheetUrl: "Datasheet",
        deliveryFee: "ค่าส่ง",
        descriptionEn: "รายละเอียดภาษาอังกฤษ",
        descriptionTh: "รายละเอียดภาษาไทย",
        discountedPrice: "ราคาลด",
        googleCategoryId: "Google Category ID",
        isActive: "สถานะ",
        isBestSeller: "สินค้าแนะนำ",
        isNewProduct: "สินค้าใหม่",
        isPromotion: "โปรโมชั่น",
        model: "รุ่น",
        imgUrl: "Image",
        isActive: "แสดงผล",
        isBestSeller: "Best seller",
        isNewProduct: "New product",
        isPromotion: "Promotion",
        model: "Model",
        nameEn: "ชื่อภาษาอังกฤษ",
        nameTh: "ชื่อภาษาไทย",
        price: "ราคา",
        rank: "ลำดับ",
        seoDescriptionEn: "SEO Description EN",
        seoDescriptionTh: "SEO Description TH",
        seoTitleEn: "SEO Title EN",
        seoTitleTh: "SEO Title TH",
        shortDescriptionEn: "คำอธิบายสั้นภาษาอังกฤษ",
        shortDescriptionTh: "คำอธิบายสั้นภาษาไทย",
        slug: "Slug",
        subCategoryCodes: "หมวดหมู่ย่อย",
      },
      noDatasheet: "ยังไม่มีไฟล์ PDF",
      noImage: "ไม่มีรูป",
      noMedia: "ยังไม่มีรูปภาพหรือวิดีโอ",
      noSuggestions: "ไม่พบสินค้า",
      rowsPerPage: "แถวต่อหน้า",
      save: "บันทึก",
      saving: "กำลังบันทึก...",
      search: "ค้นหา",
      searchPlaceholder: "ค้นหาด้วย SKU, ชื่อ หรือรุ่น",
      searchTooShort: "พิมพ์อย่างน้อย 3 ตัวอักษร",
      template: "เทมเพลต",
      uploadDatasheet: "อัปโหลด PDF",
      uploadError: "ไม่สามารถอัปโหลดไฟล์ได้",
      uploadImage: "อัปโหลดรูปภาพและวิดีโอ",
      uploadingDatasheet: "กำลังอัปโหลด PDF...",
      uploadingMedia: "กำลังอัปโหลดไฟล์...",
      upload: "อัปโหลด",
    }
  : {
      columns: {
        image: "Image",
        deliveryFee: "Delivery Fee",
        discountedPrice: "Discounted Price",
      },
      add: "Add product or service",
      addTitle: "Add product or service",
      cancel: "Cancel",
      confirmDelete: "Delete product",
      delete: "Delete",
      deleteBodyTemplate: "Delete product {sku}?",
      deleteTitle: "Delete product",
      download: "Download",
      edit: "Edit",
      editTitle: "Edit product",
      error: "Unable to save product",
      fileSelected: "Selected file",
      fields: {
        brandCodes: "Brands",
        categoryCodes: "Categories",
        datasheetUrl: "Datasheet URL",
        deliveryFee: "Delivery Fee",
        descriptionEn: "Description EN",
        descriptionTh: "Description TH",
        discountedPrice: "Discounted Price",
        googleCategoryId: "Google Category ID",
        isActive: "Active",
        isBestSeller: "Best seller",
        isNewProduct: "New product",
        isPromotion: "Promotion",
        model: "Model",
        nameEn: "Name EN",
        nameTh: "Name TH",
        price: "Price",
        rank: "Rank",
        seoDescriptionEn: "SEO Description EN",
        seoDescriptionTh: "SEO Description TH",
        seoTitleEn: "SEO Title EN",
        seoTitleTh: "SEO Title TH",
        shortDescriptionEn: "Short description EN",
        shortDescriptionTh: "Short description TH",
        slug: "Slug",
        subCategoryCodes: "Sub categories",
      },
      noImage: "No image",
      noMedia: "No images or videos uploaded",
      noSuggestions: "No products found",
      rowsPerPage: "Rows per page",
      save: "Save",
      saving: "Saving...",
      search: "Search",
      searchPlaceholder: "Search by SKU, name, or model",
      searchTooShort: "Enter at least 3 characters",
      template: "Template",
      uploadDatasheet: "Upload PDF",
      uploadError: "Unable to upload file",
      uploadImage: "Upload images and videos",
      uploadingDatasheet: "Uploading PDF...",
      uploadingMedia: "Uploading files...",
      upload: "Upload",
    };
}
