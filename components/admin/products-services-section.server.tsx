import { ProductFilter, type ProductFilterOption } from "@/components/product-filter";
import { ProductSearch } from "@/components/product-search";
import {
  type ProductEditorOption,
  ProductInlineEditTable,
  type ProductTableLabels,
  ProductToolbarActions,
} from "./products-services-section";
import { getDictionary, type Locale } from "@/lib/i18n";
import {
  fetchAdminList,
  type AdminListResponse,
} from "@/lib/admin-api";

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
  isActive?: boolean;
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
  const statusOptions = [
    { label: table.active, value: "true" },
    { label: table.inactive, value: "false" },
  ];
  const selectedStatus = findSelectedOption(
    statusOptions,
    filters?.isActive === undefined ? undefined : String(filters.isActive),
  );
  const filterStateKey = [
    filters?.categoryCode ?? "",
    filters?.subCategoryCode ?? "",
    filters?.brandCode ?? "",
    filters?.isActive === undefined ? "" : String(filters.isActive),
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
      {
        id: "isActive",
        label: isThaiLocale ? "สถานะ" : "Status",
        options: statusOptions,
        placeholder: isThaiLocale ? "เลือกสถานะ" : "Select status",
        selected: selectedStatus ? [selectedStatus] : undefined,
      },
    ],
    removeFilterLabel: isThaiLocale ? "ลบตัวกรอง" : "Remove filter",
    resultLabel: isThaiLocale ? "ผลการค้นหาจำนวน" : "Search results",
    resultUnit: isThaiLocale ? "รายการ" : "items",
    title: isThaiLocale ? "ตัวกรอง" : "Filters",
  };
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
      <ProductInlineEditTable
        brandOptions={productEditorBrandOptions}
        categoryOptions={productEditorCategoryOptions}
        labels={productUi}
        locale={locale}
        pagination={{
          currentPage,
          currentPageSize,
          nextLabel: table.nextPage,
          previousLabel: table.previousPage,
          rowsPerPageLabel: productUi.rowsPerPage,
          totalPages,
        }}
        rows={rows}
        subCategoryOptions={productEditorSubCategoryOptions}
        tableLabels={table as ProductTableLabels}
      />
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
    isActive: filters?.isActive,
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
      chooseFile: "เลือกไฟล์",
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
        imgUrl: "รูปภาพ",
        isActive: "แสดงผล",
        isBestSeller: "สินค้าขายดี",
        isNewProduct: "สินค้าใหม่",
        isPromotion: "โปรโมชั่น",
        model: "รุ่น",
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
      googleCategoryEmpty: "ยังไม่ได้เลือก Google Product Category",
      googleCategoryLoading: "กำลังโหลดหมวดหมู่...",
      googleCategorySearchPlaceholder:
        "ค้นหาชื่อ path ของ Google Product Category",
      noDatasheet: "ยังไม่มีไฟล์ PDF",
      noFileChosen: "ยังไม่ได้เลือกไฟล์",
      noImage: "ไม่มีรูป",
      noMedia: "ยังไม่มีรูปภาพหรือวิดีโอ",
      noSuggestions: "ไม่พบสินค้า",
      inlineEdit: "แก้ไข",
      inlineEditDirty: "แก้ไขแล้ว {count} รายการ",
      inlineEditImageHelper:
        "ฟิลด์รูปภาพ, หมวดหมู่, หมวดย่อย และแบรนด์ รองรับการกรอกหลายค่าโดยคั่นด้วย comma หรือขึ้นบรรทัดใหม่",
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
      chooseFile: "Choose file",
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
        imgUrl: "Images",
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
      googleCategoryEmpty: "No Google product category selected",
      googleCategoryLoading: "Loading categories...",
      googleCategorySearchPlaceholder: "Search Google product category path",
      noDatasheet: "No PDF uploaded",
      noFileChosen: "No file chosen",
      noImage: "No image",
      noMedia: "No images or videos uploaded",
      noSuggestions: "No products found",
      inlineEdit: "Edit",
      inlineEditDirty: "{count} row(s) changed",
      inlineEditImageHelper:
        "Image, category, sub-category, and brand fields accept multiple values separated by commas or new lines.",
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
