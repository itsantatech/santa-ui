"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useMemo, useState } from "react";
import {
  AdminCategoryChip,
  AdminDataTable,
  type AdminDataTableColumn,
  AdminStatusBadge,
} from "./admin-data-table";
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

export function CategoriesSectionClient({
  activeTab,
  categories,
  categoryOptions,
  locale,
  page,
  subCategories,
}: {
  activeTab: TabValue;
  categories: CategoryListResponse | null;
  categoryOptions: CategoryOption[];
  locale: Locale;
  page: number;
  subCategories: SubCategoryListResponse | null;
}) {
  const labels = getLabels(locale);
  const router = useRouter();
  const [mode, setMode] = useState<Mode | null>(null);
  const categoryRows = categories?.items ?? [];
  const subCategoryRows = subCategories?.items ?? [];

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
    [labels, locale],
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
    [labels],
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
          getRowId={(row) => row.code}
          pagination={{
            currentPage: categories?.meta.page ?? page,
            totalPages: categories?.meta.totalPages ?? 1,
            getPageHref: (nextPage) =>
              `/${locale}/admin?section=categories&tab=categories&page=${nextPage}`,
            previousLabel: labels.common.previousPage,
            nextLabel: labels.common.nextPage,
          }}
          rows={categoryRows}
          selectAllLabel={labels.common.selectAll}
          selectRowLabel={(row) => `${labels.common.selectRow} ${row.code}`}
        />
      ) : (
        <AdminDataTable
          columns={subCategoryColumns}
          emptyLabel={subCategories ? labels.subCategory.empty : labels.common.fetchError}
          getRowId={(row) => row.code}
          pagination={{
            currentPage: subCategories?.meta.page ?? page,
            totalPages: subCategories?.meta.totalPages ?? 1,
            getPageHref: (nextPage) =>
              `/${locale}/admin?section=categories&tab=sub-categories&page=${nextPage}`,
            previousLabel: labels.common.previousPage,
            nextLabel: labels.common.nextPage,
          }}
          rows={subCategoryRows}
          selectAllLabel={labels.common.selectAll}
          selectRowLabel={(row) => `${labels.common.selectRow} ${row.code}`}
        />
      )}

      {mode?.type === "add-category" ? (
        <CategoryModal
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
            await fetch(`/api/admin/categories/${encodeURIComponent(mode.row.code)}`, {
              method: "DELETE",
            });
            setMode(null);
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
            await fetch(`/api/admin/sub-categories/${encodeURIComponent(mode.row.code)}`, {
              method: "DELETE",
            });
            setMode(null);
            router.refresh();
          }}
          title={labels.subCategory.deleteTitle}
        />
      ) : null}
    </div>
  );
}

function CategoryModal({
  initialRow,
  labels,
  onClose,
  onSaved,
}: {
  initialRow?: CategoryRow;
  labels: ReturnType<typeof getLabels>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CategoryFormState>(() =>
    initialRow
      ? {
          coverImgUrl: initialRow.coverImgUrl ?? "",
          descriptionEn: initialRow.descriptionEn ?? "",
          descriptionTh: initialRow.descriptionTh ?? "",
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
          iconImgUrl: "",
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
      iconImgUrl: form.iconImgUrl,
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
      setError(labels.common.error);
      return;
    }

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
              label={labels.category.fields.iconImgUrl}
              onChange={(value) =>
                setForm((current) => ({ ...current, iconImgUrl: value }))
              }
              required
              value={form.iconImgUrl}
            />
            <LabeledInput
              label={labels.category.fields.coverImgUrl}
              onChange={(value) =>
                setForm((current) => ({ ...current, coverImgUrl: value }))
              }
              value={form.coverImgUrl}
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
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
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
      setError(labels.common.error);
      return;
    }

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
      <span>{label}</span>
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
