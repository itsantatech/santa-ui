"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  type RefObject,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ProductSearchSuggestion } from "@/components/product-search";
import { RichTextEditor } from "@/components/rich-text-editor";

export type ProductManagementRow = ProductSearchSuggestion & {
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

type ProductLabels = {
  add: string;
  addTitle: string;
  cancel: string;
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
  noMedia: string;
  googleCategoryEmpty: string;
  googleCategoryLoading: string;
  googleCategorySearchPlaceholder: string;
  noSuggestions: string;
  save: string;
  saving: string;
  search: string;
  searchPlaceholder: string;
  searchTooShort: string;
  template: string;
  uploadDatasheet: string;
  uploadError: string;
  uploadImage: string;
  uploadingDatasheet: string;
  uploadingMedia: string;
  upload: string;
};

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
  const searchParams = useSearchParams();

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
        <DeleteProductModal
          labels={labels}
          onClose={() => setMode(null)}
          product={product}
        />
      ) : null}
    </>
  );
}

function ProductUploadModal({
  labels,
  onClose,
}: {
  labels: ProductLabels;
  onClose: () => void;
}) {
  const router = useRouter();
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
    setError("");
    setSummary("");
    setIsUploading(true);

    const response = await fetch("/api/admin/products/import", {
      body: new FormData(event.currentTarget),
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
            className="admin-product-secondary-button"
            onClick={() => void handleTemplateDownload()}
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              download
            </span>
            {labels.template}
          </button>
          <input accept=".csv,.xlsx" name="file" required type="file" />
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
              disabled={isUploading}
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
    const formData = new FormData();
    formData.append("file", file);
    formData.append("visibility", "public");
    formData.append("folder", folder);

    const response = await fetch("/api/admin/files/upload", {
      body: formData,
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(labels.uploadError);
    }

    const result = (await response.json()) as UploadedFileResponse;
    const nextUrl = result.url ?? result.signedUrl;

    if (!nextUrl) {
      throw new Error(labels.uploadError);
    }

    return nextUrl;
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

function DeleteProductModal({
  labels,
  onClose,
  product,
}: {
  labels: ProductLabels;
  onClose: () => void;
  product: ProductManagementRow;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    setError("");

    const response = await fetch(`/api/admin/products/${encodeURIComponent(product.sku)}`, {
      method: "DELETE",
    });

    setIsDeleting(false);

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
        aria-labelledby="admin-product-delete-title"
        aria-modal="true"
        className="admin-product-modal admin-product-confirm-modal"
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2 id="admin-product-delete-title">{labels.deleteTitle}</h2>
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
        <p>{labels.deleteBodyTemplate.replace("{sku}", product.sku)}</p>
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
      <div className="admin-content-media-uploader">
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
        {url ? (
          <div className="admin-content-media-list">
            <div className="admin-content-media-item">
              <a href={url} rel="noreferrer" target="_blank">
                {url}
              </a>
              <button onClick={onClear} type="button">
                <span className="material-symbols-outlined" aria-hidden="true">
                  close
                </span>
              </button>
            </div>
          </div>
        ) : (
          <p className="admin-table-muted">{labels.noDatasheet}</p>
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
      <div className="admin-content-media-uploader">
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
        {files.length > 0 ? (
          <div className="admin-content-media-list">
            {files.map((url) => (
              <div className="admin-content-media-item" key={url}>
                <a href={url} rel="noreferrer" target="_blank">
                  {url}
                </a>
                <button onClick={() => onRemove(url)} type="button">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="admin-table-muted">{labels.noMedia}</p>
        )}
      </div>
    </div>
  );
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
