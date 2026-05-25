"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import type { ProductSearchSuggestion } from "@/components/product-search";

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

type ProductFormValue = {
  rank: string;
  nameTh: string;
  nameEn: string;
  shortDescriptionTh: string;
  shortDescriptionEn: string;
  descriptionTh: string;
  descriptionEn: string;
  datasheetUrl: string;
  imgUrl: string;
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
  categoryCodes: string;
  subCategoryCodes: string;
  brandCodes: string;
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
  noSuggestions: string;
  save: string;
  search: string;
  searchPlaceholder: string;
  searchTooShort: string;
  template: string;
  upload: string;
};

export function ProductToolbarActions({
  labels,
}: {
  labels: ProductLabels;
  rows?: ProductManagementRow[];
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
          labels={labels}
          mode="add"
          onClose={() => setIsAddOpen(false)}
        />
      ) : null}
      {isUploadOpen ? (
        <ProductUploadModal labels={labels} onClose={() => setIsUploadOpen(false)} />
      ) : null}
    </div>
  );
}

export function ProductRowManagementActions({
  labels,
  product,
}: {
  labels: ProductLabels;
  product: ProductManagementRow;
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
          labels={labels}
          mode="edit"
          onClose={() => setMode(null)}
          product={product}
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
  labels,
  mode,
  onClose,
  product,
}: {
  labels: ProductLabels;
  mode: "add" | "edit";
  onClose: () => void;
  product?: ProductManagementRow;
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const initialValue = useMemo(() => getInitialFormValue(product), [product]);
  const [isPromotion, setIsPromotion] = useState(initialValue.isPromotion);
  const [discountedPrice, setDiscountedPrice] = useState(initialValue.discountedPrice);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = getProductPayload(form, {
      discountedPrice,
      isPromotion,
    });
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
            discountedPrice={discountedPrice}
            initialValue={initialValue}
            isPromotion={isPromotion}
            onDiscountedPriceChange={setDiscountedPrice}
            onPromotionChange={(nextValue) => {
              setIsPromotion(nextValue);
              if (!nextValue) {
                setDiscountedPrice("");
              }
            }}
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
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
              {labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function ProductFormFields({
  discountedPrice,
  initialValue,
  isPromotion,
  onDiscountedPriceChange,
  onPromotionChange,
}: {
  discountedPrice: string;
  initialValue: ProductFormValue;
  isPromotion: boolean;
  onDiscountedPriceChange: (value: string) => void;
  onPromotionChange: (value: boolean) => void;
}) {
  return (
    <div className="admin-product-form-grid">
      <TextField label="Rank" name="rank" type="number" value={initialValue.rank} />
      <TextField label="Slug" name="slug" required value={initialValue.slug} />
      <TextField label="Thai Name" name="nameTh" required value={initialValue.nameTh} />
      <TextField label="English Name" name="nameEn" required value={initialValue.nameEn} />
      <TextField label="Model" name="model" value={initialValue.model} />
      <TextField label="Price" name="price" type="number" value={initialValue.price} />
      <TextField
        label="Delivery Fee"
        name="deliveryFee"
        type="number"
        value={initialValue.deliveryFee}
      />
      <ControlledTextField
        label="Discounted Price"
        name="discountedPrice"
        type="number"
        value={discountedPrice}
        disabled={!isPromotion}
        onChange={onDiscountedPriceChange}
      />
      <TextField label="Datasheet URL" name="datasheetUrl" value={initialValue.datasheetUrl} />
      <TextField label="Image URLs" name="imgUrl" value={initialValue.imgUrl} />
      <TextField label="Google Category ID" name="googleCategoryId" value={initialValue.googleCategoryId} />
      <TextField label="Category Codes" name="categoryCodes" value={initialValue.categoryCodes} />
      <TextField label="Sub-category Codes" name="subCategoryCodes" value={initialValue.subCategoryCodes} />
      <TextField label="Brand Codes" name="brandCodes" value={initialValue.brandCodes} />
      <TextArea label="Thai Short Description" name="shortDescriptionTh" required value={initialValue.shortDescriptionTh} />
      <TextArea label="English Short Description" name="shortDescriptionEn" required value={initialValue.shortDescriptionEn} />
      <TextArea label="Thai Description" name="descriptionTh" required value={initialValue.descriptionTh} />
      <TextArea label="English Description" name="descriptionEn" required value={initialValue.descriptionEn} />
      <TextField label="Thai SEO Title" name="seoTitleTh" required value={initialValue.seoTitleTh} />
      <TextField label="English SEO Title" name="seoTitleEn" required value={initialValue.seoTitleEn} />
      <TextArea label="Thai SEO Description" name="seoDescriptionTh" required value={initialValue.seoDescriptionTh} />
      <TextArea label="English SEO Description" name="seoDescriptionEn" required value={initialValue.seoDescriptionEn} />
      <CheckboxField label="Active" name="isActive" checked={initialValue.isActive} />
      <CheckboxField label="New product" name="isNewProduct" checked={initialValue.isNewProduct} />
      <CheckboxField label="Best seller" name="isBestSeller" checked={initialValue.isBestSeller} />
      <ControlledCheckboxField
        checked={isPromotion}
        label="Promotion"
        name="isPromotion"
        onChange={onPromotionChange}
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

function TextField({
  disabled = false,
  label,
  name,
  required = false,
  type = "text",
  value,
}: {
  disabled?: boolean;
  label: string;
  name: keyof ProductFormValue;
  required?: boolean;
  type?: "number" | "text";
  value: string;
}) {
  return (
    <label className="admin-product-form-field">
      <span>{label}</span>
      <input
        defaultValue={value}
        disabled={disabled}
        name={name}
        required={required}
        type={type}
      />
    </label>
  );
}

function ControlledTextField({
  disabled = false,
  label,
  name,
  required = false,
  type = "text",
  value,
  onChange,
}: {
  disabled?: boolean;
  label: string;
  name: keyof ProductFormValue;
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
        name={name}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function TextArea({
  label,
  name,
  required = false,
  value,
}: {
  label: string;
  name: keyof ProductFormValue;
  required?: boolean;
  value: string;
}) {
  return (
    <label className="admin-product-form-field admin-product-form-field-wide">
      <span>{label}</span>
      <textarea defaultValue={value} name={name} required={required} rows={3} />
    </label>
  );
}

function CheckboxField({
  checked,
  label,
  name,
}: {
  checked: boolean;
  label: string;
  name: keyof ProductFormValue;
}) {
  return (
    <label className="admin-product-checkbox-field">
      <input defaultChecked={checked} name={name} type="checkbox" value="true" />
      <span>{label}</span>
    </label>
  );
}

function ControlledCheckboxField({
  checked,
  label,
  name,
  onChange,
}: {
  checked: boolean;
  label: string;
  name: keyof ProductFormValue;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-product-checkbox-field">
      <input
        checked={checked}
        name={name}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
        value="true"
      />
      <span>{label}</span>
    </label>
  );
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
    imgUrl: product?.imgUrl.join(", ") ?? "",
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
      .map((category) => category.code)
      .join(", "),
    subCategoryCodes: product?.subCategories.map((subCategory) => subCategory.code).join(", ") ?? "",
    brandCodes: product?.brands.map((brand) => brand.code).join(", ") ?? "",
  };
}

function getProductPayload(
  form: FormData,
  {
    discountedPrice,
    isPromotion,
  }: {
    discountedPrice: string;
    isPromotion: boolean;
  },
) {
  return {
    rank: getNumber(form, "rank") ?? 0,
    nameTh: getString(form, "nameTh"),
    nameEn: getString(form, "nameEn"),
    shortDescriptionTh: getString(form, "shortDescriptionTh"),
    shortDescriptionEn: getString(form, "shortDescriptionEn"),
    descriptionTh: getString(form, "descriptionTh"),
    descriptionEn: getString(form, "descriptionEn"),
    datasheetUrl: getNullableString(form, "datasheetUrl"),
    imgUrl: getList(form, "imgUrl"),
    slug: getString(form, "slug"),
    price: getNumber(form, "price"),
    deliveryFee: getNumber(form, "deliveryFee"),
    model: getNullableString(form, "model"),
    seoTitleTh: getString(form, "seoTitleTh"),
    seoTitleEn: getString(form, "seoTitleEn"),
    seoDescriptionTh: getString(form, "seoDescriptionTh"),
    seoDescriptionEn: getString(form, "seoDescriptionEn"),
    googleCategoryId: getNullableString(form, "googleCategoryId"),
    isActive: form.get("isActive") === "true",
    isNewProduct: form.get("isNewProduct") === "true",
    isBestSeller: form.get("isBestSeller") === "true",
    isPromotion,
    discountedPrice: isPromotion ? getNumberFromValue(discountedPrice) : null,
    categoryCodes: getList(form, "categoryCodes"),
    subCategoryCodes: getList(form, "subCategoryCodes"),
    brandCodes: getList(form, "brandCodes"),
  };
}

function getDownloadFilename(response: Response, fallbackFilename: string) {
  const disposition = response.headers.get("content-disposition");
  const filename = disposition?.match(/filename="?([^";]+)"?/)?.[1];

  return filename ? decodeURIComponent(filename) : fallbackFilename;
}

function getString(form: FormData, name: string) {
  return String(form.get(name) ?? "").trim();
}

function getNullableString(form: FormData, name: string) {
  const value = getString(form, name);

  return value || null;
}

function getNumber(form: FormData, name: string) {
  return getNumberFromValue(getString(form, name));
}

function getNumberFromValue(value: string) {

  if (!value) {
    return null;
  }

  const numberValue = Number(value);

  return Number.isFinite(numberValue) ? numberValue : null;
}

function getList(form: FormData, name: string) {
  return getString(form, name)
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}
