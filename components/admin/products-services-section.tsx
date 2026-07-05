"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
  type MouseEvent as ReactMouseEvent,
  type RefObject,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ProductSearchSuggestion } from "@/components/product-search";
import {
  AdminDataTable,
  AdminStatusBadge,
  type AdminDataTableColumn,
  type AdminDataTablePagination,
} from "./admin-data-table";
import {
  AdminBatchFieldModal,
  type AdminBatchFieldModalConfig,
} from "./admin-batch-field-modal";
import { useAdminTableEditRequest } from "./admin-table-events";
import { getProductContextMenuActions } from "./products-services-shared";
import { RichTextEditor } from "@/components/rich-text-editor";

export type ProductManagementRow = ProductSearchSuggestion & {
  id: number;
  rank: number;
  shortDescriptionTh: string;
  shortDescriptionEn: string;
  descriptionTh: string;
  descriptionEn: string;
  datasheetUrl: string | null;
  imgUrl: string[];
  slug: string;
  price: number | null;
  deliveryFee: number | null;
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
  categories?: { code: string }[];
  categoryCods?: { code: string }[];
  subCategories: { code: string }[];
  brands: { code: string }[];
  createdAt: string;
  createdBy: string;
  deletedAt: string | null;
  deletedBy: string | null;
  updatedAt: string;
  updatedBy: string;
};

type UploadedFileResponse = {
  signedUrl?: string;
  url?: string;
};

type GoogleProductCategoryOption = {
  id: string;
  fullPathEn: string;
  fullPathTh?: string | null;
};

type GoogleProductCategoryListResponse = {
  items: GoogleProductCategoryOption[];
};

export type ProductEditorOption = {
  code: string;
  nameEn: string;
  nameTh: string;
  parentCode?: string;
};

type ProductFormValue = {
  rank: string;
  nameTh: string;
  nameEn: string;
  shortDescriptionTh: string;
  shortDescriptionEn: string;
  descriptionTh: string;
  descriptionEn: string;
  datasheetUrl: string;
  imgUrl: string[];
  slug: string;
  price: string;
  deliveryFee: string;
  model: string;
  seoTitleTh: string;
  seoTitleEn: string;
  seoDescriptionTh: string;
  seoDescriptionEn: string;
  googleCategoryId: string;
  isActive: boolean;
  isNewProduct: boolean;
  isBestSeller: boolean;
  isPromotion: boolean;
  discountedPrice: string;
  categoryCodes: string[];
  subCategoryCodes: string[];
  brandCodes: string[];
};

type ProductBatchAction = keyof ProductLabels["fields"];
type ProductLabels = {
  columns: {
    deliveryFee: string;
    discountedPrice: string;
    image: string;
  };
  add: string;
  addTitle: string;
  cancel: string;
  chooseFile: string;
  confirmDelete: string;
  delete: string;
  deleteBodyTemplate: string;
  deleteTitle: string;
  download: string;
  edit: string;
  editTitle: string;
  error: string;
  fileSelected: string;
  fields: {
    brandCodes: string;
    categoryCodes: string;
    datasheetUrl: string;
    deliveryFee: string;
    descriptionEn: string;
    descriptionTh: string;
    discountedPrice: string;
    googleCategoryId: string;
    imgUrl: string;
    isActive: string;
    isBestSeller: string;
    isNewProduct: string;
    isPromotion: string;
    model: string;
    nameEn: string;
    nameTh: string;
    price: string;
    rank: string;
    seoDescriptionEn: string;
    seoDescriptionTh: string;
    seoTitleEn: string;
    seoTitleTh: string;
    shortDescriptionEn: string;
    shortDescriptionTh: string;
    slug: string;
    subCategoryCodes: string;
  };
  noDatasheet: string;
  noFileChosen: string;
  noImage: string;
  noMedia: string;
  googleCategoryEmpty: string;
  googleCategoryLoading: string;
  googleCategorySearchPlaceholder: string;
  noSuggestions: string;
  rowsPerPage: string;
  save: string;
  saving: string;
  search: string;
  searchPlaceholder: string;
  searchTooShort: string;
  template: string;
  inlineEdit: string;
  inlineEditDirty: string;
  inlineEditImageHelper: string;
  uploadDatasheet: string;
  uploadDatasheetHelper: string;
  uploadError: string;
  uploadFileHelper: string;
  uploadImage: string;
  uploadMediaHelper: string;
  uploadingDatasheet: string;
  uploadingMedia: string;
  upload: string;
};

export type ProductTableLabels = {
  columns: {
    createdAt: string;
    createdBy: string;
    datasheetUrl: string;
    deletedAt: string;
    deletedBy: string;
    descriptionEn: string;
    descriptionTh: string;
    googleCategoryId: string;
    id: string;
    image: string;
    deliveryFee: string;
    discountedPrice: string;
    actions: string;
    brands: string;
    category: string;
    flags: string;
    model: string;
    nameEn: string;
    nameTh: string;
    price: string;
    rank: string;
    seoDescriptionEn: string;
    seoDescriptionTh: string;
    seoTitleEn: string;
    seoTitleTh: string;
    shortDescriptionEn: string;
    shortDescriptionTh: string;
    slug: string;
    sku: string;
    status: string;
    subCategory: string;
    updatedAt: string;
    updatedBy: string;
  };
  active: string;
  bestSeller: string;
  empty: string;
  fetchError: string;
  inactive: string;
  newProduct: string;
  nextPage: string;
  noFlags: string;
  noModel: string;
  noPrice: string;
  noRelations: string;
  previousPage: string;
  promotion: string;
  selectAll: string;
  selectRow: string;
};

export type ProductTablePaginationData = {
  currentPage: number;
  currentPageSize?: number;
  nextLabel: string;
  previousLabel: string;
  rowsPerPageLabel?: string;
  totalPages: number;
};

type ProductInlineEditDraft = {
  brandCodesText: string;
  categoryCodesText: string;
  datasheetUrl: string;
  descriptionEn: string;
  descriptionTh: string;
  deliveryFee: string;
  discountedPrice: string;
  googleCategoryId: string;
  imgUrlText: string;
  isActive: boolean;
  isBestSeller: boolean;
  isNewProduct: boolean;
  isPromotion: boolean;
  model: string;
  nameEn: string;
  nameTh: string;
  price: string;
  rank: string;
  seoDescriptionEn: string;
  seoDescriptionTh: string;
  seoTitleEn: string;
  seoTitleTh: string;
  shortDescriptionEn: string;
  shortDescriptionTh: string;
  slug: string;
  subCategoryCodesText: string;
};

const INLINE_REQUIRED_FIELD_KEYS = [
  "slug",
  "nameTh",
  "nameEn",
  "shortDescriptionTh",
  "shortDescriptionEn",
  "seoTitleTh",
  "seoTitleEn",
  "seoDescriptionTh",
  "seoDescriptionEn",
] as const satisfies readonly (keyof Pick<
  ProductInlineEditDraft,
  | "slug"
  | "nameTh"
  | "nameEn"
  | "shortDescriptionTh"
  | "shortDescriptionEn"
  | "seoTitleTh"
  | "seoTitleEn"
  | "seoDescriptionTh"
  | "seoDescriptionEn"
>)[];

type InlineRequiredFieldKey = (typeof INLINE_REQUIRED_FIELD_KEYS)[number];

const PRODUCT_INLINE_EDIT_REQUEST_EVENT = "admin-product:inline-edit-request";
const PRODUCT_INLINE_EDIT_STATE_EVENT = "admin-product:inline-edit-state";

export function ProductToolbarActions({
  brandOptions,
  categoryOptions,
  labels,
  locale,
  subCategoryOptions,
}: {
  brandOptions: ProductEditorOption[];
  categoryOptions: ProductEditorOption[];
  labels: ProductLabels;
  locale: "th" | "en";
  rows?: ProductManagementRow[];
  subCategoryOptions: ProductEditorOption[];
}) {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isInlineEditMode, setIsInlineEditMode] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    function handleInlineEditState(event: Event) {
      const detail = (
        event as CustomEvent<{ isEditMode: boolean }>
      ).detail;

      if (!detail) {
        return;
      }

      setIsInlineEditMode(detail.isEditMode);
    }

    window.addEventListener(PRODUCT_INLINE_EDIT_STATE_EVENT, handleInlineEditState);

    return () => {
      window.removeEventListener(
        PRODUCT_INLINE_EDIT_STATE_EVENT,
        handleInlineEditState,
      );
    };
  }, []);

  async function handleDownload(path: string, fallbackFilename: string) {
    const response = await fetch(path, { cache: "no-store" });

    if (!response.ok) {
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = getDownloadFilename(response, fallbackFilename);
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="admin-product-toolbar-actions">
      <button
        className="admin-product-secondary-button"
        onClick={() => setIsUploadOpen(true)}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          upload
        </span>
        {labels.upload}
      </button>
      <button
        className="admin-product-secondary-button"
        onClick={() =>
          void handleDownload(
            `/api/admin/products/export?${searchParams.toString()}`,
            "products-export.xlsx",
          )
        }
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          download
        </span>
        {labels.download}
      </button>
      <button
        className="admin-product-secondary-button"
        onClick={() =>
          void handleDownload(
            "/api/admin/products/template",
            "products-import-template.xlsx",
          )
        }
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          description
        </span>
        {labels.template}
      </button>
      <button
        className="admin-product-add-button"
        onClick={() => setIsAddOpen(true)}
        type="button"
      >
        <span aria-hidden="true">+</span>
        {labels.add}
      </button>
      {!isInlineEditMode ? (
        <button
          className="admin-product-secondary-button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(PRODUCT_INLINE_EDIT_REQUEST_EVENT),
            );
          }}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
          {labels.inlineEdit}
        </button>
      ) : null}
      {isAddOpen ? (
        <ProductFormModal
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          labels={labels}
          locale={locale}
          mode="add"
          onClose={() => setIsAddOpen(false)}
          subCategoryOptions={subCategoryOptions}
        />
      ) : null}
      {isUploadOpen ? (
        <ProductUploadModal labels={labels} onClose={() => setIsUploadOpen(false)} />
      ) : null}
    </div>
  );
}

export function ProductRowManagementActions({
  brandOptions,
  categoryOptions,
  labels,
  locale,
  product,
  subCategoryOptions,
}: {
  brandOptions: ProductEditorOption[];
  categoryOptions: ProductEditorOption[];
  labels: ProductLabels;
  locale: "th" | "en";
  product: ProductManagementRow;
  subCategoryOptions: ProductEditorOption[];
}) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);

  return (
    <>
      <div className="admin-table-actions">
        <button
          className="admin-table-icon-button"
          onClick={() => setMode("edit")}
          type="button"
          aria-label={labels.edit}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
        </button>
        <button
          className="admin-table-icon-button"
          onClick={() => setMode("delete")}
          type="button"
          aria-label={labels.delete}
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            delete
          </span>
        </button>
      </div>
      {mode === "edit" ? (
        <ProductFormModal
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          labels={labels}
          locale={locale}
          mode="edit"
          onClose={() => setMode(null)}
          product={product}
          subCategoryOptions={subCategoryOptions}
        />
      ) : null}
      {mode === "delete" ? (
        <DeleteProductsModal
          labels={labels}
          locale={locale}
          onClose={() => setMode(null)}
          products={[product]}
        />
      ) : null}
    </>
  );
}

