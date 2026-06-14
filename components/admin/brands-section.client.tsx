"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { BrandSearch } from "@/components/brand-search";
import type { BrandListResponse } from "./brands-section";
import {
  AdminBatchFieldModal,
  type AdminBatchFieldModalConfig,
} from "./admin-batch-field-modal";
import {
  AdminDataTable,
  type AdminDataTableColumn,
  type AdminDataTableContextAction,
  AdminStatusBadge,
} from "./admin-data-table";
import { useAdminTableEditRequest } from "./admin-table-events";
import type { Locale } from "@/lib/i18n";

type BrandRow = NonNullable<BrandListResponse>["items"][number];

type BrandFormState = {
  descriptionEn: string;
  descriptionTh: string;
  imgUrl: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: string;
  slug: string;
};

type BrandBatchAction =
  | "descriptionEn"
  | "descriptionTh"
  | "imgUrl"
  | "isActive"
  | "nameEn"
  | "nameTh"
  | "rank"
  | "slug";

export function BrandsSectionClient({
  initialResponse,
  initialPageSize,
  initialSearch,
  locale,
  page,
}: {
  initialResponse: BrandListResponse | null;
  initialPageSize: number;
  initialSearch?: string;
  locale: Locale;
  page: number;
}) {
  const labels = getLabels(locale);
  const router = useRouter();
  const [selectedBrand, setSelectedBrand] = useState<BrandRow | null>(null);
  const [editingBrand, setEditingBrand] = useState<BrandRow | null>(null);
  const [bulkEditingBrands, setBulkEditingBrands] = useState<BrandRow[]>([]);
  const [bulkEditingAction, setBulkEditingAction] =
    useState<BrandBatchAction | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingBrand, setDeletingBrand] = useState<BrandRow | null>(null);
  const rows = selectedBrand ? [selectedBrand] : initialResponse?.items ?? [];
  const contextMenuActions = useMemo<AdminDataTableContextAction[]>(
    () => [
      { id: "nameTh", label: labels.fields.nameTh },
      { id: "nameEn", label: labels.fields.nameEn },
      { id: "slug", label: labels.fields.slug },
      { id: "rank", label: labels.fields.rank },
      { id: "imgUrl", label: labels.fields.imgUrl },
      { id: "descriptionTh", label: labels.fields.descriptionTh },
      { id: "descriptionEn", label: labels.fields.descriptionEn },
      { id: "isActive", label: labels.activeToggle },
    ],
    [labels],
  );

  useAdminTableEditRequest("brands", (actionId, rowIds) => {
    const matchedRows = rows.filter((row) => rowIds.includes(row.code));
    const normalizedAction = actionId as BrandBatchAction;

    if (matchedRows.length === 1 && actionId === "edit") {
      setEditingBrand(matchedRows[0]);
      return;
    }

    if (matchedRows.length > 0) {
      setBulkEditingAction(normalizedAction);
      setBulkEditingBrands(matchedRows);
    }
  });
  const columns = useMemo<AdminDataTableColumn<BrandRow>[]>(
    () => [
      {
        key: "logo",
        header: labels.columns.logo,
        className: "admin-table-image-column admin-table-brand-logo-column",
        render: (row) => <BrandLogoPreview src={row.imgUrl} title={row.nameTh} />,
      },
      {
        key: "nameTh",
        header: labels.columns.nameTh,
        className: "admin-table-name-column admin-table-brand-name-column-double",
        render: (row) => (
          <div className="admin-resource-name-cell admin-resource-name-cell-plain">
            <strong>{row.nameTh}</strong>
          </div>
        ),
      },
      {
        key: "nameEn",
        header: labels.columns.nameEn,
        className: "admin-table-name-column admin-table-brand-name-column-double",
        render: (row) => <strong>{row.nameEn}</strong>,
      },
      {
        key: "slug",
        header: labels.columns.slug,
        className: "admin-table-slug-column admin-table-brand-slug-column",
        render: (row) => row.slug,
      },
      {
        key: "code",
        header: labels.columns.code,
        className: "admin-table-code-column admin-table-brand-code-column",
        render: (row) => <strong>{row.code}</strong>,
      },
      {
        key: "skuCount",
        header: labels.columns.skuCount,
        className: "admin-table-number-column admin-table-brand-number-column",
        render: (row) => row.skuCount ?? 0,
      },
      {
        key: "status",
        header: labels.columns.status,
        className: "admin-table-status-column admin-table-brand-status-column",
        render: (row) => (
          <AdminStatusBadge
            label={row.isActive ? labels.active : labels.inactive}
            tone={row.isActive ? "active" : "inactive"}
          />
        ),
      },
      {
        key: "actions",
        header: labels.columns.actions,
        className: "admin-table-actions-column admin-table-brand-actions-column",
        render: (row) => (
          <div className="admin-table-actions">
            <button
              aria-label={labels.edit}
              className="admin-table-icon-button"
              onClick={() => setEditingBrand(row)}
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                edit
              </span>
            </button>
            <button
              aria-label={labels.delete}
              className="admin-table-icon-button"
              onClick={() => setDeletingBrand(row)}
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                delete
              </span>
            </button>
          </div>
        ),
      },
    ],
    [labels],
  );

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{labels.title}</h1>
      <div className="admin-product-heading-row">
        <BrandSearch
          initialSearch={initialSearch}
          labels={{
            empty: labels.search.empty,
            placeholder: labels.search.placeholder,
            search: labels.search.button,
            tooShort: labels.search.tooShort,
          }}
          locale={locale}
        />
        <button className="admin-product-add-button" onClick={() => setIsAddOpen(true)} type="button">
          <span aria-hidden="true">+</span>
          {labels.add}
        </button>
      </div>

      <AdminDataTable
        columns={columns}
        emptyLabel={initialResponse ? labels.empty : labels.fetchError}
        contextMenuActions={contextMenuActions}
        getRowId={(row) => row.code}
        pagination={{
          currentPage: initialResponse?.meta.page ?? page,
          currentPageSize: initialPageSize,
          totalPages: selectedBrand ? 1 : initialResponse?.meta.totalPages ?? 1,
          getPageHref: (nextPage) =>
            selectedBrand
              ? `/${locale}/admin?section=brands&search=${encodeURIComponent(selectedBrand.code)}`
              : createBrandsPageHref(locale, nextPage, initialPageSize, initialSearch),
          previousLabel: labels.previousPage,
          nextLabel: labels.nextPage,
          rowsPerPageLabel: labels.rowsPerPage,
        }}
        rows={rows}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.code}`}
        tableId="brands"
      />

      {isAddOpen ? (
        <BrandModal
          labels={labels}
          onClose={() => setIsAddOpen(false)}
          onSaved={() => {
            setIsAddOpen(false);
            router.refresh();
          }}
        />
      ) : null}
      {editingBrand ? (
        <BrandModal
          initialRow={editingBrand}
          labels={labels}
          onClose={() => setEditingBrand(null)}
          onSaved={() => {
            setEditingBrand(null);
            router.refresh();
          }}
        />
      ) : null}
      {deletingBrand ? (
        <DeleteBrandModal
          body={labels.deleteBody(deletingBrand.nameTh)}
          onClose={() => setDeletingBrand(null)}
          onConfirm={async () => {
            await fetch(`/api/admin/brands/${encodeURIComponent(deletingBrand.code)}`, {
              method: "DELETE",
            });
            setDeletingBrand(null);
            setSelectedBrand(null);
            router.refresh();
          }}
          title={labels.deleteTitle}
        />
      ) : null}
      {bulkEditingBrands.length > 0 && bulkEditingAction ? (
        <AdminBatchFieldModal
          cancelLabel={labels.cancel}
          config={getBrandBatchFieldConfig(labels, bulkEditingAction, bulkEditingBrands[0])}
          description={labels.bulkEditDescription(
            bulkEditingBrands.length,
            getBrandBatchFieldLabel(labels, bulkEditingAction),
          )}
          errorMessage={labels.error}
          items={bulkEditingBrands.map((row) => row.code)}
          onClose={() => {
            setBulkEditingAction(null);
            setBulkEditingBrands([]);
          }}
          onSubmit={async (value) => {
            const responses = await Promise.all(
              bulkEditingBrands.map((row) =>
                fetch(`/api/admin/brands/${encodeURIComponent(row.code)}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify(
                    buildBrandPayload(row, bulkEditingAction, value),
                  ),
                }),
              ),
            );

            if (responses.some((response) => !response.ok)) {
              throw new Error("bulk-edit-failed");
            }

            setBulkEditingAction(null);
            setBulkEditingBrands([]);
            router.refresh();
          }}
          saveLabel={labels.save}
          savingLabel={labels.saving}
          title={labels.bulkEditTitle(getBrandBatchFieldLabel(labels, bulkEditingAction))}
        />
      ) : null}
    </div>
  );
}

