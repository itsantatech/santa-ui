"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import { getErrorMessage } from "@/lib/api-error";
import { showErrorToast, showSuccessToast } from "@/lib/toast";
import { getTransactionToastCopy } from "@/lib/transaction-toast";
import {
  AdminBatchFieldModal,
  type AdminBatchFieldModalConfig,
} from "./admin-batch-field-modal";
import {
  AdminCategoryChip,
  AdminDataTable,
  type AdminDataTableColumn,
  type AdminDataTableContextAction,
  AdminStatusBadge,
} from "./admin-data-table";
import { useAdminTableEditRequest } from "./admin-table-events";
import type {
  CategoryListResponse,
  SubCategoryListResponse,
} from "./categories-section";
import type { Locale } from "@/lib/i18n";

type CategoryRow = NonNullable<CategoryListResponse>["items"][number];
type SubCategoryRow = NonNullable<SubCategoryListResponse>["items"][number];
type CategoryOption = {
  code: string;
  nameTh: string;
  nameEn: string;
};

type TabValue = "categories" | "sub-categories";
type Mode =
  | { type: "add-category" }
  | { row: CategoryRow; type: "edit-category" }
  | { row: CategoryRow; type: "delete-category" }
  | { type: "add-sub-category" }
  | { row: SubCategoryRow; type: "edit-sub-category" }
  | { row: SubCategoryRow; type: "delete-sub-category" };

type CategoryFormState = {
  coverImgUrl: string;
  descriptionEn: string;
  descriptionTh: string;
  googleIconName: string;
  iconImgUrl: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: string;
  slug: string;
};

type SubCategoryFormState = {
  categoryCode: string;
  descriptionEn: string;
  descriptionTh: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: string;
  slug: string;
};

type CategoryBatchAction =
  | "coverImgUrl"
  | "descriptionEn"
  | "descriptionTh"
  | "iconImgUrl"
  | "isActive"
  | "nameEn"
  | "nameTh"
  | "rank"
  | "slug";

type SubCategoryBatchAction =
  | "categoryCode"
  | "descriptionEn"
  | "descriptionTh"
  | "isActive"
  | "nameEn"
  | "nameTh"
  | "rank"
  | "slug";

type UploadedFileResponse = {
  signedUrl?: string;
  url?: string;
};

const googleCategoryIconOptions = [
  "home_repair_service",
  "inventory_2",
  "category",
  "biotech",
  "science",
  "construction",
  "precision_manufacturing",
  "memory",
  "devices",
  "computer",
  "electrical_services",
  "handyman",
  "health_and_safety",
  "labs",
  "monitor_heart",
  "shield",
  "local_shipping",
  "storefront",
  "factory",
  "rocket_launch",
  "settings",
  "build",
  "battery_charging_full",
  "medical_services",
];