export function ProductTableEditController({
  brandOptions,
  categoryOptions,
  labels,
  locale,
  rows,
  subCategoryOptions,
}: {
  brandOptions: ProductEditorOption[];
  categoryOptions: ProductEditorOption[];
  labels: ProductLabels;
  locale: "th" | "en";
  rows: ProductManagementRow[];
  subCategoryOptions: ProductEditorOption[];
}) {
  const router = useRouter();
  const [editingProduct, setEditingProduct] = useState<ProductManagementRow | null>(
    null,
  );
  const [bulkEditingProducts, setBulkEditingProducts] = useState<
    ProductManagementRow[]
  >([]);
  const [bulkEditingAction, setBulkEditingAction] =
    useState<ProductBatchAction | null>(null);
  const [bulkDeletingProducts, setBulkDeletingProducts] = useState<
    ProductManagementRow[]
  >([]);
  const [promotionProducts, setPromotionProducts] = useState<ProductManagementRow[]>(
    [],
  );

  useAdminTableEditRequest("products-services", (actionId, rowIds) => {
    const matchedRows = rows.filter((row) => rowIds.includes(row.sku));

    if (actionId === "delete" && matchedRows.length > 0) {
      setEditingProduct(null);
      setBulkEditingAction(null);
      setBulkEditingProducts([]);
      setPromotionProducts([]);
      setBulkDeletingProducts(matchedRows);
      return;
    }

    if (actionId === "isPromotion" && matchedRows.length > 0) {
      setEditingProduct(null);
      setBulkEditingAction(null);
      setBulkEditingProducts([]);
      setBulkDeletingProducts([]);
      setPromotionProducts(matchedRows);
      return;
    }

    if (matchedRows.length === 1 && actionId === "edit") {
      setBulkDeletingProducts([]);
      setPromotionProducts([]);
      setEditingProduct(matchedRows[0]);
      return;
    }

    if (matchedRows.length > 0) {
      setEditingProduct(null);
      setBulkDeletingProducts([]);
      setPromotionProducts([]);
      setBulkEditingAction(actionId as ProductBatchAction);
      setBulkEditingProducts(matchedRows);
    }
  });

  return (
    <>
      {editingProduct ? (
        <ProductFormModal
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          labels={labels}
          locale={locale}
          mode="edit"
          onClose={() => setEditingProduct(null)}
          product={editingProduct}
          subCategoryOptions={subCategoryOptions}
        />
      ) : null}
      {bulkDeletingProducts.length > 0 ? (
        <DeleteProductsModal
          labels={labels}
          locale={locale}
          onClose={() => setBulkDeletingProducts([])}
          products={bulkDeletingProducts}
        />
      ) : null}
      {promotionProducts.length > 0 ? (
        <ProductPromotionModal
          labels={labels}
          locale={locale}
          onClose={() => setPromotionProducts([])}
          products={promotionProducts}
        />
      ) : null}
      {bulkEditingProducts.length > 0 && bulkEditingAction ? (
        <AdminBatchFieldModal
          cancelLabel={labels.cancel}
          config={getProductBatchFieldConfig(labels, bulkEditingAction, bulkEditingProducts[0])}
          description={`Update ${labels.fields[bulkEditingAction]} for ${bulkEditingProducts.length} selected products.`}
          errorMessage={labels.error}
          items={bulkEditingProducts.map((row) => row.sku)}
          onClose={() => {
            setBulkEditingAction(null);
            setBulkEditingProducts([]);
          }}
          onSubmit={async (value) => {
            const responses = await Promise.all(
              bulkEditingProducts.map((row) =>
                fetch(`/api/admin/products/${encodeURIComponent(row.sku)}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify(
                    buildProductPayload(row, bulkEditingAction, value),
                  ),
                }),
              ),
            );

            if (responses.some((response) => !response.ok)) {
              throw new Error("bulk-edit-failed");
            }

            setBulkEditingAction(null);
            setBulkEditingProducts([]);
            router.refresh();
          }}
          saveLabel={labels.save}
          savingLabel={labels.save}
          title={`Bulk edit products: ${labels.fields[bulkEditingAction]}`}
        />
      ) : null}
    </>
  );
}

export function ProductInlineEditTable({
  brandOptions,
  categoryOptions,
  labels,
  locale,
  pagination,
  rows,
  subCategoryOptions,
  tableLabels,
}: {
  brandOptions: ProductEditorOption[];
  categoryOptions: ProductEditorOption[];
  labels: ProductLabels;
  locale: "th" | "en";
  pagination: ProductTablePaginationData;
  rows: ProductManagementRow[];
  subCategoryOptions: ProductEditorOption[];
  tableLabels: ProductTableLabels;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [hasInlineValidationAttempted, setHasInlineValidationAttempted] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, ProductInlineEditDraft>>({});
  const [uploadingDatasheetBySku, setUploadingDatasheetBySku] = useState<
    Record<string, boolean>
  >({});
  const [uploadingMediaBySku, setUploadingMediaBySku] = useState<
    Record<string, boolean>
  >({});

  const changedRows = rows.filter((row) => {
    const draft = drafts[row.sku];

    return draft ? hasInlineDraftChanged(row, draft) : false;
  });
  const dirtyCount = changedRows.length;
  const tablePagination = useMemo<AdminDataTablePagination>(
    () => ({
      ...pagination,
      getPageHref: (page) => {
        const nextSearchParams = new URLSearchParams(searchParams.toString());

        nextSearchParams.set("page", String(page));
        nextSearchParams.set("section", "products-services");

        return `${pathname}?${nextSearchParams.toString()}`;
      },
    }),
    [pagination, pathname, searchParams],
  );

  useEffect(() => {
    function handleInlineEditRequest() {
      setIsEditMode(true);
      setSaveError("");
      setHasInlineValidationAttempted(false);
    }

    window.addEventListener(
      PRODUCT_INLINE_EDIT_REQUEST_EVENT,
      handleInlineEditRequest,
    );

    return () => {
      window.removeEventListener(
        PRODUCT_INLINE_EDIT_REQUEST_EVENT,
        handleInlineEditRequest,
      );
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(PRODUCT_INLINE_EDIT_STATE_EVENT, {
        detail: { isEditMode },
      }),
    );
  }, [isEditMode]);

  const updateDraft = useCallback(
    (
      row: ProductManagementRow,
      updater: (current: ProductInlineEditDraft) => ProductInlineEditDraft,
    ) => {
      setDrafts((current) => {
        const nextDraft = updater(current[row.sku] ?? createInlineDraft(row));

        return {
          ...current,
          [row.sku]: nextDraft,
        };
      });
    },
    [],
  );

  const isInlineFieldInvalid = useCallback(
    (row: ProductManagementRow, fieldKey: InlineRequiredFieldKey) => {
      if (!hasInlineValidationAttempted) {
        return false;
      }

      const draft = drafts[row.sku] ?? createInlineDraft(row);

      return !draft[fieldKey].trim();
    },
    [drafts, hasInlineValidationAttempted],
  );

  const isInlineDiscountedPriceInvalid = useCallback(
    (row: ProductManagementRow) => {
      if (!hasInlineValidationAttempted) {
        return false;
      }

      const draft = drafts[row.sku] ?? createInlineDraft(row);

      return draft.isPromotion && !draft.discountedPrice.trim();
    },
    [drafts, hasInlineValidationAttempted],
  );

  async function handleSaveAll() {
    if (dirtyCount === 0) {
      setIsEditMode(false);
      setDrafts({});
      setSaveError("");
      setHasInlineValidationAttempted(false);
      return;
    }

    setHasInlineValidationAttempted(true);

    const invalidDrafts = changedRows
      .map((row) => {
        const draft = drafts[row.sku] ?? createInlineDraft(row);
        const missingFields = getInlineRequiredFieldLabels(draft, labels);

        if (draft.isPromotion && !draft.discountedPrice.trim()) {
          missingFields.push(labels.fields.discountedPrice);
        }

        return missingFields.length > 0 ? { missingFields, row } : null;
      })
      .filter(
        (
          item,
        ): item is { missingFields: string[]; row: ProductManagementRow } => Boolean(item),
      );

    if (invalidDrafts.length > 0) {
      setSaveError("");
      return;
    }

    setIsSavingAll(true);
    setSaveError("");

    try {
      const responses = await Promise.all(
        changedRows.map((row) =>
          fetch(`/api/admin/products/${encodeURIComponent(row.sku)}`, {
            method: "PATCH",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(
              buildInlineProductPayload(row, drafts[row.sku] ?? createInlineDraft(row)),
            ),
          }),
        ),
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error("inline-edit-save-failed");
      }

      setIsEditMode(false);
      setDrafts({});
      setHasInlineValidationAttempted(false);
      router.refresh();
    } catch {
      setSaveError(labels.error);
    } finally {
      setIsSavingAll(false);
    }
  }

  const handleInlineMediaSelected = useCallback(
    async (row: ProductManagementRow, files: FileList | null) => {
      if (!files?.length) {
        return;
      }

      setSaveError("");
      setUploadingMediaBySku((current) => ({
        ...current,
        [row.sku]: true,
      }));

      try {
        const uploadedUrls: string[] = [];

        for (const file of Array.from(files)) {
          uploadedUrls.push(
            await uploadAdminProductFile(file, "products/media", labels.uploadError),
          );
        }

        updateDraft(row, (current) => {
          const nextUrls = [
            ...parseInlineList(current.imgUrlText),
            ...uploadedUrls,
          ];

          return {
            ...current,
            imgUrlText: nextUrls.join("\n"),
          };
        });
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : labels.uploadError);
      } finally {
        setUploadingMediaBySku((current) => ({
          ...current,
          [row.sku]: false,
        }));
      }
    },
    [labels.uploadError, updateDraft],
  );

  const handleInlineDatasheetSelected = useCallback(
    async (row: ProductManagementRow, files: FileList | null) => {
      const file = files?.[0];

      if (!file) {
        return;
      }

      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setSaveError(labels.uploadError);
        return;
      }

      setSaveError("");
      setUploadingDatasheetBySku((current) => ({
        ...current,
        [row.sku]: true,
      }));

      try {
        const url = await uploadAdminProductFile(
          file,
          "products/datasheets",
          labels.uploadError,
        );

        updateDraft(row, (current) => ({
          ...current,
          datasheetUrl: url,
        }));
      } catch (error) {
        setSaveError(error instanceof Error ? error.message : labels.uploadError);
      } finally {
        setUploadingDatasheetBySku((current) => ({
          ...current,
          [row.sku]: false,
        }));
      }
    },
    [labels.uploadError, updateDraft],
  );

  const columns = useMemo<AdminDataTableColumn<ProductManagementRow>[]>(() => {
    const actionsColumn: AdminDataTableColumn<ProductManagementRow> = {
      key: "actions",
      header: tableLabels.columns.actions,
      className: "admin-table-actions-column",
      width: "96px",
      render: (row) => (
        <ProductRowManagementActions
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          labels={labels}
          locale={locale}
          product={row}
          subCategoryOptions={subCategoryOptions}
        />
      ),
    };

    const flagsColumn: AdminDataTableColumn<ProductManagementRow> = {
      key: "flags",
      header: tableLabels.columns.flags,
      className: "admin-table-flags-column",
      width: "160px",
      render: (row) =>
        isEditMode ? (
          <div className="admin-inline-flag-editor">
            <InlineTableCheckbox
              checked={(drafts[row.sku] ?? createInlineDraft(row)).isNewProduct}
              label={tableLabels.newProduct}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  isNewProduct: event.target.checked,
                }))
              }
            />
            <InlineTableCheckbox
              checked={(drafts[row.sku] ?? createInlineDraft(row)).isBestSeller}
              label={tableLabels.bestSeller}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  isBestSeller: event.target.checked,
                }))
              }
            />
            <InlineTableCheckbox
              checked={(drafts[row.sku] ?? createInlineDraft(row)).isPromotion}
              label={tableLabels.promotion}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  discountedPrice: event.target.checked
                    ? current.discountedPrice
                    : "",
                  isPromotion: event.target.checked,
                }))
              }
            />
          </div>
        ) : (
          <InlineProductFlags
            bestSellerLabel={tableLabels.bestSeller}
            noFlagsLabel={tableLabels.noFlags}
            newProductLabel={tableLabels.newProduct}
            product={row}
            promotionLabel={tableLabels.promotion}
          />
        ),
    };

    return [
      {
        key: "image",
        header: tableLabels.columns.image,
        className: "admin-table-image-column",
        width: "118px",
        render: (row) => {
          if (!isEditMode) {
            return (
              <ProductTableImage
                alt={locale === "th" ? row.nameTh : row.nameEn}
                fallback={labels.noImage}
                src={row.imgUrl[0]}
              />
            );
          }

          const draft = drafts[row.sku] ?? createInlineDraft(row);

          return (
            <InlineTableMediaEditor
              files={parseInlineList(draft.imgUrlText)}
              isUploading={uploadingMediaBySku[row.sku] ?? false}
              label={labels.fields.imgUrl}
              labels={labels}
              onFilesSelected={(files) => void handleInlineMediaSelected(row, files)}
              onRemove={(targetUrl) =>
                updateDraft(row, (current) => ({
                  ...current,
                  imgUrlText: parseInlineList(current.imgUrlText)
                    .filter((url) => url !== targetUrl)
                    .join("\n"),
                }))
              }
            />
          );
        },
      },
      {
        key: "sku",
        header: tableLabels.columns.sku,
        className: isEditMode
          ? "admin-table-code-column admin-table-code-column-edit"
          : "admin-table-code-column",
        width: isEditMode ? "200px" : "138px",
        render: (row) => <InlineTableText value={row.sku} strong />,
      },
      {
        key: "slug",
        header: tableLabels.columns.slug,
        className: "admin-table-slug-column",
        width: "220px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              invalid={isInlineFieldInvalid(row, "slug")}
              errorMessage={
                isInlineFieldInvalid(row, "slug")
                  ? getInlineRequiredFieldErrorMessage("slug", labels, locale)
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).slug}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  slug: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableTooltipText value={row.slug} />
          ),
      },
      {
        key: "rank",
        header: tableLabels.columns.rank,
        className: isEditMode
          ? "admin-table-rank-column admin-table-rank-column-edit"
          : "admin-table-rank-column",
        width: isEditMode ? "100px" : "88px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              type="number"
              value={(drafts[row.sku] ?? createInlineDraft(row)).rank}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  rank: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableText value={String(row.rank)} />
          ),
      },
      {
        key: "nameTh",
        header: tableLabels.columns.nameTh,
        className: "admin-table-name-column",
        width: "240px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              invalid={isInlineFieldInvalid(row, "nameTh")}
              errorMessage={
                isInlineFieldInvalid(row, "nameTh")
                  ? getInlineRequiredFieldErrorMessage("nameTh", labels, locale)
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).nameTh}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  nameTh: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableTooltipText value={row.nameTh} />
          ),
      },
      {
        key: "nameEn",
        header: tableLabels.columns.nameEn,
        className: "admin-table-name-column",
        width: "250px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              invalid={isInlineFieldInvalid(row, "nameEn")}
              errorMessage={
                isInlineFieldInvalid(row, "nameEn")
                  ? getInlineRequiredFieldErrorMessage("nameEn", labels, locale)
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).nameEn}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  nameEn: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableTooltipText value={row.nameEn} />
          ),
      },
      {
        key: "shortDescriptionTh",
        header: tableLabels.columns.shortDescriptionTh,
        className: "admin-table-short-description-column",
        width: "220px",
        render: (row) =>
          isEditMode ? (
            <InlineTableTextArea
              invalid={isInlineFieldInvalid(row, "shortDescriptionTh")}
              errorMessage={
                isInlineFieldInvalid(row, "shortDescriptionTh")
                  ? getInlineRequiredFieldErrorMessage(
                      "shortDescriptionTh",
                      labels,
                      locale,
                    )
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).shortDescriptionTh}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  shortDescriptionTh: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={row.shortDescriptionTh} />
          ),
      },
      {
        key: "shortDescriptionEn",
        header: tableLabels.columns.shortDescriptionEn,
        className: "admin-table-short-description-column",
        width: "220px",
        render: (row) =>
          isEditMode ? (
            <InlineTableTextArea
              invalid={isInlineFieldInvalid(row, "shortDescriptionEn")}
              errorMessage={
                isInlineFieldInvalid(row, "shortDescriptionEn")
                  ? getInlineRequiredFieldErrorMessage(
                      "shortDescriptionEn",
                      labels,
                      locale,
                    )
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).shortDescriptionEn}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  shortDescriptionEn: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={row.shortDescriptionEn} />
          ),
      },
      {
        key: "descriptionTh",
        header: tableLabels.columns.descriptionTh,
        className: isEditMode
          ? "admin-table-short-description-column admin-table-short-description-column-edit"
          : "admin-table-short-description-column",
        width: isEditMode ? "800px" : "220px",
        render: (row) =>
          isEditMode ? (
            <InlineTableRichTextEditor
              label={labels.fields.descriptionTh}
              value={(drafts[row.sku] ?? createInlineDraft(row)).descriptionTh}
              onChange={(value) =>
                updateDraft(row, (current) => ({
                  ...current,
                  descriptionTh: value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={stripHtml(row.descriptionTh)} />
          ),
      },
      {
        key: "descriptionEn",
        header: tableLabels.columns.descriptionEn,
        className: isEditMode
          ? "admin-table-short-description-column admin-table-short-description-column-edit"
          : "admin-table-short-description-column",
        width: isEditMode ? "800px" : "220px",
        render: (row) =>
          isEditMode ? (
            <InlineTableRichTextEditor
              label={labels.fields.descriptionEn}
              value={(drafts[row.sku] ?? createInlineDraft(row)).descriptionEn}
              onChange={(value) =>
                updateDraft(row, (current) => ({
                  ...current,
                  descriptionEn: value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={stripHtml(row.descriptionEn)} />
          ),
      },
      {
        key: "model",
        header: tableLabels.columns.model,
        className: "admin-table-model-column",
        width: "130px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              value={(drafts[row.sku] ?? createInlineDraft(row)).model}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  model: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableText value={row.model ?? tableLabels.noModel} />
          ),
      },
      flagsColumn,
      {
        key: "price",
        header: tableLabels.columns.price,
        className: "admin-table-price-column",
        width: "132px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              type="number"
              value={(drafts[row.sku] ?? createInlineDraft(row)).price}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  price: event.target.value,
                }))
              }
            />
          ) : (
            formatInlinePrice(row.price, locale, tableLabels.noPrice)
          ),
      },
      {
        key: "discountedPrice",
        header: tableLabels.columns.discountedPrice,
        className: "admin-table-price-column",
        width: "156px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              disabled={!(drafts[row.sku] ?? createInlineDraft(row)).isPromotion}
              invalid={isInlineDiscountedPriceInvalid(row)}
              errorMessage={
                isInlineDiscountedPriceInvalid(row)
                  ? getInlineFieldErrorMessage(labels.fields.discountedPrice, locale)
                  : ""
              }
              type="number"
              value={(drafts[row.sku] ?? createInlineDraft(row)).discountedPrice}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  discountedPrice: event.target.value,
                }))
              }
            />
          ) : (
            formatInlinePrice(row.discountedPrice, locale, tableLabels.noPrice)
          ),
      },
      {
        key: "deliveryFee",
        header: tableLabels.columns.deliveryFee,
        className: "admin-table-price-column",
        width: "132px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              type="number"
              value={(drafts[row.sku] ?? createInlineDraft(row)).deliveryFee}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  deliveryFee: event.target.value,
                }))
              }
            />
          ) : (
            formatInlinePrice(row.deliveryFee, locale, tableLabels.noPrice)
          ),
      },
      {
        key: "datasheetUrl",
        header: tableLabels.columns.datasheetUrl,
        className: "admin-table-content-type-column",
        width: "160px",
        render: (row) =>
          isEditMode ? (
            <InlineTableDatasheetEditor
              isUploading={uploadingDatasheetBySku[row.sku] ?? false}
              labels={labels}
              url={(drafts[row.sku] ?? createInlineDraft(row)).datasheetUrl}
              onFilesSelected={(files) => void handleInlineDatasheetSelected(row, files)}
              onRemove={() =>
                updateDraft(row, (current) => ({
                  ...current,
                  datasheetUrl: "",
                }))
              }
            />
          ) : (
            <InlineTableLink
              href={row.datasheetUrl}
              label={row.datasheetUrl ? "Open PDF" : labels.noDatasheet}
              mutedLabel={labels.noDatasheet}
            />
          ),
      },
      {
        key: "category",
        header: tableLabels.columns.category,
        className: isEditMode
          ? "admin-table-relations-column admin-table-relations-column-edit"
          : "admin-table-relations-column",
        width: isEditMode ? "500px" : "220px",
        render: (row) =>
          isEditMode ? (
            <InlineTableMultiSelectField
              getOptionLabel={(option) => (locale === "th" ? option.nameTh : option.nameEn)}
              label={tableLabels.columns.category}
              noResultsLabel={labels.noSuggestions}
              onChange={(values) =>
                updateDraft(row, (current) => {
                  const nextSubCategoryOptions = subCategoryOptions.filter((option) =>
                    values.includes(option.parentCode ?? ""),
                  );

                  return {
                    ...current,
                    categoryCodesText: values.join(", "),
                    subCategoryCodesText: parseInlineList(current.subCategoryCodesText)
                      .filter((code) =>
                        nextSubCategoryOptions.some((option) => option.code === code),
                      )
                      .join(", "),
                  };
                })
              }
              options={categoryOptions}
              searchPlaceholder={labels.search}
              selectedValues={parseInlineList(
                (drafts[row.sku] ?? createInlineDraft(row)).categoryCodesText,
              )}
            />
          ) : (
            <InlineProductRelationList
              locale={locale}
              noRelationsLabel={tableLabels.noRelations}
              relations={row.categories ?? row.categoryCods ?? []}
            />
          ),
      },
      {
        key: "subCategory",
        header: tableLabels.columns.subCategory,
        className: isEditMode
          ? "admin-table-sub-category-column admin-table-sub-category-column-edit"
          : "admin-table-sub-category-column",
        width: isEditMode ? "500px" : "230px",
        render: (row) =>
          isEditMode ? (
            <InlineTableMultiSelectField
              disabled={
                parseInlineList((drafts[row.sku] ?? createInlineDraft(row)).categoryCodesText)
                  .length === 0
              }
              getOptionLabel={(option) => (locale === "th" ? option.nameTh : option.nameEn)}
              label={tableLabels.columns.subCategory}
              noResultsLabel={labels.noSuggestions}
              onChange={(values) =>
                updateDraft(row, (current) => ({
                  ...current,
                  subCategoryCodesText: values.join(", "),
                }))
              }
              options={subCategoryOptions.filter((option) =>
                parseInlineList((drafts[row.sku] ?? createInlineDraft(row)).categoryCodesText).includes(
                  option.parentCode ?? "",
                ),
              )}
              searchPlaceholder={labels.search}
              selectedValues={parseInlineList(
                (drafts[row.sku] ?? createInlineDraft(row)).subCategoryCodesText,
              )}
            />
          ) : (
            <InlineProductRelationList
              locale={locale}
              noRelationsLabel={tableLabels.noRelations}
              relations={row.subCategories}
            />
          ),
      },
      {
        key: "brands",
        header: tableLabels.columns.brands,
        className: isEditMode
          ? "admin-table-brands-column admin-table-brands-column-edit"
          : "admin-table-brands-column",
        width: isEditMode ? "500px" : "190px",
        render: (row) =>
          isEditMode ? (
            <InlineTableMultiSelectField
              getOptionLabel={(option) => (locale === "th" ? option.nameTh : option.nameEn)}
              label={tableLabels.columns.brands}
              noResultsLabel={labels.noSuggestions}
              onChange={(values) =>
                updateDraft(row, (current) => ({
                  ...current,
                  brandCodesText: values.join(", "),
                }))
              }
              options={brandOptions}
              searchPlaceholder={labels.search}
              selectedValues={parseInlineList(
                (drafts[row.sku] ?? createInlineDraft(row)).brandCodesText,
              )}
            />
          ) : (
            <InlineProductRelationList
              locale={locale}
              noRelationsLabel={tableLabels.noRelations}
              relations={row.brands}
            />
          ),
      },
      {
        key: "googleCategoryId",
        header: tableLabels.columns.googleCategoryId,
        className: isEditMode
          ? "admin-table-number-column admin-table-number-column-edit"
          : "admin-table-number-column",
        width: isEditMode ? "500px" : "140px",
        render: (row) =>
          isEditMode ? (
            <InlineTableGoogleCategoryCombobox
              emptyLabel={labels.googleCategoryEmpty}
              label={labels.fields.googleCategoryId}
              loadingLabel={labels.googleCategoryLoading}
              locale={locale}
              noResultsLabel={labels.noSuggestions}
              searchPlaceholder={labels.googleCategorySearchPlaceholder}
              value={(drafts[row.sku] ?? createInlineDraft(row)).googleCategoryId}
              onChange={(value) =>
                updateDraft(row, (current) => ({
                  ...current,
                  googleCategoryId: value,
                }))
              }
            />
          ) : (
            <InlineTableText value={row.googleCategoryId ?? "-"} />
          ),
      },
      {
        key: "seoTitleTh",
        header: tableLabels.columns.seoTitleTh,
        className: "admin-table-content-topic-column",
        width: "280px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              invalid={isInlineFieldInvalid(row, "seoTitleTh")}
              errorMessage={
                isInlineFieldInvalid(row, "seoTitleTh")
                  ? getInlineRequiredFieldErrorMessage("seoTitleTh", labels, locale)
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).seoTitleTh}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  seoTitleTh: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={row.seoTitleTh} />
          ),
      },
      {
        key: "seoTitleEn",
        header: tableLabels.columns.seoTitleEn,
        className: "admin-table-content-topic-column",
        width: "280px",
        render: (row) =>
          isEditMode ? (
            <InlineTableInput
              invalid={isInlineFieldInvalid(row, "seoTitleEn")}
              errorMessage={
                isInlineFieldInvalid(row, "seoTitleEn")
                  ? getInlineRequiredFieldErrorMessage("seoTitleEn", labels, locale)
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).seoTitleEn}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  seoTitleEn: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={row.seoTitleEn} />
          ),
      },
      {
        key: "seoDescriptionTh",
        header: tableLabels.columns.seoDescriptionTh,
        className: "admin-table-content-body-column",
        width: "320px",
        render: (row) =>
          isEditMode ? (
            <InlineTableTextArea
              invalid={isInlineFieldInvalid(row, "seoDescriptionTh")}
              errorMessage={
                isInlineFieldInvalid(row, "seoDescriptionTh")
                  ? getInlineRequiredFieldErrorMessage(
                      "seoDescriptionTh",
                      labels,
                      locale,
                    )
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).seoDescriptionTh}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  seoDescriptionTh: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={row.seoDescriptionTh} />
          ),
      },
      {
        key: "seoDescriptionEn",
        header: tableLabels.columns.seoDescriptionEn,
        className: "admin-table-content-body-column",
        width: "320px",
        render: (row) =>
          isEditMode ? (
            <InlineTableTextArea
              invalid={isInlineFieldInvalid(row, "seoDescriptionEn")}
              errorMessage={
                isInlineFieldInvalid(row, "seoDescriptionEn")
                  ? getInlineRequiredFieldErrorMessage(
                      "seoDescriptionEn",
                      labels,
                      locale,
                    )
                  : ""
              }
              value={(drafts[row.sku] ?? createInlineDraft(row)).seoDescriptionEn}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  seoDescriptionEn: event.target.value,
                }))
              }
            />
          ) : (
            <InlineTableParagraph value={row.seoDescriptionEn} />
          ),
      },
      {
        key: "status",
        header: tableLabels.columns.status,
        className: "admin-table-status-column",
        width: "126px",
        render: (row) =>
          isEditMode ? (
            <InlineTableCheckbox
              checked={(drafts[row.sku] ?? createInlineDraft(row)).isActive}
              label={tableLabels.active}
              onChange={(event) =>
                updateDraft(row, (current) => ({
                  ...current,
                  isActive: event.target.checked,
                }))
              }
            />
          ) : (
            <AdminStatusBadge
              label={row.isActive ? tableLabels.active : tableLabels.inactive}
              tone={row.isActive ? "active" : "inactive"}
            />
          ),
      },
      {
        key: "createdBy",
        header: tableLabels.columns.createdBy,
        className: "admin-table-user-column",
        width: "170px",
        render: (row) => <InlineTableText value={row.createdBy} />,
      },
      {
        key: "createdAt",
        header: tableLabels.columns.createdAt,
        className: "admin-table-date-column",
        width: "190px",
        render: (row) => formatInlineDateTime(row.createdAt, locale),
      },
      {
        key: "updatedBy",
        header: tableLabels.columns.updatedBy,
        className: "admin-table-user-column",
        width: "170px",
        render: (row) => <InlineTableText value={row.updatedBy} />,
      },
      {
        key: "updatedAt",
        header: tableLabels.columns.updatedAt,
        className: "admin-table-date-column",
        width: "190px",
        render: (row) => formatInlineDateTime(row.updatedAt, locale),
      },
      {
        key: "deletedBy",
        header: tableLabels.columns.deletedBy,
        className: "admin-table-user-column",
        width: "170px",
        render: (row) => <InlineTableText value={row.deletedBy ?? "-"} />,
      },
      {
        key: "deletedAt",
        header: tableLabels.columns.deletedAt,
        className: "admin-table-date-column",
        width: "190px",
        render: (row) =>
          row.deletedAt ? (
            formatInlineDateTime(row.deletedAt, locale)
          ) : (
            <span className="admin-table-muted">-</span>
          ),
      },
      ...(!isEditMode ? [actionsColumn] : []),
    ];
  }, [
    brandOptions,
    categoryOptions,
    drafts,
    isEditMode,
    labels,
    locale,
    uploadingDatasheetBySku,
    uploadingMediaBySku,
    subCategoryOptions,
    tableLabels,
    handleInlineDatasheetSelected,
    handleInlineMediaSelected,
    isInlineFieldInvalid,
    isInlineDiscountedPriceInvalid,
    updateDraft,
  ]);

  return (
    <>
      {isEditMode ? (
        <div className="admin-product-inline-toolbar">
          <div className="admin-product-inline-toolbar-actions">
            <button
              className="admin-product-add-button"
              disabled={isSavingAll}
              onClick={() => void handleSaveAll()}
              type="button"
            >
              {isSavingAll ? labels.saving : labels.save}
            </button>
            <button
              className="admin-product-secondary-button"
              disabled={isSavingAll}
              onClick={() => {
                setDrafts({});
                setSaveError("");
                setHasInlineValidationAttempted(false);
                setIsEditMode(false);
              }}
              type="button"
            >
              {labels.cancel}
            </button>
          </div>
        </div>
      ) : null}
      {saveError ? <p className="admin-product-form-error">{saveError}</p> : null}
      <AdminDataTable
        columns={columns}
        contextMenuActions={isEditMode ? undefined : getProductContextMenuActions(labels)}
        emptyLabel={tableLabels.empty}
        getRowClassName={() =>
          isEditMode ? "admin-table-row-inline-editing" : "admin-table-row-view-mode"
        }
        getRowId={(row) => row.sku}
        pagination={tablePagination}
        rows={rows}
        selectAllLabel={tableLabels.selectAll}
        selectRowLabel={(row) => `${tableLabels.selectRow} ${row.sku}`}
        showSelectionColumn={!isEditMode}
        tableId="products-services"
        wide
      />
      {!isEditMode ? (
        <ProductTableEditController
          brandOptions={brandOptions}
          categoryOptions={categoryOptions}
          labels={labels}
          locale={locale}
          rows={rows}
          subCategoryOptions={subCategoryOptions}
        />
      ) : null}
    </>
  );
}

function getProductBatchFieldConfig(
  labels: ProductLabels,
  action: ProductBatchAction,
  row: ProductManagementRow,
): AdminBatchFieldModalConfig {
  if (
    action === "isActive" ||
    action === "isBestSeller" ||
    action === "isNewProduct" ||
    action === "isPromotion"
  ) {
    return {
      fieldLabel: labels.fields[action],
      initialValue: row[action],
      options: [
        { label: "true", value: "true" },
        { label: "false", value: "false" },
      ],
      type: "boolean",
    };
  }

  if (
    action === "rank" ||
    action === "price" ||
    action === "deliveryFee" ||
    action === "discountedPrice"
  ) {
    return {
      fieldLabel: labels.fields[action],
      initialValue: row[action] ?? "",
      type: "number",
    };
  }

  if (
    action === "descriptionTh" ||
    action === "descriptionEn" ||
    action === "seoDescriptionTh" ||
    action === "seoDescriptionEn" ||
    action === "categoryCodes" ||
    action === "subCategoryCodes" ||
    action === "brandCodes"
  ) {
    return {
      fieldLabel: labels.fields[action],
      initialValue:
        action === "categoryCodes"
          ? (row.categories ?? row.categoryCods ?? []).map((item) => item.code).join(", ")
          : action === "subCategoryCodes"
            ? row.subCategories.map((item) => item.code).join(", ")
            : action === "brandCodes"
              ? row.brands.map((item) => item.code).join(", ")
              : (row[action] ?? ""),
      type: "textarea",
    };
  }

  return {
    fieldLabel: labels.fields[action],
    initialValue: String(row[action] ?? ""),
    type: "text",
  };
}

function buildProductPayload(
  row: ProductManagementRow,
  action: ProductBatchAction,
  value: boolean | number | string,
) {
  const next: Record<string, boolean | number | string | string[] | null> = {
    brandCodes: row.brands.map((brand) => brand.code),
    categoryCodes: (row.categories ?? row.categoryCods ?? []).map(
      (category) => category.code,
    ),
    datasheetUrl: row.datasheetUrl,
    deliveryFee: row.deliveryFee,
    descriptionEn: row.descriptionEn,
    descriptionTh: row.descriptionTh,
    discountedPrice: row.discountedPrice,
    googleCategoryId: row.googleCategoryId,
    imgUrl: row.imgUrl,
    isActive: row.isActive,
    isBestSeller: row.isBestSeller,
    isNewProduct: row.isNewProduct,
    isPromotion: row.isPromotion,
    model: row.model,
    nameEn: row.nameEn,
    nameTh: row.nameTh,
    price: row.price,
    rank: row.rank,
    seoDescriptionEn: row.seoDescriptionEn,
    seoDescriptionTh: row.seoDescriptionTh,
    seoTitleEn: row.seoTitleEn,
    seoTitleTh: row.seoTitleTh,
    shortDescriptionEn: row.shortDescriptionEn,
    shortDescriptionTh: row.shortDescriptionTh,
    slug: row.slug,
    subCategoryCodes: row.subCategories.map((subCategory) => subCategory.code),
  };

  if (
    action === "isActive" ||
    action === "isBestSeller" ||
    action === "isNewProduct" ||
    action === "isPromotion"
  ) {
    next[action] = Boolean(value);
  } else if (
    action === "rank" ||
    action === "price" ||
    action === "deliveryFee" ||
    action === "discountedPrice"
  ) {
    next[action] = Number(value || 0);
  } else if (
    action === "categoryCodes" ||
    action === "subCategoryCodes" ||
    action === "brandCodes"
  ) {
    next[action] = String(value)
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  } else {
    next[action] = String(value);
  }

  return next;
}

function createInlineDraft(row: ProductManagementRow): ProductInlineEditDraft {
  return {
    brandCodesText: row.brands.map((brand) => brand.code).join(", "),
    categoryCodesText: (row.categories ?? row.categoryCods ?? [])
      .map((category) => category.code)
      .join(", "),
    datasheetUrl: row.datasheetUrl ?? "",
    descriptionEn: row.descriptionEn,
    descriptionTh: row.descriptionTh,
    deliveryFee:
      row.deliveryFee === null || row.deliveryFee === undefined
        ? ""
        : String(row.deliveryFee),
    discountedPrice:
      row.discountedPrice === null || row.discountedPrice === undefined
        ? ""
        : String(row.discountedPrice),
    googleCategoryId: row.googleCategoryId ?? "",
    imgUrlText: row.imgUrl.join("\n"),
    isActive: row.isActive,
    isBestSeller: row.isBestSeller,
    isNewProduct: row.isNewProduct,
    isPromotion: row.isPromotion,
    model: row.model ?? "",
    nameEn: row.nameEn,
    nameTh: row.nameTh,
    price: row.price === null || row.price === undefined ? "" : String(row.price),
    rank: String(row.rank),
    seoDescriptionEn: row.seoDescriptionEn,
    seoDescriptionTh: row.seoDescriptionTh,
    seoTitleEn: row.seoTitleEn,
    seoTitleTh: row.seoTitleTh,
    shortDescriptionEn: row.shortDescriptionEn,
    shortDescriptionTh: row.shortDescriptionTh,
    slug: row.slug,
    subCategoryCodesText: row.subCategories.map((subCategory) => subCategory.code).join(", "),
  };
}

function hasInlineDraftChanged(
  row: ProductManagementRow,
  draft: ProductInlineEditDraft,
) {
  return JSON.stringify(createInlineDraft(row)) !== JSON.stringify(draft);
}

function buildInlineProductPayload(
  row: ProductManagementRow,
  draft: ProductInlineEditDraft,
) {
  return {
    rank: getNumberFromValue(draft.rank) ?? 0,
    nameTh: draft.nameTh.trim(),
    nameEn: draft.nameEn.trim(),
    shortDescriptionTh: draft.shortDescriptionTh.trim(),
    shortDescriptionEn: draft.shortDescriptionEn.trim(),
    descriptionTh: draft.descriptionTh,
    descriptionEn: draft.descriptionEn,
    datasheetUrl: draft.datasheetUrl.trim() || null,
    imgUrl: parseInlineList(draft.imgUrlText),
    slug: draft.slug.trim(),
    price: getNumberFromValue(draft.price),
    deliveryFee: getNumberFromValue(draft.deliveryFee),
    model: draft.model.trim() || null,
    seoTitleTh: draft.seoTitleTh.trim(),
    seoTitleEn: draft.seoTitleEn.trim(),
    seoDescriptionTh: draft.seoDescriptionTh.trim(),
    seoDescriptionEn: draft.seoDescriptionEn.trim(),
    googleCategoryId: draft.googleCategoryId.trim() || null,
    isActive: draft.isActive,
    isNewProduct: draft.isNewProduct,
    isBestSeller: draft.isBestSeller,
    isPromotion: draft.isPromotion,
    discountedPrice: draft.isPromotion
      ? getNumberFromValue(draft.discountedPrice)
      : null,
    categoryCodes: parseInlineList(draft.categoryCodesText),
    subCategoryCodes: parseInlineList(draft.subCategoryCodesText),
    brandCodes: parseInlineList(draft.brandCodesText),
  };
}

function getInlineRequiredFieldLabels(
  draft: ProductInlineEditDraft,
  labels: ProductLabels,
) {
  return INLINE_REQUIRED_FIELD_KEYS.filter((fieldKey) => !draft[fieldKey].trim()).map(
    (fieldKey) => labels.fields[fieldKey],
  );
}

function getInlineFieldErrorMessage(fieldLabel: string, locale: "th" | "en") {
  return locale === "th" ? `${fieldLabel} จำเป็นต้องกรอก` : `${fieldLabel} is required`;
}

function getInlineRequiredFieldErrorMessage(
  fieldKey: InlineRequiredFieldKey,
  labels: ProductLabels,
  locale: "th" | "en",
) {
  return getInlineFieldErrorMessage(labels.fields[fieldKey], locale);
}

function parseInlineList(value: string) {
  return value
    .split(/[\n,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

async function uploadAdminProductFile(
  file: File,
  folder: string,
  fallbackErrorMessage: string,
) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("visibility", "public");
  formData.append("folder", folder);

  const response = await fetch("/api/admin/files/upload", {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(fallbackErrorMessage);
  }

  const result = (await response.json()) as UploadedFileResponse;
  const nextUrl = result.url ?? result.signedUrl;

  if (!nextUrl) {
    throw new Error(fallbackErrorMessage);
  }

  return nextUrl;
}

function ProductUploadModal({
  labels,
  onClose,
}: {
  labels: ProductLabels;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  async function handleTemplateDownload() {
    const response = await fetch("/api/admin/products/template", {
      cache: "no-store",
    });

    if (!response.ok) {
      setError(labels.error);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "products-import-template.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }

    setError("");
    setSummary("");
    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/products/import", {
      body: formData,
      method: "POST",
    });

    setIsUploading(false);

    if (!response.ok) {
      setError(labels.error);
      return;
    }

    const result = (await response.json()) as {
      created: number;
      updated: number;
      failed: number;
    };

    setSummary(
      `Created ${result.created}, updated ${result.updated}, failed ${result.failed}`,
    );
    router.refresh();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div
        aria-labelledby="admin-product-upload-title"
        aria-modal="true"
        className="admin-product-modal admin-product-confirm-modal"
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2 id="admin-product-upload-title">{labels.upload}</h2>
          <button
            aria-label={labels.cancel}
            className="admin-product-modal-close"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-upload-body" onSubmit={handleUpload}>
          <button
            className="admin-product-secondary-button admin-inventory-template-button"
            onClick={() => void handleTemplateDownload()}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              download
            </span>
            {labels.template}
          </button>
          <div className="admin-inventory-file-picker">
            <input
              accept=".csv,.xlsx"
              className="admin-inventory-file-input"
              hidden
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              ref={fileInputRef}
              type="file"
            />
            <button
              className="admin-product-secondary-button admin-inventory-file-button"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                upload_file
              </span>
              {labels.chooseFile}
            </button>
              <span className={file ? "admin-inventory-file-name" : "admin-inventory-file-name admin-inventory-file-name-muted"}>
                {file ? file.name : labels.noFileChosen}
              </span>
            </div>
          <p className="admin-upload-helper">{labels.uploadFileHelper}</p>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          {summary ? <p className="admin-product-file-note">{summary}</p> : null}
          <div className="admin-product-modal-actions">
            <button
              className="admin-product-secondary-button"
              onClick={onClose}
              type="button"
            >
              {labels.cancel}
            </button>
            <button
              className="admin-product-add-button"
              disabled={!file || isUploading}
              type="submit"
            >
              {labels.upload}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductTableImage({
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

function InlineProductRelationList({
  locale,
  noRelationsLabel,
  relations,
}: {
  locale: "th" | "en";
  noRelationsLabel: string;
  relations: { code: string; nameEn?: string; nameTh?: string }[];
}) {
  if (relations.length === 0) {
    return <span className="admin-table-muted">{noRelationsLabel}</span>;
  }

  const value = relations
    .map((relation) =>
      locale === "th" ? relation.nameTh || relation.code : relation.nameEn || relation.code,
    )
    .join(", ");

  return <InlineTableText value={value} />;
}

function InlineProductFlags({
  bestSellerLabel,
  noFlagsLabel,
  newProductLabel,
  product,
  promotionLabel,
}: {
  bestSellerLabel: string;
  noFlagsLabel: string;
  newProductLabel: string;
  product: ProductManagementRow;
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

  return <InlineTableText value={flags.join(", ")} />;
}

function InlineTableInput({
  disabled = false,
  errorMessage = "",
  invalid = false,
  onChange,
  type = "text",
  value,
}: {
  disabled?: boolean;
  errorMessage?: string;
  invalid?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <div className="admin-inline-table-field">
      <input
        aria-invalid={invalid}
        className={`admin-inline-table-input${invalid ? " is-invalid" : ""}`}
        disabled={disabled}
        onChange={onChange}
        type={type}
        value={value}
      />
      {errorMessage ? (
        <p className="admin-inline-table-field-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function InlineTableTextArea({
  errorMessage = "",
  invalid = false,
  onChange,
  rows = 3,
  value,
}: {
  errorMessage?: string;
  invalid?: boolean;
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  value: string;
}) {
  return (
    <div className="admin-inline-table-field">
      <textarea
        aria-invalid={invalid}
        className={`admin-inline-table-textarea${invalid ? " is-invalid" : ""}`}
        onChange={onChange}
        rows={rows}
        value={value}
      />
      {errorMessage ? (
        <p className="admin-inline-table-field-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function InlineTableRichTextEditor({
  errorMessage = "",
  invalid = false,
  label,
  onChange,
  value,
}: {
  errorMessage?: string;
  invalid?: boolean;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div
      aria-invalid={invalid}
      className={`admin-inline-table-richtext${invalid ? " is-invalid" : ""}`}
    >
      <RichTextEditor label={label} onChange={onChange} value={value} />
      {errorMessage ? (
        <p className="admin-inline-table-field-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function InlineTableCheckbox({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="admin-inline-table-checkbox">
      <input checked={checked} onChange={onChange} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function InlineTableMediaEditor({
  files,
  isUploading,
  label,
  labels,
  onFilesSelected,
  onRemove,
}: {
  files: string[];
  isUploading: boolean;
  label: string;
  labels: ProductLabels;
  onFilesSelected: (files: FileList | null) => void;
  onRemove: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="admin-inline-table-media-editor">
      <input
        accept="image/*,video/mp4,video/quicktime,video/webm,video/x-m4v"
        className="admin-inventory-file-input"
        hidden
        multiple
        onChange={(event) => {
          onFilesSelected(event.target.files);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <button
        className="admin-product-secondary-button admin-inline-table-upload-button"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          upload_file
        </span>
        {isUploading ? labels.uploadingMedia : labels.uploadImage}
      </button>
      <p className="admin-upload-helper">{labels.uploadMediaHelper}</p>
      {files.length > 0 ? (
        <div className="admin-inline-table-media-grid">
          {files.map((url) => (
            <div className="admin-inline-table-media-card" key={url}>
              <div className="admin-inline-table-media-frame">
                {isVideoAssetUrl(url) ? (
                  <video
                    className="admin-upload-preview-video"
                    controls
                    playsInline
                    src={url}
                  />
                ) : (
                  <Image
                    alt={label}
                    className="admin-upload-preview-image"
                    height={160}
                    src={url}
                    unoptimized
                    width={240}
                  />
                )}
              </div>
              <div className="admin-inline-table-media-actions">
                <a
                  className="admin-upload-preview-link"
                  href={url}
                  rel="noreferrer"
                  target="_blank"
                >
                  Open file
                </a>
                <button
                  className="admin-product-secondary-button"
                  onClick={() => onRemove(url)}
                  type="button"
                >
                  {labels.delete}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-upload-empty">{labels.noMedia}</p>
      )}
    </div>
  );
}

function InlineTableDatasheetEditor({
  isUploading,
  labels,
  onFilesSelected,
  onRemove,
  url,
}: {
  isUploading: boolean;
  labels: ProductLabels;
  onFilesSelected: (files: FileList | null) => void;
  onRemove: () => void;
  url: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <div className="admin-inline-table-media-editor">
      <input
        accept="application/pdf"
        className="admin-inventory-file-input"
        hidden
        onChange={(event) => {
          onFilesSelected(event.target.files);
          event.currentTarget.value = "";
        }}
        ref={inputRef}
        type="file"
      />
      <button
        className="admin-product-secondary-button admin-inline-table-upload-button"
        onClick={() => inputRef.current?.click()}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          upload_file
        </span>
        {isUploading ? labels.uploadingDatasheet : labels.uploadDatasheet}
      </button>
      <p className="admin-upload-helper">{labels.uploadDatasheetHelper}</p>
      {url ? (
        <div className="admin-inline-table-media-card">
          <div className="admin-inline-table-media-frame">
            <span
              aria-hidden="true"
              className="material-symbols-outlined admin-inline-table-pdf-icon"
            >
              picture_as_pdf
            </span>
          </div>
          <div className="admin-inline-table-media-actions">
            <a
              className="admin-upload-preview-link"
              href={url}
              rel="noreferrer"
              target="_blank"
            >
              Open PDF
            </a>
            <button
              className="admin-product-secondary-button"
              onClick={onRemove}
              type="button"
            >
              {labels.delete}
            </button>
          </div>
        </div>
      ) : (
        <p className="admin-upload-empty">{labels.noDatasheet}</p>
      )}
    </div>
  );
}

function InlineTableMultiSelectField({
  disabled = false,
  getOptionLabel,
  errorMessage = "",
  label,
  noResultsLabel,
  onChange,
  options,
  searchPlaceholder,
  selectedValues,
}: {
  disabled?: boolean;
  getOptionLabel: (option: ProductEditorOption) => string;
  errorMessage?: string;
  label: string;
  noResultsLabel: string;
  onChange: (values: string[]) => void;
  options: ProductEditorOption[];
  searchPlaceholder: string;
  selectedValues: string[];
}) {
  return (
    <div className="admin-inline-table-combobox">
      <MultiSelectField
        disabled={disabled}
        getOptionLabel={getOptionLabel}
        label={label}
        noResultsLabel={noResultsLabel}
        onChange={onChange}
        options={options}
        searchPlaceholder={searchPlaceholder}
        selectedValues={selectedValues}
      />
      {errorMessage ? (
        <p className="admin-inline-table-field-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function InlineTableGoogleCategoryCombobox({
  emptyLabel,
  errorMessage = "",
  label,
  loadingLabel,
  locale,
  noResultsLabel,
  onChange,
  searchPlaceholder,
  value,
}: {
  emptyLabel: string;
  errorMessage?: string;
  label: string;
  loadingLabel: string;
  locale: "th" | "en";
  noResultsLabel: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  value: string;
}) {
  return (
    <div className="admin-inline-table-combobox">
      <GoogleCategoryCombobox
        emptyLabel={emptyLabel}
        label={label}
        loadingLabel={loadingLabel}
        locale={locale}
        noResultsLabel={noResultsLabel}
        onChange={onChange}
        searchPlaceholder={searchPlaceholder}
        value={value}
      />
      {errorMessage ? (
        <p className="admin-inline-table-field-error">{errorMessage}</p>
      ) : null}
    </div>
  );
}

function InlineTableParagraph({ value }: { value: string }) {
  const trimmed = value.trim();

  if (!trimmed) {
    return <span className="admin-table-muted">-</span>;
  }

  return <InlineTableTooltipText value={trimmed} />;
}

function InlineTableText({
  strong = false,
  value,
}: {
  strong?: boolean;
  value: string;
}) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "-") {
    return <span className="admin-table-muted">-</span>;
  }

  if (strong) {
    return <strong className="admin-inline-table-ellipsis">{trimmed}</strong>;
  }

  return <span className="admin-inline-table-ellipsis">{trimmed}</span>;
}

function InlineTableLink({
  href,
  label,
  mutedLabel,
}: {
  href: string | null;
  label: string;
  mutedLabel: string;
}) {
  if (!href) {
    return <span className="admin-table-muted">{mutedLabel}</span>;
  }

  return (
    <a
      className="admin-inline-table-link"
      href={href}
      rel="noreferrer"
      target="_blank"
    >
      {label}
    </a>
  );
}

function InlineTableTooltipText({
  strong = false,
  value,
}: {
  strong?: boolean;
  value: string;
}) {
  const trimmed = value.trim();

  if (!trimmed || trimmed === "-") {
    return <span className="admin-table-muted">-</span>;
  }

  if (strong) {
    return (
      <InlineHoverTooltip text={trimmed}>
        <strong className="admin-inline-table-ellipsis">{trimmed}</strong>
      </InlineHoverTooltip>
    );
  }

  return (
    <InlineHoverTooltip text={trimmed}>
      <span className="admin-inline-table-ellipsis">{trimmed}</span>
    </InlineHoverTooltip>
  );
}

function InlineHoverTooltip({
  children,
  text,
}: {
  children: ReactNode;
  text: string;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const anchorRef = useRef<HTMLSpanElement | null>(null);
  const popupRef = useRef<HTMLSpanElement | null>(null);

  function isAnchorContentTruncated(element: HTMLSpanElement) {
    const contentElement = element.firstElementChild as HTMLElement | null;
    const target = contentElement ?? element;

    return (
      target.scrollWidth > target.clientWidth + 1 ||
      target.scrollHeight > target.clientHeight + 1
    );
  }

  function updatePosition(element: HTMLSpanElement) {
    const rect = element.getBoundingClientRect();

    setPosition({
      left: rect.left,
      top: rect.top + 4,
    });
  }

  function showTooltip(event: ReactMouseEvent<HTMLSpanElement>) {
    if (!isAnchorContentTruncated(event.currentTarget)) {
      setIsVisible(false);
      return;
    }

    updatePosition(event.currentTarget);
    setIsVisible(true);
  }

  return (
    <>
      <span
        ref={anchorRef}
        className="admin-inline-table-tooltip-anchor"
        onBlur={(event) => {
          if (popupRef.current?.contains(event.relatedTarget as Node)) {
            return;
          }

          setIsVisible(false);
        }}
        onFocus={(event) => {
          if (!isAnchorContentTruncated(event.currentTarget)) {
            setIsVisible(false);
            return;
          }

          updatePosition(event.currentTarget);
          setIsVisible(true);
        }}
        onMouseEnter={showTooltip}
        onMouseLeave={(event) => {
          if (popupRef.current?.contains(event.relatedTarget as Node)) {
            return;
          }

          setIsVisible(false);
        }}
        tabIndex={0}
      >
        {children}
      </span>
      {isVisible ? (
        <span
          className="admin-inline-table-tooltip-popup"
          ref={popupRef}
          onMouseLeave={(event) => {
            if (anchorRef.current?.contains(event.relatedTarget as Node)) {
              return;
            }

            setIsVisible(false);
          }}
          style={{
            left: `${position.left}px`,
            top: `${position.top}px`,
          }}
        >
          {text}
        </span>
      ) : null}
    </>
  );
}

function formatInlinePrice(
  value: number | null,
  locale: "th" | "en",
  fallback: string,
) {
  if (value === null) {
    return fallback;
  }

  return new Intl.NumberFormat(locale === "th" ? "th-TH" : "en-US", {
    currency: "THB",
    style: "currency",
  }).format(value);
}

function formatInlineDateTime(value: string, locale: "th" | "en") {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ProductFormModal({
  brandOptions,
  categoryOptions,
  labels,
  locale,
  mode,
  onClose,
  product,
  subCategoryOptions,
}: {
  brandOptions: ProductEditorOption[];
  categoryOptions: ProductEditorOption[];
  labels: ProductLabels;
  locale: "th" | "en";
  mode: "add" | "edit";
  onClose: () => void;
  product?: ProductManagementRow;
  subCategoryOptions: ProductEditorOption[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingDatasheet, setIsUploadingDatasheet] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const datasheetInputRef = useRef<HTMLInputElement | null>(null);
  const mediaInputRef = useRef<HTMLInputElement | null>(null);
  const [form, setForm] = useState<ProductFormValue>(() =>
    getInitialFormValue(product),
  );
  const availableSubCategoryOptions = useMemo(
    () =>
      form.categoryCodes.length > 0
        ? subCategoryOptions.filter((option) =>
            form.categoryCodes.includes(option.parentCode ?? ""),
          )
        : [],
    [form.categoryCodes, subCategoryOptions],
  );

  async function uploadFile({
    file,
    folder,
  }: {
    file: File;
    folder: string;
  }) {
    return uploadAdminProductFile(file, folder, labels.uploadError);
  }

  async function handleDatasheetSelected(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    if (file.type !== "application/pdf") {
      setError(labels.uploadError);
      return;
    }

    setError("");
    setIsUploadingDatasheet(true);

    try {
      const url = await uploadFile({ file, folder: "products/datasheets" });
      setForm((current) => ({ ...current, datasheetUrl: url }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : labels.uploadError,
      );
    } finally {
      setIsUploadingDatasheet(false);
      if (datasheetInputRef.current) {
        datasheetInputRef.current.value = "";
      }
    }
  }

  async function handleMediaSelected(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setError("");
    setIsUploadingMedia(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        uploadedUrls.push(
          await uploadFile({ file, folder: "products/media" }),
        );
      }

      setForm((current) => ({
        ...current,
        imgUrl: [...current.imgUrl, ...uploadedUrls],
      }));
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : labels.uploadError,
      );
    } finally {
      setIsUploadingMedia(false);
      if (mediaInputRef.current) {
        mediaInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    const payload = getProductPayload(form);
    const response = await fetch(
      product ? `/api/admin/products/${encodeURIComponent(product.sku)}` : "/api/admin/products",
      {
        body: JSON.stringify(payload),
        headers: { "content-type": "application/json" },
        method: product ? "PATCH" : "POST",
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.error);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div
        aria-labelledby="admin-product-form-title"
        aria-modal="true"
        className="admin-product-modal"
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2 id="admin-product-form-title">
            {mode === "add" ? labels.addTitle : labels.editTitle}
          </h2>
          <button
            aria-label={labels.cancel}
            className="admin-product-modal-close"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <ProductFormFields
            availableSubCategoryOptions={availableSubCategoryOptions}
            brandOptions={brandOptions}
            categoryOptions={categoryOptions}
            datasheetInputRef={datasheetInputRef}
            form={form}
            isUploadingDatasheet={isUploadingDatasheet}
            isUploadingMedia={isUploadingMedia}
            labels={labels}
            locale={locale}
            mediaInputRef={mediaInputRef}
            onChange={setForm}
            onDatasheetSelected={handleDatasheetSelected}
            onMediaSelected={handleMediaSelected}
            subCategoryOptions={subCategoryOptions}
          />
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button
              className="admin-product-secondary-button"
              onClick={onClose}
              type="button"
            >
              {labels.cancel}
            </button>
            <button
              className="admin-product-add-button"
              disabled={isSaving || isUploadingDatasheet || isUploadingMedia}
              type="submit"
            >
              {isSaving ? labels.saving : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductFormFields({
  availableSubCategoryOptions,
  brandOptions,
  categoryOptions,
  datasheetInputRef,
  form,
  isUploadingDatasheet,
  isUploadingMedia,
  labels,
  locale,
  mediaInputRef,
  onChange,
  onDatasheetSelected,
  onMediaSelected,
  subCategoryOptions,
}: {
  availableSubCategoryOptions: ProductEditorOption[];
  brandOptions: ProductEditorOption[];
  categoryOptions: ProductEditorOption[];
  datasheetInputRef: RefObject<HTMLInputElement | null>;
  form: ProductFormValue;
  isUploadingDatasheet: boolean;
  isUploadingMedia: boolean;
  labels: ProductLabels;
  locale: "th" | "en";
  mediaInputRef: RefObject<HTMLInputElement | null>;
  onChange: (
    updater: ProductFormValue | ((current: ProductFormValue) => ProductFormValue),
  ) => void;
  onDatasheetSelected: (files: FileList | null) => Promise<void>;
  onMediaSelected: (files: FileList | null) => Promise<void>;
  subCategoryOptions: ProductEditorOption[];
}) {
  const localeName = (option: ProductEditorOption) =>
    locale === "th" ? option.nameTh : option.nameEn;

  return (
    <div className="admin-product-form-grid">
      <ControlledTextField label={labels.fields.rank} value={form.rank} type="number" onChange={(value) => onChange((current) => ({ ...current, rank: value }))} />
      <ControlledTextField label={labels.fields.slug} required value={form.slug} onChange={(value) => onChange((current) => ({ ...current, slug: value }))} />
      <ControlledTextField label={labels.fields.nameTh} required value={form.nameTh} onChange={(value) => onChange((current) => ({ ...current, nameTh: value }))} />
      <ControlledTextField label={labels.fields.nameEn} required value={form.nameEn} onChange={(value) => onChange((current) => ({ ...current, nameEn: value }))} />
      <ControlledTextField label={labels.fields.model} value={form.model} onChange={(value) => onChange((current) => ({ ...current, model: value }))} />
      <ControlledTextField label={labels.fields.price} value={form.price} type="number" onChange={(value) => onChange((current) => ({ ...current, price: value }))} />
      <ControlledTextField label={labels.fields.deliveryFee} value={form.deliveryFee} type="number" onChange={(value) => onChange((current) => ({ ...current, deliveryFee: value }))} />
      <ControlledTextField
        disabled={!form.isPromotion}
        label={labels.fields.discountedPrice}
        required={form.isPromotion}
        type="number"
        value={form.discountedPrice}
        onChange={(value) => onChange((current) => ({ ...current, discountedPrice: value }))}
      />
      <DatasheetUploader
        fileInputRef={datasheetInputRef}
        isUploading={isUploadingDatasheet}
        label={labels.fields.datasheetUrl}
        labels={labels}
        onClear={() => onChange((current) => ({ ...current, datasheetUrl: "" }))}
        onFilesSelected={onDatasheetSelected}
        url={form.datasheetUrl}
      />
      <MediaUploader
        fileInputRef={mediaInputRef}
        files={form.imgUrl}
        isUploading={isUploadingMedia}
        label={labels.fields.imgUrl}
        labels={labels}
        onFilesSelected={onMediaSelected}
        onRemove={(targetUrl) =>
          onChange((current) => ({
            ...current,
            imgUrl: current.imgUrl.filter((url) => url !== targetUrl),
          }))
        }
      />
      <GoogleCategoryCombobox
        emptyLabel={labels.googleCategoryEmpty}
        label={labels.fields.googleCategoryId}
        loadingLabel={labels.googleCategoryLoading}
        locale={locale}
        noResultsLabel={labels.noSuggestions}
        searchPlaceholder={labels.googleCategorySearchPlaceholder}
        value={form.googleCategoryId}
        onChange={(value) =>
          onChange((current) => ({ ...current, googleCategoryId: value }))
        }
      />
      <MultiSelectField
        label={labels.fields.categoryCodes}
        options={categoryOptions}
        selectedValues={form.categoryCodes}
        getOptionLabel={localeName}
        noResultsLabel={labels.noSuggestions}
        searchPlaceholder={labels.search}
        onChange={(values) => {
          const nextSubCategoryOptions = subCategoryOptions.filter((option) =>
            values.includes(option.parentCode ?? ""),
          );

          onChange((current) => ({
            ...current,
            categoryCodes: values,
            subCategoryCodes: current.subCategoryCodes.filter((code) =>
              nextSubCategoryOptions.some((option) => option.code === code),
            ),
          }));
        }}
      />
      <MultiSelectField
        disabled={form.categoryCodes.length === 0}
        label={labels.fields.subCategoryCodes}
        options={availableSubCategoryOptions}
        selectedValues={form.subCategoryCodes}
        getOptionLabel={localeName}
        noResultsLabel={labels.noSuggestions}
        onChange={(values) => onChange((current) => ({ ...current, subCategoryCodes: values }))}
        searchPlaceholder={labels.search}
      />
      <MultiSelectField
        label={labels.fields.brandCodes}
        options={brandOptions}
        selectedValues={form.brandCodes}
        getOptionLabel={localeName}
        noResultsLabel={labels.noSuggestions}
        onChange={(values) => onChange((current) => ({ ...current, brandCodes: values }))}
        searchPlaceholder={labels.search}
      />
      <ControlledTextArea label={labels.fields.shortDescriptionTh} required value={form.shortDescriptionTh} onChange={(value) => onChange((current) => ({ ...current, shortDescriptionTh: value }))} />
      <ControlledTextArea label={labels.fields.shortDescriptionEn} required value={form.shortDescriptionEn} onChange={(value) => onChange((current) => ({ ...current, shortDescriptionEn: value }))} />
      <RichTextEditor
        label={labels.fields.descriptionTh}
        onChange={(value) => onChange((current) => ({ ...current, descriptionTh: value }))}
        value={form.descriptionTh}
      />
      <RichTextEditor
        label={labels.fields.descriptionEn}
        onChange={(value) => onChange((current) => ({ ...current, descriptionEn: value }))}
        value={form.descriptionEn}
      />
      <ControlledTextField label={labels.fields.seoTitleTh} required value={form.seoTitleTh} onChange={(value) => onChange((current) => ({ ...current, seoTitleTh: value }))} />
      <ControlledTextField label={labels.fields.seoTitleEn} required value={form.seoTitleEn} onChange={(value) => onChange((current) => ({ ...current, seoTitleEn: value }))} />
      <ControlledTextArea label={labels.fields.seoDescriptionTh} required value={form.seoDescriptionTh} onChange={(value) => onChange((current) => ({ ...current, seoDescriptionTh: value }))} />
      <ControlledTextArea label={labels.fields.seoDescriptionEn} required value={form.seoDescriptionEn} onChange={(value) => onChange((current) => ({ ...current, seoDescriptionEn: value }))} />
      <ControlledCheckboxField checked={form.isActive} label={labels.fields.isActive} onChange={(checked) => onChange((current) => ({ ...current, isActive: checked }))} />
      <ControlledCheckboxField checked={form.isNewProduct} label={labels.fields.isNewProduct} onChange={(checked) => onChange((current) => ({ ...current, isNewProduct: checked }))} />
      <ControlledCheckboxField checked={form.isBestSeller} label={labels.fields.isBestSeller} onChange={(checked) => onChange((current) => ({ ...current, isBestSeller: checked }))} />
      <ControlledCheckboxField
        checked={form.isPromotion}
        label={labels.fields.isPromotion}
        onChange={(checked) =>
          onChange((current) => ({
            ...current,
            discountedPrice: checked ? current.discountedPrice : "",
            isPromotion: checked,
          }))
        }
      />
    </div>
  );
}

function DeleteProductsModal({
  labels,
  locale,
  onClose,
  products,
}: {
  labels: ProductLabels;
  locale: "th" | "en";
  onClose: () => void;
  products: ProductManagementRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const isBulkDelete = products.length > 1;
  const title = isBulkDelete
    ? locale === "th"
      ? "ลบสินค้าที่เลือก"
      : "Delete selected products"
    : labels.deleteTitle;
  const body = isBulkDelete
    ? locale === "th"
      ? `ต้องการลบสินค้าที่เลือกจำนวน ${products.length} รายการใช่หรือไม่`
      : `Delete ${products.length} selected products?`
    : labels.deleteBodyTemplate.replace("{sku}", products[0]?.sku ?? "");

  async function handleDelete() {
    setIsDeleting(true);
    setError("");

    const responses = await Promise.all(
      products.map((product) =>
        fetch(`/api/admin/products/${encodeURIComponent(product.sku)}`, {
          method: "DELETE",
        }),
      ),
    );

    setIsDeleting(false);

    if (responses.some((response) => !response.ok)) {
      setError(labels.error);
      return;
    }

    router.refresh();
    onClose();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div
        aria-labelledby="admin-product-delete-title"
        aria-modal="true"
        className="admin-product-modal admin-product-confirm-modal"
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2 id="admin-product-delete-title">{title}</h2>
          <button
            aria-label={labels.cancel}
            className="admin-product-modal-close"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <p>{body}</p>
        {error ? <p className="admin-product-form-error">{error}</p> : null}
        <div className="admin-product-modal-actions">
          <button
            className="admin-product-secondary-button"
            onClick={onClose}
            type="button"
          >
            {labels.cancel}
          </button>
          <button
            className="admin-product-danger-button"
            disabled={isDeleting}
            onClick={handleDelete}
            type="button"
          >
            {labels.confirmDelete}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductPromotionModal({
  labels,
  locale,
  onClose,
  products,
}: {
  labels: ProductLabels;
  locale: "th" | "en";
  onClose: () => void;
  products: ProductManagementRow[];
}) {
  const router = useRouter();
  const [discountedPrice, setDiscountedPrice] = useState(
    products[0]?.discountedPrice === null || products[0]?.discountedPrice === undefined
      ? ""
      : String(products[0].discountedPrice),
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const title = locale === "th" ? "ตั้งค่าโปรโมชัน" : "Set promotion";
  const description =
    locale === "th"
      ? `ระบุราคาลดเพื่อเปิดโปรโมชันให้สินค้า ${products.length} รายการที่เลือก`
      : `Enter the discounted price to enable promotion for ${products.length} selected products.`;

  async function handleSubmit() {
    const trimmedValue = discountedPrice.trim();

    if (!trimmedValue) {
      setError(
        locale === "th" ? "กรุณากรอกราคาลด" : "Discounted price is required",
      );
      return;
    }

    const parsedValue = Number(trimmedValue);

    if (!Number.isFinite(parsedValue)) {
      setError(labels.error);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const responses = await Promise.all(
        products.map((product) =>
          fetch(`/api/admin/products/${encodeURIComponent(product.sku)}`, {
            body: JSON.stringify({
              discountedPrice: parsedValue,
              isPromotion: true,
            }),
            headers: {
              "content-type": "application/json",
            },
            method: "PATCH",
          }),
        ),
      );

      if (responses.some((response) => !response.ok)) {
        throw new Error("promotion-update-failed");
      }

      router.refresh();
      onClose();
    } catch {
      setError(labels.error);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form
          className="admin-product-form"
          onSubmit={(event) => {
            event.preventDefault();
            void handleSubmit();
          }}
        >
          <div className="admin-product-form-section">
            <p className="admin-product-form-hint">{description}</p>
            <div className="admin-table-relations">
              {products.map((product) => (
                <strong key={product.sku}>{product.sku}</strong>
              ))}
            </div>
          </div>
          <div className="admin-product-form-section">
            <label className="admin-product-field">
              <span>{labels.fields.discountedPrice}</span>
              <input
                autoFocus
                onChange={(event) => setDiscountedPrice(event.target.value)}
                type="number"
                value={discountedPrice}
              />
            </label>
          </div>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button
              className="admin-product-secondary-button"
              onClick={onClose}
              type="button"
            >
              {labels.cancel}
            </button>
            <button
              className="admin-product-add-button"
              disabled={isSaving}
              type="submit"
            >
              {isSaving ? labels.saving : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ControlledTextField({
  disabled = false,
  label,
  required = false,
  type = "text",
  value,
  onChange,
}: {
  disabled?: boolean;
  label: string;
  required?: boolean;
  type?: "number" | "text";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="admin-product-form-field">
      <span>{label}</span>
      <input
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function ControlledCheckboxField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-product-checkbox-field">
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
        value="true"
      />
      <span>{label}</span>
    </label>
  );
}

function ControlledTextArea({
  label,
  required = false,
  value,
  onChange,
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="admin-product-form-field admin-product-form-field-wide">
      <span>{label}</span>
      <textarea
        onChange={(event) => onChange(event.target.value)}
        required={required}
        rows={3}
        value={value}
      />
    </label>
  );
}

function DatasheetUploader({
  fileInputRef,
  isUploading,
  label,
  labels,
  onClear,
  onFilesSelected,
  url,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  isUploading: boolean;
  label: string;
  labels: ProductLabels;
  onClear: () => void;
  onFilesSelected: (files: FileList | null) => Promise<void>;
  url: string;
}) {
  return (
    <div className="admin-product-field admin-product-field-wide">
      <span>{label}</span>
      <div className="admin-upload-surface">
        <input
          accept="application/pdf"
          className="admin-inventory-file-input"
          hidden
          onChange={(event) => void onFilesSelected(event.target.files)}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="admin-product-secondary-button"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            upload_file
          </span>
          {isUploading ? labels.uploadingDatasheet : labels.uploadDatasheet}
        </button>
        <p className="admin-upload-helper">{labels.uploadDatasheetHelper}</p>
        {url ? (
          <div className="admin-upload-media-grid">
            <div className="admin-upload-preview-card">
              <div className="admin-upload-preview-frame">
                <span className="material-symbols-outlined" aria-hidden="true">
                  picture_as_pdf
                </span>
              </div>
              <div className="admin-upload-preview-meta">
                <a className="admin-upload-preview-link" href={url} rel="noreferrer" target="_blank">
                  Open PDF
                </a>
                <button className="admin-product-secondary-button" onClick={onClear} type="button">
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <p className="admin-upload-empty">{labels.noDatasheet}</p>
        )}
      </div>
    </div>
  );
}

function MediaUploader({
  fileInputRef,
  files,
  isUploading,
  label,
  labels,
  onFilesSelected,
  onRemove,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  files: string[];
  isUploading: boolean;
  label: string;
  labels: ProductLabels;
  onFilesSelected: (files: FileList | null) => Promise<void>;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="admin-product-field admin-product-field-wide">
      <span>{label}</span>
      <div className="admin-upload-surface">
        <input
          accept="image/*,video/mp4,video/quicktime,video/webm,video/x-m4v"
          className="admin-inventory-file-input"
          hidden
          multiple
          onChange={(event) => void onFilesSelected(event.target.files)}
          ref={fileInputRef}
          type="file"
        />
        <button
          className="admin-product-secondary-button"
          onClick={() => fileInputRef.current?.click()}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            upload_file
          </span>
          {isUploading ? labels.uploadingMedia : labels.uploadImage}
        </button>
        <p className="admin-upload-helper">{labels.uploadMediaHelper}</p>
        {files.length > 0 ? (
          <div className="admin-upload-media-grid">
            {files.map((url) => (
              <div className="admin-upload-preview-card" key={url}>
                <div className="admin-upload-preview-frame">
                  {isVideoAssetUrl(url) ? (
                    <video
                      className="admin-upload-preview-video"
                      controls
                      playsInline
                      src={url}
                    />
                  ) : (
                    <Image
                      alt={label}
                      className="admin-upload-preview-image"
                      height={220}
                      src={url}
                      unoptimized
                      width={420}
                    />
                  )}
                </div>
                <div className="admin-upload-preview-meta">
                  <a className="admin-upload-preview-link" href={url} rel="noreferrer" target="_blank">
                    Open file
                  </a>
                  <button className="admin-product-secondary-button" onClick={() => onRemove(url)} type="button">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-upload-empty">{labels.noMedia}</p>
        )}
      </div>
    </div>
  );
}

function isVideoAssetUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}

function MultiSelectField({
  disabled = false,
  getOptionLabel,
  label,
  noResultsLabel,
  onChange,
  options,
  searchPlaceholder,
  selectedValues,
}: {
  disabled?: boolean;
  getOptionLabel: (option: ProductEditorOption) => string;
  label: string;
  noResultsLabel: string;
  onChange: (values: string[]) => void;
  options: ProductEditorOption[];
  searchPlaceholder?: string;
  selectedValues: string[];
}) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-combobox`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOptions = options.filter((option) => selectedValues.includes(option.code));
  const filteredOptions = options.filter((option) =>
    getOptionLabel(option).toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()),
  );

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function toggleValue(code: string) {
    if (selectedValues.includes(code)) {
      onChange(selectedValues.filter((value) => value !== code));
      return;
    }

    onChange([code]);
  }

  const summary =
    selectedOptions.length > 0
      ? selectedOptions.map(getOptionLabel).join(", ")
      : label;

  return (
    <label className="admin-product-form-field admin-product-form-field-wide">
      <span>{label}</span>
      <div
        className={`admin-product-multiselect${disabled ? " is-disabled" : ""}`}
        ref={containerRef}
      >
        <div className="admin-product-multiselect-combobox">
          <span className="material-symbols-outlined" aria-hidden="true">
            search
          </span>
          <input
            aria-autocomplete="list"
            aria-controls={`${inputId}-suggestions`}
            aria-expanded={isOpen}
            autoComplete="off"
            className="admin-product-multiselect-input"
            disabled={disabled}
            id={inputId}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedOptions.length > 0 ? summary : searchPlaceholder ?? label}
            role="combobox"
            type="search"
            value={query}
          />
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_drop_down
          </span>
        </div>
        {selectedOptions.length > 0 ? (
          <div className="admin-product-multiselect-tags">
            {selectedOptions.map((option) => (
              <button
                className="admin-product-multiselect-tag"
                disabled={disabled}
                key={option.code}
                onClick={() => toggleValue(option.code)}
                type="button"
              >
                <span>{getOptionLabel(option)}</span>
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            ))}
          </div>
        ) : null}
        {isOpen ? (
          <div
            className="admin-product-multiselect-panel"
            id={`${inputId}-suggestions`}
            role="listbox"
          >
            <div className="admin-product-multiselect-options">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => {
                  const checked = selectedValues.includes(option.code);

                  return (
                    <button
                      aria-selected={checked}
                      className={`admin-product-multiselect-option${checked ? " is-selected" : ""}`}
                      key={option.code}
                      onClick={() => {
                        toggleValue(option.code);
                        setQuery("");
                        setIsOpen(false);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      role="option"
                      type="button"
                    >
                      <span>{getOptionLabel(option)}</span>
                      {checked ? (
                        <span className="material-symbols-outlined" aria-hidden="true">
                          check
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="admin-product-multiselect-empty">{noResultsLabel}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </label>
  );
}

function GoogleCategoryCombobox({
  emptyLabel,
  label,
  loadingLabel,
  locale,
  noResultsLabel,
  onChange,
  searchPlaceholder,
  value,
}: {
  emptyLabel: string;
  label: string;
  loadingLabel: string;
  locale: "th" | "en";
  noResultsLabel: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  value: string;
}) {
  const inputId = `${label.replace(/\s+/g, "-").toLowerCase()}-google-category-combobox`;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [options, setOptions] = useState<GoogleProductCategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const normalizedQuery = query.trim();
  const selectedOption = options.find((option) => option.id === value);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategories(search: string) {
      setIsLoading(true);

      try {
        const params = new URLSearchParams({
          page: "1",
          pageSize: "20",
        });

        if (search) {
          params.set("search", search);
        }

        const response = await fetch(
          `/api/admin/google-product-categories?${params.toString()}`,
          {
            cache: "no-store",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setOptions([]);
          return;
        }

        const data = (await response.json()) as GoogleProductCategoryListResponse;
        setOptions(data.items ?? []);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setOptions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (isOpen) {
      const timer = window.setTimeout(
        () => void loadCategories(normalizedQuery),
        normalizedQuery ? 250 : 0,
      );

      return () => {
        window.clearTimeout(timer);
        controller.abort();
      };
    }

    if (value && !selectedOption) {
      void loadCategories(value);
    }

    return () => {
      controller.abort();
    };
  }, [isOpen, normalizedQuery, selectedOption, value]);

  const selectedLabel = selectedOption
    ? getGoogleCategoryOptionLabel(selectedOption, locale)
    : value;

  return (
    <label className="admin-product-form-field admin-product-form-field-wide">
      <span>{label}</span>
      <div className="admin-product-multiselect" ref={containerRef}>
        <div className="admin-product-multiselect-combobox">
          <span className="material-symbols-outlined" aria-hidden="true">
            search
          </span>
          <input
            aria-autocomplete="list"
            aria-controls={`${inputId}-suggestions`}
            aria-expanded={isOpen}
            autoComplete="off"
            className="admin-product-multiselect-input"
            id={inputId}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 120);
            }}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={selectedLabel || searchPlaceholder}
            role="combobox"
            type="search"
            value={query}
          />
          <span className="material-symbols-outlined" aria-hidden="true">
            arrow_drop_down
          </span>
        </div>
        {value ? (
          <div className="admin-product-multiselect-tags">
            <button
              className="admin-product-multiselect-tag"
              onClick={() => {
                onChange("");
                setQuery("");
              }}
              type="button"
            >
              <span>{selectedLabel || `${label}: ${value}`}</span>
              <span className="admin-product-google-category-id">#{value}</span>
              <span className="material-symbols-outlined" aria-hidden="true">
                close
              </span>
            </button>
          </div>
        ) : (
          <p className="admin-product-google-category-helper">{emptyLabel}</p>
        )}
        {isOpen ? (
          <div
            className="admin-product-multiselect-panel"
            id={`${inputId}-suggestions`}
            role="listbox"
          >
            <div className="admin-product-multiselect-options">
              {isLoading ? (
                <p className="admin-product-multiselect-empty">{loadingLabel}</p>
              ) : options.length > 0 ? (
                options.map((option) => {
                  const checked = option.id === value;

                  return (
                    <button
                      aria-selected={checked}
                      className={`admin-product-multiselect-option${checked ? " is-selected" : ""}`}
                      key={option.id}
                      onClick={() => {
                        onChange(option.id);
                        setQuery("");
                        setIsOpen(false);
                      }}
                      onMouseDown={(event) => event.preventDefault()}
                      role="option"
                      type="button"
                    >
                      <span className="admin-product-google-category-option">
                        <strong>{getGoogleCategoryOptionLabel(option, locale)}</strong>
                        <span>ID: {option.id}</span>
                      </span>
                      {checked ? (
                        <span className="material-symbols-outlined" aria-hidden="true">
                          check
                        </span>
                      ) : null}
                    </button>
                  );
                })
              ) : (
                <p className="admin-product-multiselect-empty">{noResultsLabel}</p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </label>
  );
}

function getGoogleCategoryOptionLabel(
  option: GoogleProductCategoryOption,
  locale: "th" | "en",
) {
  return locale === "th"
    ? option.fullPathTh?.trim() || option.fullPathEn
    : option.fullPathEn;
}

function getInitialFormValue(product?: ProductManagementRow): ProductFormValue {
  return {
    rank: product ? String(product.rank) : "0",
    nameTh: product?.nameTh ?? "",
    nameEn: product?.nameEn ?? "",
    shortDescriptionTh: product?.shortDescriptionTh ?? "",
    shortDescriptionEn: product?.shortDescriptionEn ?? "",
    descriptionTh: product?.descriptionTh ?? "",
    descriptionEn: product?.descriptionEn ?? "",
    datasheetUrl: product?.datasheetUrl ?? "",
    imgUrl: product?.imgUrl ?? [],
    slug: product?.slug ?? "",
    price: product?.price === null || product?.price === undefined ? "" : String(product.price),
    deliveryFee:
      product?.deliveryFee === null || product?.deliveryFee === undefined
        ? ""
        : String(product.deliveryFee),
    model: product?.model ?? "",
    seoTitleTh: product?.seoTitleTh ?? "",
    seoTitleEn: product?.seoTitleEn ?? "",
    seoDescriptionTh: product?.seoDescriptionTh ?? "",
    seoDescriptionEn: product?.seoDescriptionEn ?? "",
    googleCategoryId: product?.googleCategoryId ?? "",
    isActive: product?.isActive ?? true,
    isNewProduct: product?.isNewProduct ?? false,
    isBestSeller: product?.isBestSeller ?? false,
    isPromotion: product?.isPromotion ?? false,
    discountedPrice:
      product?.discountedPrice === null || product?.discountedPrice === undefined
        ? ""
        : String(product.discountedPrice),
    categoryCodes: (product?.categories ?? product?.categoryCods ?? [])
      .slice(0, 1)
      .map((category) => category.code),
    subCategoryCodes: (product?.subCategories ?? [])
      .slice(0, 1)
      .map((subCategory) => subCategory.code),
    brandCodes: (product?.brands ?? []).slice(0, 1).map((brand) => brand.code),
  };
}

function getProductPayload(form: ProductFormValue) {
  return {
    rank: getNumberFromValue(form.rank) ?? 0,
    nameTh: form.nameTh.trim(),
    nameEn: form.nameEn.trim(),
    shortDescriptionTh: form.shortDescriptionTh.trim(),
    shortDescriptionEn: form.shortDescriptionEn.trim(),
    descriptionTh: form.descriptionTh,
    descriptionEn: form.descriptionEn,
    datasheetUrl: form.datasheetUrl.trim() || null,
    imgUrl: form.imgUrl,
    slug: form.slug.trim(),
    price: getNumberFromValue(form.price),
    deliveryFee: getNumberFromValue(form.deliveryFee),
    model: form.model.trim() || null,
    seoTitleTh: form.seoTitleTh.trim(),
    seoTitleEn: form.seoTitleEn.trim(),
    seoDescriptionTh: form.seoDescriptionTh.trim(),
    seoDescriptionEn: form.seoDescriptionEn.trim(),
    googleCategoryId: form.googleCategoryId.trim() || null,
    isActive: form.isActive,
    isNewProduct: form.isNewProduct,
    isBestSeller: form.isBestSeller,
    isPromotion: form.isPromotion,
    discountedPrice: form.isPromotion ? getNumberFromValue(form.discountedPrice) : null,
    categoryCodes: form.categoryCodes,
    subCategoryCodes: form.subCategoryCodes,
    brandCodes: form.brandCodes,
  };
}

function getDownloadFilename(response: Response, fallbackFilename: string) {
  const disposition = response.headers.get("content-disposition");
  const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1];

  return filename ? decodeURIComponent(filename) : fallbackFilename;
}

function getNumberFromValue(value: string) {

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}