function buildBrandPayload(
  row: BrandRow,
  action: BrandBatchAction,
  value: boolean | number | string,
) {
  const next = {
    descriptionEn: row.descriptionEn ?? "",
    descriptionTh: row.descriptionTh ?? "",
    imgUrl: row.imgUrl ?? "",
    isActive: row.isActive,
    nameEn: row.nameEn,
    nameTh: row.nameTh,
    rank: row.rank ?? 1,
    slug: row.slug,
  };

  switch (action) {
    case "rank":
      next.rank = Number(value || 1);
      break;
    case "isActive":
      next.isActive = Boolean(value);
      break;
    case "descriptionEn":
    case "descriptionTh":
    case "imgUrl":
    case "nameEn":
    case "nameTh":
    case "slug":
      next[action] = String(value);
      break;
  }

  return {
    ...next,
    seoDescriptionEn: next.descriptionEn || next.nameEn,
    seoDescriptionTh: next.descriptionTh || next.nameTh,
    seoTitleEn: next.nameEn,
    seoTitleTh: next.nameTh,
  };
}

function getBrandBatchFieldLabel(
  labels: ReturnType<typeof getLabels>,
  action: BrandBatchAction,
) {
  if (action === "isActive") {
    return labels.activeToggle;
  }

  return labels.fields[action];
}