export function CategoriesSectionClient({
  activeTab,
  categories,
  categoryOptions,
  currentPageSize,
  locale,
  page,
  subCategories,
}: {
  activeTab: TabValue;
  categories: CategoryListResponse | null;
  categoryOptions: CategoryOption[];
  currentPageSize: number;
  locale: Locale;
  page: number;
  subCategories: SubCategoryListResponse | null;
}) {
  const labels = getLabels(locale);
  const toastCopy = getTransactionToastCopy(locale);
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const [bulkCategoryRows, setBulkCategoryRows] = useState<CategoryRow[]>([]);
  const [bulkCategoryAction, setBulkCategoryAction] =
    useState<CategoryBatchAction | null>(null);
  const [bulkSubCategoryRows, setBulkSubCategoryRows] = useState<SubCategoryRow[]>([]);
  const [bulkSubCategoryAction, setBulkSubCategoryAction] =
    useState<SubCategoryBatchAction | null>(null);
  const categoryRows = categories?.items ?? [];
  const subCategoryRows = subCategories?.items ?? [];
  const categoryContextMenuActions = useMemo<AdminDataTableContextAction[]>(
    () => [
      { id: "nameTh", label: labels.category.fields.nameTh },
      { id: "nameEn", label: labels.category.fields.nameEn },
      { id: "slug", label: labels.category.fields.slug },
      { id: "rank", label: labels.category.fields.rank },
      { id: "iconImgUrl", label: labels.category.fields.iconImgUrl },
      { id: "coverImgUrl", label: labels.category.fields.coverImgUrl },
      { id: "descriptionTh", label: labels.category.fields.descriptionTh },
      { id: "descriptionEn", label: labels.category.fields.descriptionEn },
      { id: "isActive", label: labels.common.activeToggle },
    ],
    [labels],
  );
  const subCategoryContextMenuActions = useMemo<AdminDataTableContextAction[]>(
    () => [
      { id: "nameTh", label: labels.subCategory.fields.nameTh },
      { id: "nameEn", label: labels.subCategory.fields.nameEn },
      { id: "slug", label: labels.subCategory.fields.slug },
      { id: "rank", label: labels.subCategory.fields.rank },
      { id: "categoryCode", label: labels.subCategory.fields.category },
      { id: "descriptionTh", label: labels.subCategory.fields.descriptionTh },
      { id: "descriptionEn", label: labels.subCategory.fields.descriptionEn },
      { id: "isActive", label: labels.common.activeToggle },
    ],
    [labels],
  );

  useAdminTableEditRequest("categories", (actionId, rowIds) => {
    const matchedRows = categoryRows.filter((row) => rowIds.includes(row.code));

    if (matchedRows.length === 1 && actionId === "edit") {
      setMode({ row: matchedRows[0], type: "edit-category" });
      return;
    }

    if (matchedRows.length > 0) {
      setBulkCategoryAction(actionId as CategoryBatchAction);
      setBulkCategoryRows(matchedRows);
    }
  });

  useAdminTableEditRequest("sub-categories", (actionId, rowIds) => {
    const matchedRows = subCategoryRows.filter((row) => rowIds.includes(row.code));

    if (matchedRows.length === 1 && actionId === "edit") {
      setMode({ row: matchedRows[0], type: "edit-sub-category" });
      return;
    }

    if (matchedRows.length > 0) {
      setBulkSubCategoryAction(actionId as SubCategoryBatchAction);
      setBulkSubCategoryRows(matchedRows);
    }
  });

  const categoryColumns = useMemo<AdminDataTableColumn<CategoryRow>[]>(
    () => [
      {
        key: "nameTh",
        header: labels.category.columns.nameTh,
        className: "admin-table-name-column admin-table-name-column-double",
        render: (row) => (
          <div className="admin-resource-name-cell">
            <CategoryIconPreview src={row.iconImgUrl} title={row.nameTh} />
            <strong>{row.nameTh}</strong>
          </div>
        ),
      },
      {
        key: "nameEn",
        header: labels.category.columns.nameEn,
        className: "admin-table-name-column admin-table-name-column-double",
        render: (row) => <strong>{row.nameEn}</strong>,
      },
      {
        key: "code",
        header: labels.category.columns.code,
        className: "admin-table-code-column",
        render: (row) => <strong>{row.code}</strong>,
      },
      {
        key: "subCategoryCount",
        header: labels.category.columns.subCategoryCount,
        className: "admin-table-number-column",
        render: (row) => row.subCategoryCount ?? 0,
      },
      {
        key: "status",
        header: labels.common.status,
        className: "admin-table-status-column",
        render: (row) => (
          <AdminStatusBadge
            label={row.isActive ? labels.common.active : labels.common.inactive}
            tone={row.isActive ? "active" : "inactive"}
          />
        ),
      },
      {
        key: "actions",
        header: labels.common.actions,
        className: "admin-table-actions-column",
        render: (row) => (
          <RowActions
            deleteLabel={labels.common.delete}
            editLabel={labels.common.edit}
            onDelete={() => setMode({ row, type: "delete-category" })}
            onEdit={() => setMode({ row, type: "edit-category" })}
          />
        ),
      },
    ],
    [labels],
  );

  const subCategoryColumns = useMemo<AdminDataTableColumn<SubCategoryRow>[]>(
    () => [
      {
        key: "nameTh",
        header: labels.subCategory.columns.nameTh,
        className: "admin-table-name-column admin-table-name-column-double",
        render: (row) => (
          <div className="admin-resource-name-cell admin-resource-name-cell-plain">
            <strong>{row.nameTh}</strong>
          </div>
        ),
      },
      {
        key: "nameEn",
        header: labels.subCategory.columns.nameEn,
        className: "admin-table-name-column admin-table-name-column-double",
        render: (row) => <strong>{row.nameEn}</strong>,
      },
      {
        key: "code",
        header: labels.subCategory.columns.code,
        className: "admin-table-code-column",
        render: (row) => <strong>{row.code}</strong>,
      },
      {
        key: "category",
        header: labels.subCategory.columns.category,
        className: "admin-table-category-column",
        render: (row) =>
          row.category ? (
            <AdminCategoryChip>
              {locale === "th" ? row.category.nameTh : row.category.nameEn}
            </AdminCategoryChip>
          ) : (
            <span className="admin-table-muted">{row.categoryCode}</span>
          ),
      },
      {
        key: "skuCount",
        header: labels.subCategory.columns.skuCount,
        className: "admin-table-number-column",
        render: (row) => row.skuCount ?? 0,
      },
      {
        key: "status",
        header: labels.common.status,
        className: "admin-table-status-column",
        render: (row) => (
          <AdminStatusBadge
            label={row.isActive ? labels.common.active : labels.common.inactive}
            tone={row.isActive ? "active" : "inactive"}
          />
        ),
      },
      {
        key: "actions",
        header: labels.common.actions,
        className: "admin-table-actions-column",
        render: (row) => (
          <RowActions
            deleteLabel={labels.common.delete}
            editLabel={labels.common.edit}
            onDelete={() => setMode({ row, type: "delete-sub-category" })}
            onEdit={() => setMode({ row, type: "edit-sub-category" })}
          />
        ),
      },
    ],
    [labels, locale],
  );

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{labels.title}</h1>
      <div className="admin-resource-toolbar">
        <AdminSectionTabs
          activeTab={activeTab}
          locale={locale}
          section="categories"
          tabs={[
            { key: "categories", label: labels.tabs.categories },
            { key: "sub-categories", label: labels.tabs.subCategories },
          ]}
        />
        <button
          className="admin-product-add-button"
          onClick={() =>
            setMode(
              activeTab === "categories"
                ? { type: "add-category" }
                : { type: "add-sub-category" },
            )
          }
          type="button"
        >
          <span aria-hidden="true">+</span>
          {activeTab === "categories" ? labels.addCategory : labels.addSubCategory}
        </button>
      </div>

      {activeTab === "categories" ? (
        <AdminDataTable
          columns={categoryColumns}
          emptyLabel={categories ? labels.category.empty : labels.common.fetchError}
          contextMenuActions={categoryContextMenuActions}
          getRowId={(row) => row.code}
          pagination={{
            currentPage: categories?.meta.page ?? page,
            currentPageSize,
            totalPages: categories?.meta.totalPages ?? 1,
            getPageHref: (nextPage) =>
              createCategoriesPageHref(locale, "categories", nextPage, currentPageSize),
            previousLabel: labels.common.previousPage,
            nextLabel: labels.common.nextPage,
            rowsPerPageLabel: labels.common.rowsPerPage,
          }}
          rows={categoryRows}
          selectAllLabel={labels.common.selectAll}
          selectRowLabel={(row) => `${labels.common.selectRow} ${row.code}`}
          tableId="categories"
        />
      ) : (
        <AdminDataTable
          columns={subCategoryColumns}
          emptyLabel={subCategories ? labels.subCategory.empty : labels.common.fetchError}
          contextMenuActions={subCategoryContextMenuActions}
          getRowId={(row) => row.code}
          pagination={{
            currentPage: subCategories?.meta.page ?? page,
            currentPageSize,
            totalPages: subCategories?.meta.totalPages ?? 1,
            getPageHref: (nextPage) =>
              createCategoriesPageHref(
                locale,
                "sub-categories",
                nextPage,
                currentPageSize,
              ),
            previousLabel: labels.common.previousPage,
            nextLabel: labels.common.nextPage,
            rowsPerPageLabel: labels.common.rowsPerPage,
          }}
          rows={subCategoryRows}
          selectAllLabel={labels.common.selectAll}
          selectRowLabel={(row) => `${labels.common.selectRow} ${row.code}`}
          tableId="sub-categories"
        />
      )}

      {mode?.type === "add-category" ? (
        <CategoryModal
          locale={locale}
          labels={labels}
          onClose={() => setMode(null)}
          onSaved={() => {
            setMode(null);
            router.refresh();
          }}
        />
      ) : null}
      {mode?.type === "edit-category" ? (
        <CategoryModal
          initialRow={mode.row}
          locale={locale}
          labels={labels}
          onClose={() => setMode(null)}
          onSaved={() => {
            setMode(null);
            router.refresh();
          }}
        />
      ) : null}
      {mode?.type === "delete-category" ? (
        <DeleteModal
          body={labels.category.deleteBody(mode.row.nameTh)}
          onClose={() => setMode(null)}
          onConfirm={async () => {
            const response = await fetch(`/api/admin/categories/${encodeURIComponent(mode.row.code)}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              const message = await getErrorMessage(response, labels.common.error);
              showErrorToast(toastCopy.error, message);
              throw new Error(message);
            }

            setMode(null);
            showSuccessToast(toastCopy.deleted);
            router.refresh();
          }}
          title={labels.category.deleteTitle}
        />
      ) : null}
      {mode?.type === "add-sub-category" ? (
        <SubCategoryModal
          categoryOptions={categoryOptions}
          labels={labels}
          locale={locale}
          onClose={() => setMode(null)}
          onSaved={() => {
            setMode(null);
            router.refresh();
          }}
        />
      ) : null}
      {mode?.type === "edit-sub-category" ? (
        <SubCategoryModal
          categoryOptions={categoryOptions}
          initialRow={mode.row}
          labels={labels}
          locale={locale}
          onClose={() => setMode(null)}
          onSaved={() => {
            setMode(null);
            router.refresh();
          }}
        />
      ) : null}
      {mode?.type === "delete-sub-category" ? (
        <DeleteModal
          body={labels.subCategory.deleteBody(mode.row.nameTh)}
          onClose={() => setMode(null)}
          onConfirm={async () => {
            const response = await fetch(`/api/admin/sub-categories/${encodeURIComponent(mode.row.code)}`, {
              method: "DELETE",
            });

            if (!response.ok) {
              const message = await getErrorMessage(response, labels.common.error);
              showErrorToast(toastCopy.error, message);
              throw new Error(message);
            }

            setMode(null);
            showSuccessToast(toastCopy.deleted);
            router.refresh();
          }}
          title={labels.subCategory.deleteTitle}
        />
      ) : null}
      {bulkCategoryRows.length > 0 && bulkCategoryAction ? (
        <AdminBatchFieldModal
          cancelLabel={labels.common.cancel}
          config={getCategoryBatchFieldConfig(labels, bulkCategoryAction, bulkCategoryRows[0])}
          description={labels.category.bulkEditDescription(
            bulkCategoryRows.length,
            getCategoryBatchFieldLabel(labels, bulkCategoryAction),
          )}
          errorMessage={labels.common.error}
          items={bulkCategoryRows.map((row) => row.code)}
          onClose={() => {
            setBulkCategoryAction(null);
            setBulkCategoryRows([]);
          }}
          onSubmit={async (value) => {
            const responses = await Promise.all(
              bulkCategoryRows.map((row) =>
                fetch(`/api/admin/categories/${encodeURIComponent(row.code)}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify(
                    buildCategoryPayload(row, bulkCategoryAction, value),
                  ),
                }),
              ),
            );

            const failedResponse = responses.find((response) => !response.ok);

            if (failedResponse) {
              const message = await getErrorMessage(failedResponse, labels.common.error);
              showErrorToast(toastCopy.error, message);
              throw new Error(message);
            }

            setBulkCategoryAction(null);
            setBulkCategoryRows([]);
            showSuccessToast(toastCopy.updated);
            router.refresh();
          }}
          saveLabel={labels.common.save}
          savingLabel={labels.common.saving}
          title={labels.category.bulkEditTitle(
            getCategoryBatchFieldLabel(labels, bulkCategoryAction),
          )}
        />
      ) : null}
      {bulkSubCategoryRows.length > 0 && bulkSubCategoryAction ? (
        <AdminBatchFieldModal
          cancelLabel={labels.common.cancel}
          description={labels.subCategory.bulkEditDescription(
            bulkSubCategoryRows.length,
            getSubCategoryBatchFieldLabel(labels, bulkSubCategoryAction),
          )}
          config={getSubCategoryBatchFieldConfig(
            labels,
            bulkSubCategoryAction,
            bulkSubCategoryRows[0],
          )}
          errorMessage={labels.common.error}
          items={bulkSubCategoryRows.map((row) => row.code)}
          onClose={() => {
            setBulkSubCategoryAction(null);
            setBulkSubCategoryRows([]);
          }}
          onSubmit={async (value) => {
            const responses = await Promise.all(
              bulkSubCategoryRows.map((row) =>
                fetch(`/api/admin/sub-categories/${encodeURIComponent(row.code)}`, {
                  method: "PATCH",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify(
                    buildSubCategoryPayload(row, bulkSubCategoryAction, value),
                  ),
                }),
              ),
            );

            const failedResponse = responses.find((response) => !response.ok);

            if (failedResponse) {
              const message = await getErrorMessage(failedResponse, labels.common.error);
              showErrorToast(toastCopy.error, message);
              throw new Error(message);
            }

            setBulkSubCategoryAction(null);
            setBulkSubCategoryRows([]);
            showSuccessToast(toastCopy.updated);
            router.refresh();
          }}
          saveLabel={labels.common.save}
          savingLabel={labels.common.saving}
          title={labels.subCategory.bulkEditTitle(
            getSubCategoryBatchFieldLabel(labels, bulkSubCategoryAction),
          )}
        />
      ) : null}
    </div>
  );
}

