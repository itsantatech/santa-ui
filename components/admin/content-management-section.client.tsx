"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, type RefObject, useMemo, useRef, useState } from "react";
import { ProductSearch, type ProductSearchSuggestion } from "@/components/product-search";
import { ContentSearch } from "@/components/content-search";
import { RichTextEditor } from "@/components/rich-text-editor";
import { formatAdminDateTime } from "@/lib/admin-api";
import type { Locale } from "@/lib/i18n";
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
import type {
  ContentListResponse,
  ContentResource,
  ContentRow,
  ContentSection,
} from "./content-management-section";

type UploadedFileResponse = {
  signedUrl?: string;
  url?: string;
};

type ContentFormState = {
  contentEn: string;
  contentTh: string;
  imgUrl: string[];
  isActive: boolean;
  rank: string;
  relatedSku: string[];
  slug: string;
  topicEn: string;
  topicTh: string;
};

type ContentBatchAction =
  | "contentEn"
  | "contentTh"
  | "isActive"
  | "rank"
  | "relatedSku"
  | "slug"
  | "topicEn"
  | "topicTh";

export function ContentManagementSectionClient({
  initialPageSize,
  initialResponse,
  initialSearch,
  locale,
  page,
  resource,
  section,
}: {
  initialPageSize: number;
  initialResponse: ContentListResponse | null;
  initialSearch?: string;
  locale: Locale;
  page: number;
  resource: ContentResource;
  section: ContentSection;
}) {
  const labels = getLabels(locale, section);
  const router = useRouter();
  const [editingRow, setEditingRow] = useState<ContentRow | null>(null);
  const [bulkEditingRows, setBulkEditingRows] = useState<ContentRow[]>([]);
  const [bulkEditingAction, setBulkEditingAction] =
    useState<ContentBatchAction | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingRow, setDeletingRow] = useState<ContentRow | null>(null);
  const rows = initialResponse?.items ?? [];
  const contextMenuActions = useMemo<AdminDataTableContextAction[]>(
    () => [
      { id: "topicTh", label: labels.fields.topicTh },
      { id: "topicEn", label: labels.fields.topicEn },
      { id: "slug", label: labels.fields.slug },
      { id: "rank", label: labels.fields.rank },
      { id: "contentTh", label: labels.fields.contentTh },
      { id: "contentEn", label: labels.fields.contentEn },
      { id: "relatedSku", label: labels.fields.relatedSku },
      { id: "isActive", label: labels.activeToggle },
    ],
    [labels],
  );

  useAdminTableEditRequest(section, (actionId, rowIds) => {
    const matchedRows = rows.filter((row) => rowIds.includes(row.id));

    if (matchedRows.length === 1 && actionId === "edit") {
      setEditingRow(matchedRows[0]);
      return;
    }

    if (matchedRows.length > 0) {
      setBulkEditingAction(actionId as ContentBatchAction);
      setBulkEditingRows(matchedRows);
    }
  });
  const columns = useMemo<AdminDataTableColumn<ContentRow>[]>(
    () => [
      {
        key: "topicTh",
        header: labels.columns.topicTh,
        className: "admin-table-name-column admin-table-content-topic-column",
        render: (row) => <strong>{row.topicTh}</strong>,
      },
      {
        key: "topicEn",
        header: labels.columns.topicEn,
        className: "admin-table-name-column admin-table-content-topic-column",
        render: (row) => <strong>{row.topicEn}</strong>,
      },
      {
        key: "slug",
        header: labels.columns.slug,
        className: "admin-table-slug-column",
        render: (row) => row.slug,
      },
      {
        key: "createdAt",
        header: labels.columns.createdAt,
        className: "admin-table-date-column",
        render: (row) => formatAdminDateTime(row.createdAt, locale),
      },
      {
        key: "createdBy",
        header: labels.columns.createdBy,
        className: "admin-table-user-column",
        render: (row) => row.createdBy ?? "-",
      },
      {
        key: "updatedAt",
        header: labels.columns.updatedAt,
        className: "admin-table-date-column",
        render: (row) => formatAdminDateTime(row.updatedAt, locale),
      },
      {
        key: "updatedBy",
        header: labels.columns.updatedBy,
        className: "admin-table-user-column",
        render: (row) => row.updatedBy ?? "-",
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
        key: "actions",
        header: labels.columns.actions,
        className: "admin-table-actions-column",
        render: (row) => (
          <div className="admin-table-actions">
            <button
              aria-label={labels.edit}
              className="admin-table-icon-button"
              onClick={() => setEditingRow(row)}
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                edit
              </span>
            </button>
            <button
              aria-label={labels.delete}
              className="admin-table-icon-button"
              onClick={() => setDeletingRow(row)}
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
    [labels, locale],
  );

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{labels.title}</h1>
      <div className="admin-product-heading-row">
        <ContentSearch
          initialSearch={initialSearch}
          labels={labels.search}
          locale={locale}
          resource={resource}
          section={section}
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
        getRowId={(row) => row.id}
        pagination={{
          currentPage: initialResponse?.meta.page ?? page,
          currentPageSize: initialPageSize,
          totalPages: initialResponse?.meta.totalPages ?? 1,
          getPageHref: (nextPage) =>
            createContentPageHref(
              locale,
              section,
              nextPage,
              initialPageSize,
              initialSearch,
            ),
          previousLabel: labels.previousPage,
          nextLabel: labels.nextPage,
          rowsPerPageLabel: labels.rowsPerPage,
        }}
        rows={rows}
        selectAllLabel={labels.selectAll}
        selectRowLabel={(row) => `${labels.selectRow} ${row.slug}`}
        tableId={section}
      />

      {isAddOpen ? (
        <ContentModal
          labels={labels}
          locale={locale}
          onClose={() => setIsAddOpen(false)}
          onSaved={() => {
            setIsAddOpen(false);
            router.refresh();
          }}
          resource={resource}
        />
      ) : null}
      {editingRow ? (
        <ContentModal
          initialRow={editingRow}
          labels={labels}
          locale={locale}
          onClose={() => setEditingRow(null)}
          onSaved={() => {
            setEditingRow(null);
            router.refresh();
          }}
          resource={resource}
        />
      ) : null}
      {deletingRow ? (
        <DeleteContentModal
          body={labels.deleteBody(deletingRow.topicTh)}
          cancelLabel={labels.cancel}
          confirmLabel={labels.delete}
          deletingLabel={labels.deleting}
          onClose={() => setDeletingRow(null)}
          onConfirm={async () => {
            await fetch(`/api/admin/${resource}/${encodeURIComponent(deletingRow.id)}`, {
              method: "DELETE",
            });
            setDeletingRow(null);
            router.refresh();
          }}
          title={labels.deleteTitle}
        />
      ) : null}
      {bulkEditingRows.length > 0 && bulkEditingAction ? (
        <AdminBatchFieldModal
          cancelLabel={labels.cancel}
          config={getContentBatchFieldConfig(labels, bulkEditingAction, bulkEditingRows[0])}
          description={labels.bulkEditDescription(
            bulkEditingRows.length,
            getContentBatchFieldLabel(labels, bulkEditingAction),
          )}
          errorMessage={labels.error}
          items={bulkEditingRows.map((row) => row.slug)}
          onClose={() => {
            setBulkEditingAction(null);
            setBulkEditingRows([]);
          }}
          onSubmit={async (value) => {
            const responses = await Promise.all(
              bulkEditingRows.map((row) =>
                fetch(`/api/admin/${resource}/${encodeURIComponent(row.id)}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify(
                    buildContentPayload(row, bulkEditingAction, value),
                  ),
                }),
              ),
            );

            if (responses.some((response) => !response.ok)) {
              throw new Error("bulk-edit-failed");
            }

            setBulkEditingAction(null);
            setBulkEditingRows([]);
            router.refresh();
          }}
          saveLabel={labels.save}
          savingLabel={labels.saving}
          title={labels.bulkEditTitle(
            getContentBatchFieldLabel(labels, bulkEditingAction),
          )}
        />
      ) : null}
    </div>
  );
}

function ContentModal({
  initialRow,
  labels,
  locale,
  onClose,
  onSaved,
  resource,
}: {
  initialRow?: ContentRow;
  labels: ReturnType<typeof getLabels>;
  locale: Locale;
  onClose: () => void;
  onSaved: () => void;
  resource: ContentResource;
}) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const [form, setForm] = useState<ContentFormState>(() =>
    initialRow
      ? {
          contentEn: initialRow.contentEn ?? "",
          contentTh: initialRow.contentTh ?? "",
          imgUrl: initialRow.imgUrl ?? [],
          isActive: initialRow.isActive,
          rank: String(initialRow.rank ?? 1),
          relatedSku: initialRow.relatedSku ?? [],
          slug: initialRow.slug,
          topicEn: initialRow.topicEn,
          topicTh: initialRow.topicTh,
        }
      : {
          contentEn: "",
          contentTh: "",
          imgUrl: [],
          isActive: true,
          rank: "1",
          relatedSku: [],
          slug: "",
          topicEn: "",
          topicTh: "",
        },
  );

  async function handleFilesSelected(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setIsUploadingFiles(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];

      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("visibility", "public");
        formData.append("folder", resource === "articles" ? "articles" : "news-and-activities");

        const response = await fetch("/api/admin/files/upload", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(labels.uploadError);
        }

        const result = (await response.json()) as UploadedFileResponse;
        const nextUrl = result.url ?? result.signedUrl;

        if (!nextUrl) {
          throw new Error(labels.uploadError);
        }

        uploadedUrls.push(nextUrl);
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
      setIsUploadingFiles(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      rank: Number(form.rank || 1),
      topicTh: form.topicTh,
      topicEn: form.topicEn,
      contentTh: form.contentTh,
      contentEn: form.contentEn,
      slug: form.slug,
      imgUrl: form.imgUrl,
      relatedSku: form.relatedSku,
      isActive: form.isActive,
    };

    const response = await fetch(
      initialRow
        ? `/api/admin/${resource}/${encodeURIComponent(initialRow.id)}`
        : `/api/admin/${resource}`,
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
            <Field label={labels.fields.topicTh} required value={form.topicTh} onChange={(value) => setForm((current) => ({ ...current, topicTh: value }))} />
            <Field label={labels.fields.topicEn} required value={form.topicEn} onChange={(value) => setForm((current) => ({ ...current, topicEn: value }))} />
            <Field label={labels.fields.slug} required value={form.slug} onChange={(value) => setForm((current) => ({ ...current, slug: value }))} />
            <Field label={labels.fields.rank} type="number" value={form.rank} onChange={(value) => setForm((current) => ({ ...current, rank: value }))} />
            <MediaUploader
              fileInputRef={fileInputRef}
              files={form.imgUrl}
              isUploading={isUploadingFiles}
              labels={labels}
              onFilesSelected={handleFilesSelected}
              onRemove={(targetUrl) =>
                setForm((current) => ({
                  ...current,
                  imgUrl: current.imgUrl.filter((url) => url !== targetUrl),
                }))
              }
            />
            <RelatedSkuPicker
              labels={labels}
              locale={locale}
              relatedSku={form.relatedSku}
              onAdd={(product) =>
                setForm((current) => ({
                  ...current,
                  relatedSku: current.relatedSku.includes(product.sku)
                    ? current.relatedSku
                    : [...current.relatedSku, product.sku],
                }))
              }
              onRemove={(targetSku) =>
                setForm((current) => ({
                  ...current,
                  relatedSku: current.relatedSku.filter((sku) => sku !== targetSku),
                }))
              }
            />
            <RichTextEditor
              label={labels.fields.contentTh}
              onChange={(value) => setForm((current) => ({ ...current, contentTh: value }))}
              placeholder={labels.richTextPlaceholder}
              value={form.contentTh}
            />
            <RichTextEditor
              label={labels.fields.contentEn}
              onChange={(value) => setForm((current) => ({ ...current, contentEn: value }))}
              placeholder={labels.richTextPlaceholder}
              value={form.contentEn}
            />
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
            <button className="admin-product-add-button" disabled={isSaving || isUploadingFiles} type="submit">
              {isSaving ? labels.saving : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function MediaUploader({
  fileInputRef,
  files,
  isUploading,
  labels,
  onFilesSelected,
  onRemove,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  files: string[];
  isUploading: boolean;
  labels: ReturnType<typeof getLabels>;
  onFilesSelected: (files: FileList | null) => void | Promise<void>;
  onRemove: (url: string) => void;
}) {
  return (
    <div className="admin-product-field admin-product-field-wide">
      <span>{labels.fields.imgUrl}</span>
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
          {isUploading ? labels.uploadingMedia : labels.addMedia}
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

function RelatedSkuPicker({
  labels,
  locale,
  onAdd,
  onRemove,
  relatedSku,
}: {
  labels: ReturnType<typeof getLabels>;
  locale: Locale;
  onAdd: (product: ProductSearchSuggestion) => void;
  onRemove: (sku: string) => void;
  relatedSku: string[];
}) {
  return (
    <div className="admin-product-field admin-product-field-wide">
      <span>{labels.fields.relatedSku}</span>
      <div className="admin-content-related-sku">
        <ProductSearch
          embedded
          labels={{
            noSuggestions: labels.productSearch.empty,
            search: labels.productSearch.button,
            searchPlaceholder: labels.productSearch.placeholder,
            searchTooShort: labels.productSearch.tooShort,
          }}
          locale={locale}
          onSelect={onAdd}
          onSearch={() => undefined}
          placeholder={labels.productSearch.placeholder}
        />
        {relatedSku.length > 0 ? (
          <div className="admin-content-sku-chip-list">
            {relatedSku.map((sku) => (
              <span className="admin-content-sku-chip" key={sku}>
                {sku}
                <button onClick={() => onRemove(sku)} type="button">
                  <span className="material-symbols-outlined" aria-hidden="true">
                    close
                  </span>
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="admin-table-muted">{labels.noRelatedSku}</p>
        )}
      </div>
    </div>
  );
}

function DeleteContentModal({
  body,
  cancelLabel,
  confirmLabel,
  deletingLabel,
  onClose,
  onConfirm,
  title,
}: {
  body: string;
  cancelLabel: string;
  confirmLabel: string;
  deletingLabel: string;
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
            {cancelLabel}
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
            {isDeleting ? deletingLabel : confirmLabel}
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

function createContentPageHref(
  locale: Locale,
  section: ContentSection,
  page: number,
  pageSize: number,
  search?: string,
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    section,
  });

  if (search) {
    searchParams.set("search", search);
  }

  return `/${locale}/admin?${searchParams.toString()}`;
}

function buildContentPayload(
  row: ContentRow,
  action: ContentBatchAction,
  value: boolean | number | string,
) {
  const next = {
    contentEn: row.contentEn,
    contentTh: row.contentTh,
    imgUrl: row.imgUrl,
    isActive: row.isActive,
    rank: row.rank ?? 1,
    relatedSku: row.relatedSku,
    slug: row.slug,
    topicEn: row.topicEn,
    topicTh: row.topicTh,
  };

  if (action === "rank") {
    next.rank = Number(value || 1);
  } else if (action === "isActive") {
    next.isActive = Boolean(value);
  } else if (action === "relatedSku") {
    next.relatedSku = String(value)
      .split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean);
  } else {
    next[action] = String(value);
  }

  return next;
}

function getContentBatchFieldLabel(
  labels: ReturnType<typeof getLabels>,
  action: ContentBatchAction,
) {
  if (action === "isActive") {
    return labels.activeToggle;
  }

  return labels.fields[action];
}

function getContentBatchFieldConfig(
  labels: ReturnType<typeof getLabels>,
  action: ContentBatchAction,
  row: ContentRow,
): AdminBatchFieldModalConfig {
  if (action === "rank") {
    return {
      fieldLabel: labels.fields.rank,
      initialValue: row.rank ?? 1,
      type: "number",
    };
  }

  if (action === "isActive") {
    return {
      fieldLabel: labels.activeToggle,
      initialValue: row.isActive,
      options: [
        { label: labels.active, value: "true" },
        { label: labels.inactive, value: "false" },
      ],
      type: "boolean",
    };
  }

  if (
    action === "contentEn" ||
    action === "contentTh" ||
    action === "relatedSku"
  ) {
    return {
      fieldLabel: labels.fields[action],
      initialValue:
        action === "relatedSku" ? row.relatedSku.join(", ") : row[action],
      type: "textarea",
    };
  }

  return {
    fieldLabel: labels.fields[action],
    initialValue: row[action] ?? "",
    type: "text",
  };
}

function getLabels(locale: Locale, section: ContentSection) {
  const isArticle = section === "articles";

  return locale === "th"
    ? {
        title: isArticle ? "บทความและสาระน่ารู้" : "ข่าวสารและกิจกรรม",
        add: isArticle ? "เพิ่มบทความ" : "เพิ่มข่าวสารและกิจกรรม",
        addTitle: isArticle ? "เพิ่มบทความ" : "เพิ่มข่าวสารและกิจกรรม",
        editTitle: isArticle ? "แก้ไขบทความ" : "แก้ไขข่าวสารและกิจกรรม",
        deleteTitle: isArticle ? "ยืนยันการลบบทความ" : "ยืนยันการลบข่าวสารและกิจกรรม",
        deleteBody: (topic: string) =>
          isArticle
            ? `ยืนยันการลบบทความ ${topic} อีกครั้งก่อนดำเนินการ`
            : `ยืนยันการลบข่าวสารและกิจกรรม ${topic} อีกครั้งก่อนดำเนินการ`,
        formSection: isArticle ? "รายละเอียดบทความ" : "รายละเอียดข่าวสารและกิจกรรม",
        fields: {
          topicTh: "ชื่อภาษาไทย",
          topicEn: "ชื่อภาษาอังกฤษ",
          slug: "Slug",
          rank: "ลำดับ",
          imgUrl: "รูปภาพและวิดีโอ",
          relatedSku: "Related SKU",
          contentTh: "เนื้อหาภาษาไทย",
          contentEn: "เนื้อหาภาษาอังกฤษ",
        },
        columns: {
          topicTh: "ชื่อภาษาไทย",
          topicEn: "ชื่อภาษาอังกฤษ",
          slug: "Slug",
          createdAt: "วันที่สร้าง",
          createdBy: "สร้างโดย",
          updatedAt: "วันที่อัปเดต",
          updatedBy: "อัปเดตโดย",
          status: "สถานะ",
          actions: "จัดการ",
        },
        search: {
          empty: isArticle ? "ไม่พบบทความ" : "ไม่พบข่าวสารและกิจกรรม",
          placeholder: isArticle ? "ค้นหาบทความ" : "ค้นหาข่าวสารและกิจกรรม",
          search: "ค้นหา",
          tooShort: "พิมพ์อย่างน้อย 3 ตัวอักษร",
        },
        productSearch: {
          button: "ค้นหา",
          empty: "ไม่พบสินค้า",
          placeholder: "ค้นหาสินค้า",
          tooShort: "พิมพ์อย่างน้อย 3 ตัวอักษร",
        },
        richTextPlaceholder: "พิมพ์เนื้อหาแบบ rich text",
        addMedia: "อัปโหลดรูปภาพหรือวิดีโอ",
        uploadingMedia: "กำลังอัปโหลด...",
        uploadError: "ไม่สามารถอัปโหลดไฟล์ได้",
        noMedia: "ยังไม่มีไฟล์",
        noRelatedSku: "ยังไม่มีสินค้าเกี่ยวข้อง",
        active: "แสดง",
        inactive: "ซ่อน",
        activeToggle: "การแสดงผล",
        cancel: "ยกเลิก",
        delete: "ลบ",
        deleting: "กำลังลบ...",
        edit: "แก้ไข",
        empty: isArticle ? "ไม่พบข้อมูลบทความ" : "ไม่พบข้อมูลข่าวสารและกิจกรรม",
        error: "ไม่สามารถบันทึกข้อมูลได้",
        fetchError: isArticle
          ? "ไม่สามารถโหลดข้อมูลบทความได้"
          : "ไม่สามารถโหลดข้อมูลข่าวสารและกิจกรรมได้",
        nextPage: "หน้าถัดไป",
        previousPage: "หน้าก่อนหน้า",
        rowsPerPage: "จำนวนต่อหน้า",
        save: "บันทึก",
        saving: "กำลังบันทึก...",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
        bulkEditTitle: (fieldLabel: string) =>
          `${isArticle ? "แก้ไขหลายบทความ" : "แก้ไขหลายข่าวสารและกิจกรรม"}: ${fieldLabel}`,
        bulkEditDescription: (count: number, fieldLabel: string) =>
          isArticle
            ? `อัปเดตฟิลด์ ${fieldLabel} ของบทความพร้อมกัน ${count} รายการ`
            : `อัปเดตฟิลด์ ${fieldLabel} ของข่าวสารและกิจกรรมพร้อมกัน ${count} รายการ`,
      }
    : {
        title: isArticle ? "Articles & Knowledge" : "News & Activities",
        add: isArticle ? "Add Article" : "Add News & Activity",
        addTitle: isArticle ? "Add Article" : "Add News & Activity",
        editTitle: isArticle ? "Edit Article" : "Edit News & Activity",
        deleteTitle: isArticle ? "Confirm Article Delete" : "Confirm News Delete",
        deleteBody: (topic: string) =>
          isArticle
            ? `Please confirm deleting article ${topic}.`
            : `Please confirm deleting news item ${topic}.`,
        formSection: isArticle ? "Article Details" : "News Details",
        fields: {
          topicTh: "Thai Name",
          topicEn: "English Name",
          slug: "Slug",
          rank: "Rank",
          imgUrl: "Images & Videos",
          relatedSku: "Related SKU",
          contentTh: "Thai Content",
          contentEn: "English Content",
        },
        columns: {
          topicTh: "Thai Name",
          topicEn: "English Name",
          slug: "Slug",
          createdAt: "Created At",
          createdBy: "Created By",
          updatedAt: "Updated At",
          updatedBy: "Updated By",
          status: "Status",
          actions: "Actions",
        },
        search: {
          empty: isArticle ? "No articles found" : "No news found",
          placeholder: isArticle ? "Search articles" : "Search news & activities",
          search: "Search",
          tooShort: "Enter at least 3 characters",
        },
        productSearch: {
          button: "Search",
          empty: "No products found",
          placeholder: "Search products",
          tooShort: "Enter at least 3 characters",
        },
        richTextPlaceholder: "Type rich text content",
        addMedia: "Upload images or videos",
        uploadingMedia: "Uploading...",
        uploadError: "Unable to upload file",
        noMedia: "No media uploaded",
        noRelatedSku: "No related products selected",
        active: "Visible",
        inactive: "Hidden",
        activeToggle: "Visibility",
        cancel: "Cancel",
        delete: "Delete",
        deleting: "Deleting...",
        edit: "Edit",
        empty: isArticle ? "No articles found" : "No news and activities found",
        error: "Unable to save data",
        fetchError: isArticle ? "Unable to load articles" : "Unable to load news and activities",
        nextPage: "Next page",
        previousPage: "Previous page",
        rowsPerPage: "Rows per page",
        save: "Save",
        saving: "Saving...",
        selectAll: "Select all rows",
        selectRow: "Select row",
        bulkEditTitle: (fieldLabel: string) =>
          `${isArticle ? "Bulk edit articles" : "Bulk edit news and activities"}: ${fieldLabel}`,
        bulkEditDescription: (count: number, fieldLabel: string) =>
          isArticle
            ? `Update ${fieldLabel} for ${count} articles at once.`
            : `Update ${fieldLabel} for ${count} news and activity entries at once.`,
      };
}