function getBrandBatchFieldConfig(
  labels: ReturnType<typeof getLabels>,
  action: BrandBatchAction,
  row: BrandRow,
): AdminBatchFieldModalConfig {
  switch (action) {
    case "rank":
      return {
        fieldLabel: labels.fields.rank,
        initialValue: row.rank ?? 1,
        type: "number",
      };
    case "isActive":
      return {
        fieldLabel: labels.activeToggle,
        initialValue: row.isActive,
        options: [
          { label: labels.active, value: "true" },
          { label: labels.inactive, value: "false" },
        ],
        type: "boolean",
      };
    case "descriptionEn":
    case "descriptionTh":
      return {
        fieldLabel: labels.fields[action],
        initialValue: row[action] ?? "",
        type: "textarea",
      };
    default:
      return {
        fieldLabel: getBrandBatchFieldLabel(labels, action),
        initialValue: row[action] ?? "",
        type: action === "imgUrl" ? "text" : "text",
      };
  }
}

function BrandModal({
  initialRow,
  labels,
  onClose,
  onSaved,
}: {
  initialRow?: BrandRow;
  labels: ReturnType<typeof getLabels>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<BrandFormState>(() =>
    initialRow
      ? {
          descriptionEn: initialRow.descriptionEn ?? "",
          descriptionTh: initialRow.descriptionTh ?? "",
          imgUrl: initialRow.imgUrl ?? "",
          isActive: initialRow.isActive,
          nameEn: initialRow.nameEn,
          nameTh: initialRow.nameTh,
          rank: String(initialRow.rank ?? 1),
          slug: initialRow.slug,
        }
      : {
          descriptionEn: "",
          descriptionTh: "",
          imgUrl: "",
          isActive: true,
          nameEn: "",
          nameTh: "",
          rank: "1",
          slug: "",
        },
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      rank: Number(form.rank || 1),
      nameTh: form.nameTh,
      nameEn: form.nameEn,
      descriptionTh: form.descriptionTh || undefined,
      descriptionEn: form.descriptionEn || undefined,
      slug: form.slug,
      imgUrl: form.imgUrl,
      seoTitleTh: form.nameTh,
      seoTitleEn: form.nameEn,
      seoDescriptionTh: form.descriptionTh || form.nameTh,
      seoDescriptionEn: form.descriptionEn || form.nameEn,
      isActive: form.isActive,
    };
    const response = await fetch(
      initialRow
        ? `/api/admin/brands/${encodeURIComponent(initialRow.code)}`
        : "/api/admin/brands",
      {
        method: initialRow ? "PATCH" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.error);
      return;
    }

    onSaved();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{initialRow ? labels.editTitle : labels.addTitle}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>{labels.formSection}</legend>
            <Field label={labels.fields.nameTh} required value={form.nameTh} onChange={(value) => setForm((current) => ({ ...current, nameTh: value }))} />
            <Field label={labels.fields.nameEn} required value={form.nameEn} onChange={(value) => setForm((current) => ({ ...current, nameEn: value }))} />
            <Field label={labels.fields.slug} required value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} />
            <Field label={labels.fields.rank} type="number" value={form.rank} onChange={(value) => setForm((current) => ({ ...current, rank: value }))} />
            <Field label={labels.fields.imgUrl} required value={form.imgUrl} onChange={(value) => setForm((current) => ({ ...current, imgUrl: value }))} />
            <div />
            <TextField label={labels.fields.descriptionTh} value={form.descriptionTh} onChange={(value) => setForm((current) => ({ ...current, descriptionTh: value }))} />
            <TextField label={labels.fields.descriptionEn} value={form.descriptionEn} onChange={(value) => setForm((current) => ({ ...current, descriptionEn: value }))} />
            <label className="admin-product-toggle">
              <input checked={form.isActive} onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} type="checkbox" />
              <span>{labels.activeToggle}</span>
            </label>
          </fieldset>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">
              {labels.cancel}
            </button>
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
              {isSaving ? labels.saving : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteBrandModal({
  body,
  onClose,
  onConfirm,
  title,
}: {
  body: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
}) {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div
        aria-modal="true"
        className="admin-product-modal admin-product-confirm-modal"
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <p>{body}</p>
        <div className="admin-product-modal-actions admin-product-confirm-message">
          <button className="admin-product-secondary-button" onClick={onClose} type="button">
            Cancel
          </button>
          <button
            className="admin-product-danger-button"
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              await onConfirm();
            }}
            type="button"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  onChange,
  required = false,
  type = "text",
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className="admin-product-field">
      <span>{label}</span>
      <input onChange={(event) => onChange(event.target.value)} required={required} type={type} value={value} />
    </label>
  );
}