function createCategoriesPageHref(
  locale: Locale,
  tab: TabValue,
  page: number,
  pageSize: number,
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    section: "categories",
    tab,
  });

  return `/${locale}/admin?${searchParams.toString()}`;
}

function buildCategoryPayload(
  row: CategoryRow,
  action: CategoryBatchAction,
  value: boolean | number | string,
) {
  const next = {
    coverImgUrl: row.coverImgUrl ?? undefined,
    descriptionEn: row.descriptionEn ?? undefined,
    descriptionTh: row.descriptionTh ?? undefined,
    iconImgUrl: row.iconImgUrl ?? "",
    isActive: row.isActive,
    nameEn: row.nameEn,
    nameTh: row.nameTh,
    rank: row.rank ?? 1,
    slug: row.slug,
  };

  if (action === "rank") {
    next.rank = Number(value || 1);
  } else if (action === "isActive") {
    next.isActive = Boolean(value);
  } else {
    next[action] = String(value);
  }

  return {
    ...next,
    seoDescriptionEn: next.descriptionEn || next.nameEn,
    seoDescriptionTh: next.descriptionTh || next.nameTh,
    seoTitleEn: next.nameEn,
    seoTitleTh: next.nameTh,
  };
}

function buildSubCategoryPayload(
  row: SubCategoryRow,
  action: SubCategoryBatchAction,
  value: boolean | number | string,
) {
  const next = {
    categoryCode: row.categoryCode,
    descriptionEn: row.descriptionEn ?? undefined,
    descriptionTh: row.descriptionTh ?? undefined,
    isActive: row.isActive,
    nameEn: row.nameEn,
    nameTh: row.nameTh,
    rank: row.rank ?? 1,
    slug: row.slug,
  };

  if (action === "rank") {
    next.rank = Number(value || 1);
  } else if (action === "isActive") {
    next.isActive = Boolean(value);
  } else {
    next[action] = String(value);
  }

  return {
    ...next,
    seoDescriptionEn: next.descriptionEn || next.nameEn,
    seoDescriptionTh: next.descriptionTh || next.nameTh,
    seoTitleEn: next.nameEn,
    seoTitleTh: next.nameTh,
  };
}

function getCategoryBatchFieldLabel(
  labels: ReturnType<typeof getLabels>,
  action: CategoryBatchAction,
) {
  if (action === "isActive") {
    return labels.common.activeToggle;
  }

  return labels.category.fields[action];
}

function getSubCategoryBatchFieldLabel(
  labels: ReturnType<typeof getLabels>,
  action: SubCategoryBatchAction,
) {
  if (action === "isActive") {
    return labels.common.activeToggle;
  }

  if (action === "categoryCode") {
    return labels.subCategory.fields.category;
  }

  return labels.subCategory.fields[action];
}

function getCategoryBatchFieldConfig(
  labels: ReturnType<typeof getLabels>,
  action: CategoryBatchAction,
  row: CategoryRow,
): AdminBatchFieldModalConfig {
  if (action === "rank") {
    return {
      fieldLabel: labels.category.fields.rank,
      initialValue: row.rank ?? 1,
      type: "number",
    };
  }

  if (action === "isActive") {
    return {
      fieldLabel: labels.common.activeToggle,
      initialValue: row.isActive,
      options: [
        { label: labels.common.active, value: "true" },
        { label: labels.common.inactive, value: "false" },
      ],
      type: "boolean",
    };
  }

  if (action === "descriptionEn" || action === "descriptionTh") {
    return {
      fieldLabel: labels.category.fields[action],
      initialValue: row[action] ?? "",
      type: "textarea",
    };
  }

  return {
    fieldLabel: getCategoryBatchFieldLabel(labels, action),
    initialValue: row[action] ?? "",
    type: "text",
  };
}