function TextField({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="admin-product-field admin-product-field-wide">
      <span>{label}</span>
      <textarea onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

function BrandLogoPreview({ src, title }: { src: string | null; title: string }) {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <span
        aria-hidden="true"
        className="admin-resource-thumbnail admin-resource-thumbnail-logo"
        title={title}
      />
    );
  }

  return (
    <Image
      alt=""
      className="admin-resource-thumbnail admin-resource-thumbnail-logo"
      height={48}
      loading="lazy"
      onError={() => setHasError(true)}
      src={src}
      title={title}
      unoptimized
      width={48}
    />
  );
}

function createBrandsPageHref(
  locale: Locale,
  page: number,
  pageSize: number,
  search?: string,
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    section: "brands",
  });

  if (search) {
    searchParams.set("search", search);
  }

  return `/${locale}/admin?${searchParams.toString()}`;
}

function getLabels(locale: Locale) {
  return locale === "th"
    ? {
        title: "แบรนด์",
        add: "เพิ่มแบรนด์",
        addTitle: "เพิ่มแบรนด์",
        editTitle: "แก้ไขแบรนด์",
        deleteTitle: "ยืนยันการลบแบรนด์",
        deleteBody: (name: string) => `ยืนยันการลบแบรนด์ ${name} อีกครั้งก่อนดำเนินการ`,
        formSection: "รายละเอียดแบรนด์",
        fields: {
          nameTh: "ชื่อภาษาไทย",
          nameEn: "ชื่อภาษาอังกฤษ",
          slug: "Slug",
          rank: "ลำดับ",
          imgUrl: "Logo URL",
          descriptionTh: "คำอธิบายภาษาไทย",
          descriptionEn: "คำอธิบายภาษาอังกฤษ",
        },
        columns: {
          logo: "โลโก้",
          nameTh: "ชื่อภาษาไทย",
          nameEn: "ชื่อภาษาอังกฤษ",
          slug: "Slug",
          code: "Brand ID",
          skuCount: "จำนวน SKU",
          status: "สถานะ",
          actions: "จัดการ",
        },
        search: {
          button: "ค้นหา",
          empty: "ไม่พบแบรนด์",
          placeholder: "ค้นหาแบรนด์",
          tooShort: "พิมพ์อย่างน้อย 3 ตัวอักษร",
        },
        active: "ACTIVE",
        inactive: "INACTIVE",
        activeToggle: "การแสดงผล",
        cancel: "ยกเลิก",
        delete: "ลบ",
        edit: "แก้ไข",
        empty: "ไม่พบข้อมูลแบรนด์",
        error: "ไม่สามารถบันทึกข้อมูลได้",
        fetchError: "ไม่สามารถโหลดข้อมูลแบรนด์ได้",
        nextPage: "หน้าถัดไป",
        previousPage: "หน้าก่อนหน้า",
        rowsPerPage: "จำนวนต่อหน้า",
        save: "บันทึก",
        saving: "กำลังบันทึก...",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
        bulkEditTitle: (fieldLabel: string) => `แก้ไขหลายแบรนด์: ${fieldLabel}`,
        bulkEditDescription: (count: number, fieldLabel: string) =>
          `อัปเดตฟิลด์ ${fieldLabel} พร้อมกัน ${count} รายการ`,
      }
    : {
        title: "Brands",
        add: "Add Brand",
        addTitle: "Add Brand",
        editTitle: "Edit Brand",
        deleteTitle: "Confirm Brand Delete",
        deleteBody: (name: string) => `Please confirm deleting brand ${name}.`,
        formSection: "Brand Details",
        fields: {
          nameTh: "Thai Name",
          nameEn: "English Name",
          slug: "Slug",
          rank: "Rank",
          imgUrl: "Logo URL",
          descriptionTh: "Thai Description",
          descriptionEn: "English Description",
        },
        columns: {
          logo: "Logo",
          nameTh: "Thai Name",
          nameEn: "English Name",
          slug: "Slug",
          code: "Brand ID",
          skuCount: "SKU Count",
          status: "Status",
          actions: "Actions",
        },
        search: {
          button: "Search",
          empty: "No brands found",
          placeholder: "Search brands",
          tooShort: "Enter at least 3 characters",
        },
        active: "ACTIVE",
        inactive: "INACTIVE",
        activeToggle: "Visible",
        cancel: "Cancel",
        delete: "Delete",
        edit: "Edit",
        empty: "No brands found",
        error: "Unable to save data",
        fetchError: "Unable to load brands",
        nextPage: "Next page",
        previousPage: "Previous page",
        rowsPerPage: "Rows per page",
        save: "Save",
        saving: "Saving...",
        selectAll: "Select all rows",
        selectRow: "Select row",
        bulkEditTitle: (fieldLabel: string) => `Bulk edit brands: ${fieldLabel}`,
        bulkEditDescription: (count: number, fieldLabel: string) =>
          `Update ${fieldLabel} for ${count} brands at once.`,
      };
}