function getSubCategoryBatchFieldConfig(
  labels: ReturnType<typeof getLabels>,
  action: SubCategoryBatchAction,
  row: SubCategoryRow,
): AdminBatchFieldModalConfig {
  if (action === "rank") {
    return {
      fieldLabel: labels.subCategory.fields.rank,
      initialValue: row.rank ?? 1,
      type: "number",
    };
  }

  if (action === "isActive") {
    return {
      fieldLabel: labels.common.activeToggle,
      initialValue: row.isActive,
      options: [
        { label: labels.common.active, value: "true" },
        { label: labels.common.inactive, value: "false" },
      ],
      type: "boolean",
    };
  }

  if (action === "descriptionEn" || action === "descriptionTh") {
    return {
      fieldLabel: labels.subCategory.fields[action],
      initialValue: row[action] ?? "",
      type: "textarea",
    };
  }

  return {
    fieldLabel: getSubCategoryBatchFieldLabel(labels, action),
    initialValue: row[action] ?? "",
    type: "text",
  };
}

function CategoryModal({
  initialRow,
  labels,
  locale,
  onClose,
  onSaved,
}: {
  initialRow?: CategoryRow;
  labels: ReturnType<typeof getLabels>;
  locale: Locale;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toastCopy = getTransactionToastCopy(locale);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(() =>
    initialRow
      ? {
          coverImgUrl: initialRow.coverImgUrl ?? "",
          descriptionEn: initialRow.descriptionEn ?? "",
          descriptionTh: initialRow.descriptionTh ?? "",
          googleIconName: "",
          iconImgUrl: initialRow.iconImgUrl ?? "",
          isActive: initialRow.isActive,
          nameEn: initialRow.nameEn,
          nameTh: initialRow.nameTh,
          rank: String(initialRow.rank ?? 1),
          slug: initialRow.slug,
        }
      : {
          coverImgUrl: "",
          descriptionEn: "",
          descriptionTh: "",
          googleIconName: googleCategoryIconOptions[0] ?? "",
          iconImgUrl: "",
          isActive: true,
          nameEn: "",
          nameTh: "",
          rank: "1",
          slug: "",
        },
  );
  const [isUploadingIcon, setIsUploadingIcon] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    let iconImgUrl = form.iconImgUrl;

    if (form.googleIconName) {
      setIsUploadingIcon(true);

      try {
        iconImgUrl = await uploadGoogleIconAsset(form.googleIconName);
      } catch (uploadError) {
        setIsSaving(false);
        setIsUploadingIcon(false);
        const message =
          uploadError instanceof Error &&
          uploadError.message !== "upload-failed" &&
          uploadError.message !== "missing-upload-url" &&
          uploadError.message !== "canvas-unavailable" &&
          uploadError.message !== "blob-unavailable"
            ? uploadError.message
            : labels.common.error;
        setError(message);
        showErrorToast(toastCopy.error, message);
        return;
      }

      setIsUploadingIcon(false);
    }

    const payload = {
      rank: Number(form.rank || 1),
      nameTh: form.nameTh,
      nameEn: form.nameEn,
      descriptionTh: form.descriptionTh || undefined,
      descriptionEn: form.descriptionEn || undefined,
      slug: form.slug,
      iconImgUrl,
      coverImgUrl: form.coverImgUrl || undefined,
      seoTitleTh: form.nameTh,
      seoTitleEn: form.nameEn,
      seoDescriptionTh: form.descriptionTh || form.nameTh,
      seoDescriptionEn: form.descriptionEn || form.nameEn,
      isActive: form.isActive,
    };
    const response = await fetch(
      initialRow
        ? `/api/admin/categories/${encodeURIComponent(initialRow.code)}`
        : "/api/admin/categories",
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
      const message = await getErrorMessage(response, labels.common.error);
      setError(message);
      showErrorToast(toastCopy.error, message);
      return;
    }

    showSuccessToast(initialRow ? toastCopy.updated : toastCopy.created);
    onSaved();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{initialRow ? labels.category.editTitle : labels.category.addTitle}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>{labels.category.formSection}</legend>
            <LabeledInput
              label={labels.category.fields.nameTh}
              onChange={(value) => setForm((current) => ({ ...current, nameTh: value }))}
              required
              value={form.nameTh}
            />
            <LabeledInput
              label={labels.category.fields.nameEn}
              onChange={(value) => setForm((current) => ({ ...current, nameEn: value }))}
              required
              value={form.nameEn}
            />
            <LabeledInput
              label={labels.category.fields.slug}
              onChange={(value) => setForm((current) => ({ ...current, slug: value }))}
              required
              value={form.slug}
            />
            <LabeledInput
              label={labels.category.fields.rank}
              onChange={(value) => setForm((current) => ({ ...current, rank: value }))}
              type="number"
              value={form.rank}
            />
            <LabeledInput
              label={labels.category.fields.coverImgUrl}
              onChange={(value) =>
                setForm((current) => ({ ...current, coverImgUrl: value }))
              }
              value={form.coverImgUrl}
            />
            <GoogleIconPicker
              currentIconUrl={form.iconImgUrl}
              label={labels.category.fields.iconImgUrl}
              onChange={(value) =>
                setForm((current) => ({ ...current, googleIconName: value }))
              }
              selectedIconName={form.googleIconName}
            />
            <LabeledTextarea
              label={labels.category.fields.descriptionTh}
              onChange={(value) =>
                setForm((current) => ({ ...current, descriptionTh: value }))
              }
              value={form.descriptionTh}
            />
            <LabeledTextarea
              label={labels.category.fields.descriptionEn}
              onChange={(value) =>
                setForm((current) => ({ ...current, descriptionEn: value }))
              }
              value={form.descriptionEn}
            />
            <ToggleField
              checked={form.isActive}
              label={labels.common.activeToggle}
              onChange={(checked) =>
                setForm((current) => ({ ...current, isActive: checked }))
              }
            />
          </fieldset>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">
              {labels.common.cancel}
            </button>
            <button className="admin-product-add-button" disabled={isSaving || isUploadingIcon} type="submit">
              {isSaving ? labels.common.saving : labels.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function SubCategoryModal({
  categoryOptions,
  initialRow,
  labels,
  locale,
  onClose,
  onSaved,
}: {
  categoryOptions: CategoryOption[];
  initialRow?: SubCategoryRow;
  labels: ReturnType<typeof getLabels>;
  locale: Locale;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toastCopy = getTransactionToastCopy(locale);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<SubCategoryFormState>(() =>
    initialRow
      ? {
          categoryCode: initialRow.categoryCode,
          descriptionEn: initialRow.descriptionEn ?? "",
          descriptionTh: initialRow.descriptionTh ?? "",
          isActive: initialRow.isActive,
          nameEn: initialRow.nameEn,
          nameTh: initialRow.nameTh,
          rank: String(initialRow.rank ?? 1),
          slug: initialRow.slug,
        }
      : {
          categoryCode: categoryOptions[0]?.code ?? "",
          descriptionEn: "",
          descriptionTh: "",
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
      categoryCode: form.categoryCode,
      rank: Number(form.rank || 1),
      nameTh: form.nameTh,
      nameEn: form.nameEn,
      descriptionTh: form.descriptionTh || undefined,
      descriptionEn: form.descriptionEn || undefined,
      slug: form.slug,
      seoTitleTh: form.nameTh,
      seoTitleEn: form.nameEn,
      seoDescriptionTh: form.descriptionTh || form.nameTh,
      seoDescriptionEn: form.descriptionEn || form.nameEn,
      isActive: form.isActive,
    };
    const response = await fetch(
      initialRow
        ? `/api/admin/sub-categories/${encodeURIComponent(initialRow.code)}`
        : "/api/admin/sub-categories",
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
      const message = await getErrorMessage(response, labels.common.error);
      setError(message);
      showErrorToast(toastCopy.error, message);
      return;
    }

    showSuccessToast(initialRow ? toastCopy.updated : toastCopy.created);
    onSaved();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>
            {initialRow ? labels.subCategory.editTitle : labels.subCategory.addTitle}
          </h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>{labels.subCategory.formSection}</legend>
            <LabeledSelect
              label={labels.subCategory.fields.category}
              onChange={(value) =>
                setForm((current) => ({ ...current, categoryCode: value }))
              }
              options={categoryOptions.map((option) => ({
                label: locale === "th" ? option.nameTh : option.nameEn,
                value: option.code,
              }))}
              value={form.categoryCode}
            />
            <LabeledInput
              label={labels.subCategory.fields.rank}
              onChange={(value) => setForm((current) => ({ ...current, rank: value }))}
              type="number"
              value={form.rank}
            />
            <LabeledInput
              label={labels.subCategory.fields.nameTh}
              onChange={(value) => setForm((current) => ({ ...current, nameTh: value }))}
              required
              value={form.nameTh}
            />
            <LabeledInput
              label={labels.subCategory.fields.nameEn}
              onChange={(value) => setForm((current) => ({ ...current, nameEn: value }))}
              required
              value={form.nameEn}
            />
            <LabeledInput
              label={labels.subCategory.fields.slug}
              onChange={(value) => setForm((current) => ({ ...current, slug: value }))}
              required
              value={form.slug}
            />
            <div />
            <LabeledTextarea
              label={labels.subCategory.fields.descriptionTh}
              onChange={(value) =>
                setForm((current) => ({ ...current, descriptionTh: value }))
              }
              value={form.descriptionTh}
            />
            <LabeledTextarea
              label={labels.subCategory.fields.descriptionEn}
              onChange={(value) =>
                setForm((current) => ({ ...current, descriptionEn: value }))
              }
              value={form.descriptionEn}
            />
            <ToggleField
              checked={form.isActive}
              label={labels.common.activeToggle}
              onChange={(checked) =>
                setForm((current) => ({ ...current, isActive: checked }))
              }
            />
          </fieldset>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">
              {labels.common.cancel}
            </button>
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
              {isSaving ? labels.common.saving : labels.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteModal({
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
            ยกเลิก
          </button>
          <button
            className="admin-product-danger-button"
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              try {
                await onConfirm();
              } finally {
                setIsDeleting(false);
              }
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

function RowActions({
  deleteLabel,
  editLabel,
  onDelete,
  onEdit,
}: {
  deleteLabel: string;
  editLabel: string;
  onDelete: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="admin-table-actions">
      <button aria-label={editLabel} className="admin-table-icon-button" onClick={onEdit} type="button">
        <span className="material-symbols-outlined" aria-hidden="true">
          edit
        </span>
      </button>
      <button
        aria-label={deleteLabel}
        className="admin-table-icon-button"
        onClick={onDelete}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          delete
        </span>
      </button>
    </div>
  );
}

function LabeledInput({
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
      <span>
        {label}
        {required ? <span className="admin-field-required" aria-hidden="true">*</span> : null}
      </span>
      <input
        onChange={(event) => onChange(event.target.value)}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function LabeledTextarea({
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

function GoogleIconPicker({
  currentIconUrl,
  label,
  onChange,
  selectedIconName,
}: {
  currentIconUrl: string;
  label: string;
  onChange: (value: string) => void;
  selectedIconName: string;
}) {
  const [query, setQuery] = useState("");
  const filteredIcons = googleCategoryIconOptions.filter((iconName) =>
    iconName.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <div className="admin-product-field admin-product-field-wide admin-category-icon-picker">
      <span>{label}</span>
      <div className="admin-category-icon-picker-shell">
        <div className="admin-category-icon-picker-header">
          <div className="admin-category-icon-preview-card">
            {selectedIconName ? (
              <span className="material-symbols-outlined admin-category-icon-preview-symbol" aria-hidden="true">
                {selectedIconName}
              </span>
            ) : currentIconUrl ? (
              <span
                aria-hidden="true"
                className="admin-resource-thumbnail admin-category-icon-preview-image"
                style={{ backgroundImage: `url(${currentIconUrl})` }}
              />
            ) : (
              <span className="material-symbols-outlined admin-category-icon-preview-symbol" aria-hidden="true">
                image_not_supported
              </span>
            )}
          </div>
          <div className="admin-category-icon-picker-copy">
            <strong>{selectedIconName || "Current icon"}</strong>
            <span>{currentIconUrl || "Choose a Google icon to generate an image."}</span>
          </div>
        </div>
        <input
          className="admin-product-multiselect-input admin-category-icon-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Google icons"
          type="search"
          value={query}
        />
        <div className="admin-category-icon-grid">
          {filteredIcons.map((iconName) => {
            const isSelected = iconName === selectedIconName;

            return (
              <button
                className={`admin-category-icon-option${isSelected ? " is-selected" : ""}`}
                key={iconName}
                onClick={() => onChange(iconName)}
                type="button"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  {iconName}
                </span>
                <span>{iconName}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LabeledSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  value: string;
}) {
  return (
    <label className="admin-product-field">
      <span>{label}</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function ToggleField({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="admin-product-toggle">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      <span>{label}</span>
    </label>
  );
}

function CategoryIconPreview({ src, title }: { src: string | null; title: string }) {
  return (
    <span
      aria-hidden="true"
      className="admin-resource-thumbnail"
      style={src ? { backgroundImage: `url(${src})` } : undefined}
      title={title}
    />
  );
}

async function uploadGoogleIconAsset(iconName: string) {
  const file = await createGoogleIconImageFile(iconName);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("visibility", "public");
  formData.append("folder", "categories/icons");

  const response = await fetch("/api/admin/files/upload", {
    body: formData,
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("upload-failed");
  }

  const result = (await response.json()) as UploadedFileResponse;
  const nextUrl = result.url ?? result.signedUrl;

  if (!nextUrl) {
    throw new Error("missing-upload-url");
  }

  return nextUrl;
}

async function createGoogleIconImageFile(iconName: string) {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("canvas-unavailable");
  }

  await document.fonts.load('80px "Material Symbols Outlined"');

  context.clearRect(0, 0, size, size);
  context.fillStyle = "#fff7ed";
  context.beginPath();
  context.roundRect(8, 8, size - 16, size - 16, 18);
  context.fill();
  context.strokeStyle = "#fdba74";
  context.lineWidth = 2;
  context.stroke();
  context.fillStyle = "#c2410c";
  context.font = '80px "Material Symbols Outlined"';
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(iconName, size / 2, size / 2);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  );

  if (!blob) {
    throw new Error("blob-unavailable");
  }

  return new File([blob], `${iconName}.png`, { type: "image/png" });
}

function AdminSectionTabs({
  activeTab,
  locale,
  section,
  tabs,
}: {
  activeTab: string;
  locale: Locale;
  section: string;
  tabs: { key: string; label: string }[];
}) {
  return (
    <nav className="admin-section-tabs" aria-label={`${section} tabs`}>
      {tabs.map((tab) => (
        <Link
          className={
            tab.key === activeTab
              ? "admin-section-tab admin-section-tab-active"
              : "admin-section-tab"
          }
          href={`/${locale}/admin?section=${section}&tab=${tab.key}`}
          key={tab.key}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

function getLabels(locale: Locale) {
  if (locale === "th") {
    return {
      title: "หมวดหมู่",
      tabs: {
        categories: "หมวดหมู่",
        subCategories: "หมวดหมู่ย่อย",
      },
      addCategory: "เพิ่มหมวดหมู่",
      addSubCategory: "เพิ่มหมวดหมู่ย่อย",
      common: {
        actions: "จัดการ",
        active: "ACTIVE",
        activeToggle: "การแสดงผล",
        cancel: "ยกเลิก",
        delete: "ลบ",
        edit: "แก้ไข",
        error: "ไม่สามารถบันทึกข้อมูลได้",
        fetchError: "ไม่สามารถโหลดข้อมูลได้",
        inactive: "INACTIVE",
        nextPage: "หน้าถัดไป",
        previousPage: "หน้าก่อนหน้า",
        rowsPerPage: "จำนวนต่อหน้า",
        save: "บันทึก",
        saving: "กำลังบันทึก...",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
        status: "สถานะ",
      },
      category: {
        addTitle: "เพิ่มหมวดหมู่",
        columns: {
          code: "Category ID",
          nameEn: "ชื่อภาษาอังกฤษ",
          nameTh: "ชื่อภาษาไทย",
          subCategoryCount: "จำนวนหมวดย่อย",
        },
        deleteBody: (name: string) => `ยืนยันการลบหมวดหมู่ ${name} อีกครั้งก่อนดำเนินการ`,
        deleteTitle: "ยืนยันการลบหมวดหมู่",
        editTitle: "แก้ไขหมวดหมู่",
        empty: "ไม่พบข้อมูลหมวดหมู่",
        bulkEditTitle: (fieldLabel: string) => `แก้ไขหลายหมวดหมู่: ${fieldLabel}`,
        bulkEditDescription: (count: number, fieldLabel: string) =>
          `อัปเดตฟิลด์ ${fieldLabel} พร้อมกัน ${count} รายการ`,
        fields: {
          coverImgUrl: "Cover Image URL",
          descriptionEn: "คำอธิบายภาษาอังกฤษ",
          descriptionTh: "คำอธิบายภาษาไทย",
          iconImgUrl: "Icon URL",
          nameEn: "ชื่อภาษาอังกฤษ",
          nameTh: "ชื่อภาษาไทย",
          rank: "ลำดับ",
          slug: "Slug",
        },
        formSection: "รายละเอียดหมวดหมู่",
      },
      subCategory: {
        addTitle: "เพิ่มหมวดหมู่ย่อย",
        columns: {
          category: "หมวดหมู่",
          code: "Sub Category ID",
          nameEn: "ชื่อภาษาอังกฤษ",
          nameTh: "ชื่อภาษาไทย",
          skuCount: "จำนวน SKU",
        },
        deleteBody: (name: string) =>
          `ยืนยันการลบหมวดหมู่ย่อย ${name} อีกครั้งก่อนดำเนินการ`,
        deleteTitle: "ยืนยันการลบหมวดหมู่ย่อย",
        editTitle: "แก้ไขหมวดหมู่ย่อย",
        empty: "ไม่พบข้อมูลหมวดหมู่ย่อย",
        bulkEditTitle: (fieldLabel: string) => `แก้ไขหลายหมวดหมู่ย่อย: ${fieldLabel}`,
        bulkEditDescription: (count: number, fieldLabel: string) =>
          `อัปเดตฟิลด์ ${fieldLabel} พร้อมกัน ${count} รายการ`,
        fields: {
          category: "หมวดหมู่หลัก",
          descriptionEn: "คำอธิบายภาษาอังกฤษ",
          descriptionTh: "คำอธิบายภาษาไทย",
          nameEn: "ชื่อภาษาอังกฤษ",
          nameTh: "ชื่อภาษาไทย",
          rank: "ลำดับ",
          slug: "Slug",
        },
        formSection: "รายละเอียดหมวดหมู่ย่อย",
      },
    };
  }

  return {
    title: "Categories",
    tabs: {
      categories: "Categories",
      subCategories: "Sub Categories",
    },
    addCategory: "Add Category",
    addSubCategory: "Add Sub Category",
    common: {
      actions: "Actions",
      active: "ACTIVE",
      activeToggle: "Visible",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      error: "Unable to save data",
      fetchError: "Unable to load data",
      inactive: "INACTIVE",
      nextPage: "Next page",
      previousPage: "Previous page",
      rowsPerPage: "Rows per page",
      save: "Save",
      saving: "Saving...",
      selectAll: "Select all rows",
      selectRow: "Select row",
      status: "Status",
    },
    category: {
      addTitle: "Add Category",
      columns: {
        code: "Category ID",
        nameEn: "English Name",
        nameTh: "Thai Name",
        subCategoryCount: "Sub Categories",
      },
      deleteBody: (name: string) => `Please confirm deleting category ${name}.`,
      deleteTitle: "Confirm Category Delete",
      editTitle: "Edit Category",
      empty: "No categories found",
      bulkEditTitle: (fieldLabel: string) => `Bulk edit categories: ${fieldLabel}`,
      bulkEditDescription: (count: number, fieldLabel: string) =>
        `Update ${fieldLabel} for ${count} categories at once.`,
      fields: {
        coverImgUrl: "Cover Image URL",
        descriptionEn: "English Description",
        descriptionTh: "Thai Description",
        iconImgUrl: "Icon URL",
        nameEn: "English Name",
        nameTh: "Thai Name",
        rank: "Rank",
        slug: "Slug",
      },
      formSection: "Category Details",
    },
    subCategory: {
      addTitle: "Add Sub Category",
      columns: {
        category: "Category",
        code: "Sub Category ID",
        nameEn: "English Name",
        nameTh: "Thai Name",
        skuCount: "SKU Count",
      },
      deleteBody: (name: string) => `Please confirm deleting sub-category ${name}.`,
      deleteTitle: "Confirm Sub Category Delete",
      editTitle: "Edit Sub Category",
      empty: "No sub-categories found",
      bulkEditTitle: (fieldLabel: string) => `Bulk edit sub categories: ${fieldLabel}`,
      bulkEditDescription: (count: number, fieldLabel: string) =>
        `Update ${fieldLabel} for ${count} sub categories at once.`,
      fields: {
        category: "Parent Category",
        descriptionEn: "English Description",
        descriptionTh: "Thai Description",
        nameEn: "English Name",
        nameTh: "Thai Name",
        rank: "Rank",
        slug: "Slug",
      },
      formSection: "Sub Category Details",
    },
  };
}
