"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { type FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
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

function stripHtmlToPlainText(value: string) {
  return value
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>\s*<p[^>]*>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .trim();
}

type HomeSettingRow = {
  id: string;
  name: string;
  headlineTh: string;
  headlineEn: string;
  contentTh?: string | null;
  contentEn?: string | null;
  imgUrl?: string[] | null;
  isActive: boolean;
};

type AboutSettingRow = {
  id: string;
  headlineTh: string;
  headlineEn: string;
  contentTh: string;
  contentEn: string;
  imgUrl: string[];
};

type UploadedFileResponse = {
  signedUrl?: string;
  url?: string;
};

type SocialContactRow = {
  code: string;
  rank: number;
  name: string;
  logoUrl: string;
  contactUrl: string;
  isActive: boolean;
};

type FaqRow = {
  id: string;
  rank: number;
  questionTh?: string | null;
  questionEn?: string | null;
  answerTh?: string | null;
  answerEn?: string | null;
  url?: string | null;
  categoryCode?: string | null;
  isActive: boolean;
  createdAt?: string;
  createdBy?: string;
  updatedAt?: string;
  updatedBy?: string;
};

type CategoryOption = {
  code: string;
  nameTh: string;
  nameEn: string;
};

type AdminUserRow = {
  id: string;
  username: string;
  displayName: string;
  email: string;
  role: string;
  isActive: boolean;
};

type UserRoleOption = string;

type TabValue = "users" | "home-content" | "about" | "social-media" | "faq";
type PaginationMeta = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

type UserBatchAction =
  "displayName" | "email" | "isActive" | "role" | "username";
type FaqBatchAction =
  | "answerEn"
  | "answerTh"
  | "categoryCode"
  | "isActive"
  | "questionEn"
  | "questionTh"
  | "rank"
  | "url";

export function SettingsSectionClient({
  aboutSettings,
  activeTab,
  canManageUsers = false,
  categories,
  faqMeta,
  faqs,
  homeSettings,
  locale,
  page,
  pageSize,
  socialContacts,
  userMeta,
  users,
}: {
  aboutSettings: AboutSettingRow[];
  activeTab: TabValue;
  categories: CategoryOption[];
  canManageUsers?: boolean;
  faqMeta?: PaginationMeta;
  faqs: FaqRow[];
  homeSettings: HomeSettingRow[];
  locale: Locale;
  page: number;
  pageSize: number;
  socialContacts: SocialContactRow[];
  userMeta?: PaginationMeta;
  users: AdminUserRow[];
}) {
  const labels = getLabels(locale);
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [bulkEditingUsers, setBulkEditingUsers] = useState<AdminUserRow[]>([]);
  const [bulkEditingUserAction, setBulkEditingUserAction] =
    useState<UserBatchAction | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqRow | null>(null);
  const [bulkEditingFaqs, setBulkEditingFaqs] = useState<FaqRow[]>([]);
  const [bulkEditingFaqAction, setBulkEditingFaqAction] =
    useState<FaqBatchAction | null>(null);
  const [deletingFaq, setDeletingFaq] = useState<FaqRow | null>(null);
  const [isCreateFaqOpen, setIsCreateFaqOpen] = useState(false);
  const categoryNameByCode = useMemo(
    () =>
      new Map(
        categories.map((category) => [
          category.code,
          locale === "th" ? category.nameTh : category.nameEn,
        ]),
      ),
    [categories, locale],
  );

  const userContextMenuActions = useMemo<AdminDataTableContextAction[]>(
    () => [
      { id: "displayName", label: labels.user.fields.displayName },
      { id: "username", label: labels.user.fields.username },
      { id: "email", label: labels.user.fields.email },
      { id: "role", label: labels.user.fields.role },
      { id: "isActive", label: labels.common.activeToggle },
    ],
    [labels],
  );
  const faqContextMenuActions = useMemo<AdminDataTableContextAction[]>(
    () => [
      { id: "rank", label: labels.faq.fields.rank },
      { id: "questionTh", label: labels.faq.fields.questionTh },
      { id: "questionEn", label: labels.faq.fields.questionEn },
      { id: "answerTh", label: labels.faq.fields.answerTh },
      { id: "answerEn", label: labels.faq.fields.answerEn },
      { id: "url", label: labels.faq.fields.url },
      { id: "categoryCode", label: labels.faq.fields.categoryCode },
      { id: "isActive", label: labels.common.activeToggle },
    ],
    [labels],
  );

  useAdminTableEditRequest("settings-users", (actionId, rowIds) => {
    if (!canManageUsers) {
      return;
    }

    const matchedRows = users.filter((row) => rowIds.includes(row.id));

    if (matchedRows.length === 1 && actionId === "edit") {
      setEditingUser(matchedRows[0]);
      return;
    }

    if (matchedRows.length > 0) {
      setBulkEditingUserAction(actionId as UserBatchAction);
      setBulkEditingUsers(matchedRows);
    }
  });

  useAdminTableEditRequest("settings-faq", (actionId, rowIds) => {
    const matchedRows = faqs.filter((row) => rowIds.includes(row.id));

    if (matchedRows.length === 1 && actionId === "edit") {
      setEditingFaq(matchedRows[0]);
      return;
    }

    if (matchedRows.length > 0) {
      setBulkEditingFaqAction(actionId as FaqBatchAction);
      setBulkEditingFaqs(matchedRows);
    }
  });
  const userColumns = useMemo<AdminDataTableColumn<AdminUserRow>[]>(
    () => {
      const columns: AdminDataTableColumn<AdminUserRow>[] = [
        {
          key: "displayName",
          header: labels.user.columns.displayName,
          className: "admin-table-name-column admin-table-user-display-name-column",
          render: (row) => <strong>{row.displayName}</strong>,
        },
        {
          key: "username",
          header: labels.user.columns.username,
          className: "admin-table-code-column admin-table-user-username-column",
          render: (row) => row.username,
        },
        {
          key: "email",
          header: labels.user.columns.email,
          className: "admin-table-user-column",
          render: (row) => row.email,
        },
        {
          key: "role",
          header: labels.user.columns.role,
          className: "admin-table-category-column",
          render: (row) => <span className="admin-role-pill">{row.role}</span>,
        },
        {
          key: "status",
          header: labels.user.columns.status,
          className: "admin-table-status-column",
          render: (row) => (
            <AdminStatusBadge
              label={row.isActive ? labels.common.active : labels.common.inactive}
              tone={row.isActive ? "active" : "inactive"}
            />
          ),
        },
      ];

      if (canManageUsers) {
        columns.push({
          key: "actions",
          header: labels.user.columns.actions,
          className: "admin-table-actions-column",
          render: (row) => (
            <div className="admin-table-actions">
              <button
                aria-label={labels.common.edit}
                className="admin-table-icon-button"
                onClick={() => setEditingUser(row)}
                type="button"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  edit
                </span>
              </button>
              <button
                aria-label={labels.common.delete}
                className="admin-table-icon-button"
                onClick={() => setDeletingUser(row)}
                type="button"
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  delete
                </span>
              </button>
            </div>
          ),
        });
      }

      return columns;
    },
    [canManageUsers, labels],
  );
  const faqColumns = useMemo<AdminDataTableColumn<FaqRow>[]>(
    () => [
      {
        key: "rank",
        header: labels.faq.columns.rank,
        className: "admin-table-rank-column admin-table-number-fit-column",
        render: (row) => row.rank,
      },
      {
        key: "questionTh",
        header: labels.faq.columns.questionTh,
        className: "admin-table-name-column admin-table-faq-question-column",
        render: (row) => <strong>{row.questionTh || "-"}</strong>,
      },
      {
        key: "questionEn",
        header: labels.faq.columns.questionEn,
        className: "admin-table-name-column admin-table-faq-question-column",
        render: (row) => row.questionEn || "-",
      },
      {
        key: "url",
        header: labels.faq.columns.url,
        className: "admin-table-slug-column",
        render: (row) => row.url || "-",
      },
      {
        key: "categoryCode",
        header: labels.faq.columns.categoryCode,
        className: "admin-table-category-column admin-table-faq-category-column",
        render: (row) =>
          row.categoryCode ? categoryNameByCode.get(row.categoryCode) ?? row.categoryCode : "-",
      },
      {
        key: "status",
        header: labels.faq.columns.status,
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
        header: labels.faq.columns.actions,
        className: "admin-table-actions-column",
        render: (row) => (
          <div className="admin-table-actions">
            <button
              aria-label={labels.common.edit}
              className="admin-table-icon-button"
              onClick={() => setEditingFaq(row)}
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                edit
              </span>
            </button>
            <button
              aria-label={labels.common.delete}
              className="admin-table-icon-button"
              onClick={() => setDeletingFaq(row)}
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
    [categoryNameByCode, labels],
  );

  const sections = buildHomeSectionCards(homeSettings, labels);
  const aboutCard = buildAboutCard(aboutSettings, labels);

  return (
    <div className="admin-section-panel">
      <h1 id="admin-heading">{labels.title}</h1>
      <nav className="admin-section-tabs" aria-label="settings tabs">
        <Link
          className={
            activeTab === "users"
              ? "admin-section-tab admin-section-tab-active"
              : "admin-section-tab"
          }
          href={`/${locale}/admin?section=settings&tab=users`}
        >
          {labels.tabs.users}
        </Link>
        <Link
          className={
            activeTab === "home-content"
              ? "admin-section-tab admin-section-tab-active"
              : "admin-section-tab"
          }
          href={`/${locale}/admin?section=settings&tab=home-content`}
        >
          {labels.tabs.homeContent}
        </Link>
        <Link
          className={
            activeTab === "about"
              ? "admin-section-tab admin-section-tab-active"
              : "admin-section-tab"
          }
          href={`/${locale}/admin?section=settings&tab=about`}
        >
          {labels.tabs.about}
        </Link>
        <Link
          className={
            activeTab === "faq"
              ? "admin-section-tab admin-section-tab-active"
              : "admin-section-tab"
          }
          href={`/${locale}/admin?section=settings&tab=faq`}
        >
          {labels.tabs.faq}
        </Link>
        <Link
          className={
            activeTab === "social-media"
              ? "admin-section-tab admin-section-tab-active"
              : "admin-section-tab"
          }
          href={`/${locale}/admin?section=settings&tab=social-media`}
        >
          {labels.tabs.socialMedia}
        </Link>
      </nav>

      {activeTab === "users" ? (
        <>
          {canManageUsers ? (
            <div className="admin-resource-toolbar">
              <div />
              <button
                className="admin-product-add-button"
                onClick={() => setIsCreateUserOpen(true)}
                type="button"
              >
                <span aria-hidden="true">+</span>
                {labels.user.add}
              </button>
            </div>
          ) : null}
          <AdminDataTable
            columns={userColumns}
            emptyLabel={labels.user.empty}
            contextMenuActions={canManageUsers ? userContextMenuActions : undefined}
            getRowId={(row) => row.id}
            pagination={{
              currentPage: userMeta?.page ?? page,
              currentPageSize: userMeta?.pageSize ?? pageSize,
              totalPages: userMeta?.totalPages ?? 1,
              getPageHref: (nextPage) =>
                createSettingsPageHref(locale, "users", nextPage, userMeta?.pageSize ?? pageSize),
              previousLabel: labels.common.previousPage,
              nextLabel: labels.common.nextPage,
              rowsPerPageLabel: labels.common.rowsPerPage,
            }}
            rows={users}
            selectAllLabel={labels.common.selectAll}
            selectRowLabel={(row) => `${labels.common.selectRow} ${row.username}`}
            tableId="settings-users"
          />
          {canManageUsers && isCreateUserOpen ? (
            <UserModal
              labels={labels}
              onClose={() => setIsCreateUserOpen(false)}
              onSaved={() => {
                setIsCreateUserOpen(false);
                router.refresh();
              }}
            />
          ) : null}
          {canManageUsers && editingUser ? (
            <UserModal
              initialUser={editingUser}
              labels={labels}
              onClose={() => setEditingUser(null)}
              onSaved={() => {
                setEditingUser(null);
                router.refresh();
              }}
            />
          ) : null}
          {canManageUsers && deletingUser ? (
            <DeleteUserModal
              body={labels.user.deleteBody(deletingUser.username)}
              labels={labels}
              onClose={() => setDeletingUser(null)}
              onConfirm={async () => {
                await fetch(`/api/admin/admin-users/${encodeURIComponent(deletingUser.id)}`, {
                  method: "DELETE",
                });
                setDeletingUser(null);
                router.refresh();
              }}
              title={labels.user.deleteTitle}
            />
          ) : null}
          {canManageUsers && bulkEditingUsers.length > 0 && bulkEditingUserAction ? (
            <AdminBatchFieldModal
              cancelLabel={labels.common.cancel}
              config={getUserBatchFieldConfig(
                labels,
                bulkEditingUserAction,
                bulkEditingUsers[0],
              )}
              description={labels.user.bulkEditDescription(
                bulkEditingUsers.length,
                getUserBatchFieldLabel(labels, bulkEditingUserAction),
              )}
              errorMessage={labels.common.error}
              items={bulkEditingUsers.map((row) => row.username)}
              onClose={() => {
                setBulkEditingUserAction(null);
                setBulkEditingUsers([]);
              }}
              onSubmit={async (value) => {
                const responses = await Promise.all(
                  bulkEditingUsers.map((row) =>
                    fetch(`/api/admin/admin-users/${encodeURIComponent(row.id)}`, {
                      method: "PATCH",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify(buildUserPayload(row, bulkEditingUserAction, value)),
                    }),
                  ),
                );

                if (responses.some((response) => !response.ok)) {
                  throw new Error("bulk-edit-failed");
                }

                setBulkEditingUserAction(null);
                setBulkEditingUsers([]);
                router.refresh();
              }}
              saveLabel={labels.common.save}
              savingLabel={labels.common.saving}
              title={labels.user.bulkEditTitle(
                getUserBatchFieldLabel(labels, bulkEditingUserAction),
              )}
            />
          ) : null}
        </>
      ) : null}

      {activeTab === "home-content" ? (
        <div className="admin-settings-card-stack">
          {sections.map((section) => (
            <HomeContentCard
              card={section}
              key={`${section.resource}-${section.id || section.name}`}
              labels={labels}
            />
          ))}
        </div>
      ) : null}

      {activeTab === "about" ? (
        <div className="admin-settings-card-stack">
          <AboutSettingsCard aboutSetting={aboutCard} labels={labels} />
        </div>
      ) : null}

      {activeTab === "social-media" ? (
        <SocialMediaCard labels={labels} locale={locale} socialContacts={socialContacts} />
      ) : null}

      {activeTab === "faq" ? (
        <>
          <div className="admin-resource-toolbar">
            <div />
            <button
              className="admin-product-add-button"
              onClick={() => setIsCreateFaqOpen(true)}
              type="button"
            >
              <span aria-hidden="true">+</span>
              {labels.faq.add}
            </button>
          </div>
          <AdminDataTable
            columns={faqColumns}
            emptyLabel={labels.faq.empty}
            contextMenuActions={faqContextMenuActions}
            getRowId={(row) => row.id}
            pagination={{
              currentPage: faqMeta?.page ?? page,
              currentPageSize: faqMeta?.pageSize ?? pageSize,
              totalPages: faqMeta?.totalPages ?? 1,
              getPageHref: (nextPage) =>
                createSettingsPageHref(locale, "faq", nextPage, faqMeta?.pageSize ?? pageSize),
              previousLabel: labels.common.previousPage,
              nextLabel: labels.common.nextPage,
              rowsPerPageLabel: labels.common.rowsPerPage,
            }}
            rows={faqs}
            selectAllLabel={labels.common.selectAll}
            selectRowLabel={(row) => `${labels.common.selectRow} ${row.questionTh ?? row.id}`}
            tableId="settings-faq"
          />
          {isCreateFaqOpen ? (
            <FaqModal
              categories={categories}
              labels={labels}
              locale={locale}
              onClose={() => setIsCreateFaqOpen(false)}
              onSaved={() => {
                setIsCreateFaqOpen(false);
                router.refresh();
              }}
            />
          ) : null}
          {editingFaq ? (
            <FaqModal
              categories={categories}
              initialFaq={editingFaq}
              labels={labels}
              locale={locale}
              onClose={() => setEditingFaq(null)}
              onSaved={() => {
                setEditingFaq(null);
                router.refresh();
              }}
            />
          ) : null}
          {deletingFaq ? (
            <DeleteFaqModal
              body={labels.faq.deleteBody(deletingFaq.questionTh ?? deletingFaq.id)}
              labels={labels}
              onClose={() => setDeletingFaq(null)}
              onConfirm={async () => {
                await fetch(`/api/admin/faqs/${encodeURIComponent(deletingFaq.id)}`, {
                  method: "DELETE",
                });
                setDeletingFaq(null);
                router.refresh();
              }}
              title={labels.faq.deleteTitle}
            />
          ) : null}
          {bulkEditingFaqs.length > 0 && bulkEditingFaqAction ? (
            <AdminBatchFieldModal
              cancelLabel={labels.common.cancel}
              config={getFaqBatchFieldConfig(
                labels,
                bulkEditingFaqAction,
                bulkEditingFaqs[0],
              )}
              description={labels.faq.bulkEditDescription(
                bulkEditingFaqs.length,
                getFaqBatchFieldLabel(labels, bulkEditingFaqAction),
              )}
              errorMessage={labels.common.error}
              items={bulkEditingFaqs.map((row) => row.questionTh ?? row.id)}
              onClose={() => {
                setBulkEditingFaqAction(null);
                setBulkEditingFaqs([]);
              }}
              onSubmit={async (value) => {
                const responses = await Promise.all(
                  bulkEditingFaqs.map((row) =>
                    fetch(`/api/admin/faqs/${encodeURIComponent(row.id)}`, {
                      method: "PATCH",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify(buildFaqPayload(row, bulkEditingFaqAction, value)),
                    }),
                  ),
                );

                if (responses.some((response) => !response.ok)) {
                  throw new Error("bulk-edit-failed");
                }

                setBulkEditingFaqAction(null);
                setBulkEditingFaqs([]);
                router.refresh();
              }}
              saveLabel={labels.common.save}
              savingLabel={labels.common.saving}
              title={labels.faq.bulkEditTitle(
                getFaqBatchFieldLabel(labels, bulkEditingFaqAction),
              )}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}

function HomeContentCard({
  card,
  labels,
}: {
  card: ReturnType<typeof buildHomeSectionCards>[number];
  labels: ReturnType<typeof getLabels>;
}) {
  const router = useRouter();
  const sectionKey = normalizeHomeSectionKey(card.name);
  const supportsSectionImage = sectionKey === "hero" || sectionKey === "about";
  const homeImageHelper =
    sectionKey === "hero"
      ? labels.home.uploadHeroImageHelper
      : labels.home.uploadAboutImageHelper;
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(() => ({
    contentEn: stripHtmlToPlainText(card.contentEn),
    contentTh: stripHtmlToPlainText(card.contentTh),
    headlineEn: stripHtmlToPlainText(card.headlineEn),
    headlineTh: stripHtmlToPlainText(card.headlineTh),
    imageUrl: card.imgUrl[0] ?? "",
    isActive: card.isActive,
  }));

  async function handleImageSelected(files: FileList | null) {
    const file = files?.[0];

    if (!file) {
      return;
    }

    if (!isMediaFile(file)) {
      setError(labels.home.validation.imageType);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("visibility", "public");
      formData.append("folder", "settings/home-sections");

      const response = await fetch("/api/admin/files/upload", {
        body: formData,
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(labels.common.error);
      }

      const result = (await response.json()) as UploadedFileResponse;
      const nextUrl = result.url ?? result.signedUrl;

      if (!nextUrl) {
        throw new Error(labels.common.error);
      }

      setForm((current) => ({ ...current, imageUrl: nextUrl }));
    } catch {
      setError(labels.common.error);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const headlineTh = stripHtmlToPlainText(form.headlineTh);
    const headlineEn = stripHtmlToPlainText(form.headlineEn);
    const contentTh = stripHtmlToPlainText(form.contentTh);
    const contentEn = stripHtmlToPlainText(form.contentEn);
    const headlineThLength = headlineTh.length;
    const headlineEnLength = headlineEn.length;
    const contentThLength = contentTh.length;
    const contentEnLength = contentEn.length;

    if (headlineThLength > 150 || headlineEnLength > 150) {
      setError(labels.home.validation.headlineMax);
      return;
    }

    if (contentThLength > 500 || contentEnLength > 500) {
      setError(labels.home.validation.contentMax);
      return;
    }

    setIsSaving(true);
    setError("");

    const payload =
      card.resource === "home-section-settings"
        ? {
            name: card.name,
            headlineTh,
            headlineEn,
            contentTh,
            contentEn,
            ...(supportsSectionImage
              ? { imgUrl: form.imageUrl ? [form.imageUrl] : [] }
              : {}),
            isActive: form.isActive,
          }
        : {
            headlineTh,
            headlineEn,
            contentTh,
            contentEn,
            imgUrl: card.imgUrl,
          };

    const path = card.id
      ? `/api/admin/${card.resource}/${card.id}`
      : `/api/admin/${card.resource}`;
    const response = await fetch(path, {
      method: card.id ? "PATCH" : "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.common.error);
      return;
    }

    router.refresh();
  }

  return (
    <form className="admin-settings-card" onSubmit={handleSubmit}>
      <div className="admin-settings-card-header">
        <h2>{card.title}</h2>
      </div>
      <div className="admin-settings-card-grid admin-settings-about-grid">
        <SettingsTextarea
          label={labels.home.fields.headlineTh}
          maxLength={150}
          onChange={(value) =>
            setForm((current) => ({ ...current, headlineTh: value.slice(0, 150) }))
          }
          placeholder={labels.home.placeholders.headlineTh}
          value={form.headlineTh}
        />
        <SettingsTextarea
          label={labels.home.fields.headlineEn}
          maxLength={150}
          onChange={(value) =>
            setForm((current) => ({ ...current, headlineEn: value.slice(0, 150) }))
          }
          placeholder={labels.home.placeholders.headlineEn}
          value={form.headlineEn}
        />
        <SettingsTextarea
          label={labels.home.fields.contentTh}
          maxLength={500}
          onChange={(value) =>
            setForm((current) => ({ ...current, contentTh: value.slice(0, 500) }))
          }
          placeholder={labels.home.placeholders.contentTh}
          value={form.contentTh}
        />
        <SettingsTextarea
          label={labels.home.fields.contentEn}
          maxLength={500}
          onChange={(value) =>
            setForm((current) => ({ ...current, contentEn: value.slice(0, 500) }))
          }
          placeholder={labels.home.placeholders.contentEn}
          value={form.contentEn}
        />
        {supportsSectionImage ? (
          <div className="admin-settings-about-image-card">
            <div className="admin-settings-about-image-copy">
              <strong>{labels.home.fields.image}</strong>
            </div>
            <div className="admin-upload-actions">
              <input
                accept="image/*,video/mp4,video/quicktime,video/webm,video/x-m4v"
                className="admin-settings-hidden-file-input"
                onChange={(event) => void handleImageSelected(event.target.files)}
                ref={imageInputRef}
                type="file"
              />
              <button
                className="admin-product-secondary-button"
                disabled={isUploading}
                onClick={() => imageInputRef.current?.click()}
                type="button"
              >
                {isUploading ? labels.home.uploadingImage : labels.home.uploadImage}
              </button>
              {form.imageUrl ? (
                <button
                  className="admin-product-secondary-button"
                  onClick={() => setForm((current) => ({ ...current, imageUrl: "" }))}
                  type="button"
                >
                  {labels.home.removeImage}
                </button>
              ) : null}
            </div>
            <p className="admin-upload-helper">{homeImageHelper}</p>
            {form.imageUrl ? (
              <div className="admin-upload-media-grid">
                <div className="admin-upload-preview-card">
                  <div className="admin-upload-preview-frame">
                    {isVideoUrl(form.imageUrl) ? (
                      <video
                        className="admin-upload-preview-video"
                        controls
                        playsInline
                        src={form.imageUrl}
                      />
                    ) : (
                      <Image
                        alt={labels.home.imageAlt}
                        className="admin-upload-preview-image"
                        height={220}
                        src={form.imageUrl}
                        unoptimized
                        width={420}
                      />
                    )}
                  </div>
                  <div className="admin-upload-preview-meta">
                    <a
                      className="admin-upload-preview-link"
                      href={form.imageUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {labels.home.previewImage}
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <p className="admin-upload-empty admin-settings-about-image-empty">
                {labels.home.noImage}
              </p>
            )}
          </div>
        ) : null}
      </div>
      <div className="admin-settings-card-footer">
        {card.resource === "home-section-settings" ? (
          <div className="admin-settings-toggle-card">
            <div className="admin-settings-toggle-copy">
              <strong>{labels.home.toggleTitle}</strong>
              <span>{labels.home.toggleDescription}</span>
            </div>
            <label className="admin-product-toggle admin-settings-toggle-control">
              <input
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                type="checkbox"
              />
              <span>{labels.common.active}</span>
            </label>
          </div>
        ) : (
          <span />
        )}
        <div className="admin-settings-card-actions">
          <button
            className="admin-product-secondary-button"
            onClick={() =>
              setForm({
                contentEn: stripHtmlToPlainText(card.contentEn),
                contentTh: stripHtmlToPlainText(card.contentTh),
                headlineEn: stripHtmlToPlainText(card.headlineEn),
                headlineTh: stripHtmlToPlainText(card.headlineTh),
                imageUrl: card.imgUrl[0] ?? "",
                isActive: card.isActive,
              })
            }
            type="button"
          >
            {labels.common.cancel}
          </button>
          <button
            className="admin-product-add-button"
            disabled={isSaving || isUploading}
            type="submit"
          >
            {isSaving ? labels.common.saving : labels.common.save}
          </button>
        </div>
      </div>
      {error ? <p className="admin-product-form-error">{error}</p> : null}
    </form>
  );
}

function AboutSettingsCard({
  aboutSetting,
  labels,
}: {
  aboutSetting: ReturnType<typeof buildAboutCard>;
  labels: ReturnType<typeof getLabels>;
}) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(() => ({
    contentEn: aboutSetting.contentEn,
    contentTh: aboutSetting.contentTh,
    headlineEn: aboutSetting.headlineEn,
    headlineTh: aboutSetting.headlineTh,
    imageUrls: aboutSetting.imgUrl,
  }));

  async function handleImageSelected(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    const selectedFiles = Array.from(files);

    if (selectedFiles.some((file) => !isMediaFile(file))) {
      setError(labels.about.validation.imageType);
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const uploadedUrls: string[] = [];

      for (const file of selectedFiles) {
        uploadedUrls.push(await uploadAdminMediaFile(file, "settings/about", labels.common.error));
      }

      setForm((current) => ({
        ...current,
        imageUrls: [...current.imageUrls, ...uploadedUrls],
      }));
    } catch {
      setError(labels.common.error);
    } finally {
      setIsUploading(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    const payload = {
      headlineTh: form.headlineTh.trim(),
      headlineEn: form.headlineEn.trim(),
      contentTh: form.contentTh,
      contentEn: form.contentEn,
      imgUrl: form.imageUrls,
    };

    const response = await fetch(
      aboutSetting.id
        ? `/api/admin/about-page-settings/${aboutSetting.id}`
        : "/api/admin/about-page-settings",
      {
        body: JSON.stringify(payload),
        headers: {
          "content-type": "application/json",
        },
        method: aboutSetting.id ? "PATCH" : "POST",
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.common.error);
      return;
    }

    router.refresh();
  }

  return (
    <form className="admin-settings-card" onSubmit={handleSubmit}>
      <div className="admin-settings-card-header">
        <h2>{labels.about.title}</h2>
      </div>
      <div className="admin-settings-card-grid">
        <SettingsTextarea
          label={labels.about.fields.headlineTh}
          maxLength={200}
          onChange={(value) =>
            setForm((current) => ({ ...current, headlineTh: value.slice(0, 200) }))
          }
          placeholder={labels.about.placeholders.headlineTh}
          value={form.headlineTh}
        />
        <SettingsTextarea
          label={labels.about.fields.headlineEn}
          maxLength={200}
          onChange={(value) =>
            setForm((current) => ({ ...current, headlineEn: value.slice(0, 200) }))
          }
          placeholder={labels.about.placeholders.headlineEn}
          value={form.headlineEn}
        />
        <div className="admin-settings-richtext-field admin-settings-about-content-row">
          <RichTextEditor
            label={labels.about.fields.contentTh}
            maxCharacters={5000}
            onChange={(value) => setForm((current) => ({ ...current, contentTh: value }))}
            placeholder={labels.about.placeholders.contentTh}
            value={form.contentTh}
          />
          <span className="admin-settings-field-hint">
            {countRichTextCharacters(form.contentTh)}/5000
          </span>
        </div>
        <div className="admin-settings-richtext-field admin-settings-about-content-row">
          <RichTextEditor
            label={labels.about.fields.contentEn}
            maxCharacters={5000}
            onChange={(value) => setForm((current) => ({ ...current, contentEn: value }))}
            placeholder={labels.about.placeholders.contentEn}
            value={form.contentEn}
          />
          <span className="admin-settings-field-hint">
            {countRichTextCharacters(form.contentEn)}/5000
          </span>
        </div>
        <div className="admin-settings-about-image-card">
          <div className="admin-settings-about-image-copy">
            <strong>{labels.about.fields.image}</strong>
          </div>
          <div className="admin-upload-actions">
            <input
              accept="image/*,video/mp4,video/quicktime,video/webm,video/x-m4v"
              className="admin-settings-hidden-file-input"
              onChange={(event) => void handleImageSelected(event.target.files)}
              multiple
              ref={imageInputRef}
              type="file"
            />
            <button
              className="admin-product-secondary-button"
              disabled={isUploading}
              onClick={() => imageInputRef.current?.click()}
              type="button"
            >
              {isUploading ? labels.about.uploadingImage : labels.about.uploadImage}
            </button>
            {form.imageUrls.length > 0 ? (
              <button
                className="admin-product-secondary-button"
                onClick={() => setForm((current) => ({ ...current, imageUrls: [] }))}
                type="button"
              >
                {labels.about.removeAllImages}
              </button>
            ) : null}
          </div>
          <p className="admin-upload-helper">{labels.about.uploadImageHelper}</p>
          {form.imageUrls.length > 0 ? (
            <div className="admin-upload-media-grid">
              {form.imageUrls.map((imageUrl) => (
                <div className="admin-upload-preview-card" key={imageUrl}>
                  <div className="admin-upload-preview-frame">
                    {isVideoUrl(imageUrl) ? (
                      <video
                        className="admin-upload-preview-video"
                        controls
                        playsInline
                        src={imageUrl}
                      />
                    ) : (
                      <Image
                        alt={labels.about.imageAlt}
                        className="admin-upload-preview-image"
                        height={220}
                        src={imageUrl}
                        unoptimized
                        width={420}
                      />
                    )}
                  </div>
                  <div className="admin-upload-preview-meta admin-upload-preview-meta-actions">
                    <a className="admin-upload-preview-link" href={imageUrl} rel="noreferrer" target="_blank">
                      {labels.about.previewImage}
                    </a>
                    <button
                      className="admin-product-secondary-button"
                      onClick={() =>
                        setForm((current) => ({
                          ...current,
                          imageUrls: current.imageUrls.filter((url) => url !== imageUrl),
                        }))
                      }
                      type="button"
                    >
                      {labels.about.removeImage}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="admin-upload-empty admin-settings-about-image-empty">
              {labels.about.noImage}
            </p>
          )}
        </div>
      </div>
      <div className="admin-settings-card-footer">
        <span />
        <div className="admin-settings-card-actions">
          <button
            className="admin-product-secondary-button"
            onClick={() =>
              setForm({
                contentEn: aboutSetting.contentEn,
                contentTh: aboutSetting.contentTh,
                headlineEn: aboutSetting.headlineEn,
                headlineTh: aboutSetting.headlineTh,
                imageUrls: aboutSetting.imgUrl,
              })
            }
            type="button"
          >
            {labels.common.cancel}
          </button>
          <button
            className="admin-product-add-button"
            disabled={isSaving || isUploading}
            type="submit"
          >
            {isSaving ? labels.common.saving : labels.common.save}
          </button>
        </div>
      </div>
      {error ? <p className="admin-product-form-error">{error}</p> : null}
    </form>
  );
}

function isMediaFile(file: File) {
  return file.type.startsWith("image/") || file.type.startsWith("video/");
}

async function uploadAdminMediaFile(
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

function isVideoUrl(url: string) {
  return /\.(mp4|mov|webm|m4v)(\?|#|$)/i.test(url);
}

function SocialMediaCard({
  labels,
  locale,
  socialContacts,
}: {
  labels: ReturnType<typeof getLabels>;
  locale: Locale;
  socialContacts: SocialContactRow[];
}) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() =>
    Object.fromEntries(
      socialFields.map((field) => [field.key, resolveSocialContactValue(field.key, socialContacts)]),
    ) as Record<(typeof socialFields)[number]["key"], string>,
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    for (const [index, field] of socialFields.entries()) {
      const existing = findSocialContact(field.key, socialContacts);
      const payload = {
        code: existing?.code ?? field.code,
        rank: existing?.rank ?? index + 1,
        name: existing?.name ?? field.name,
        logoUrl: existing?.logoUrl ?? "",
        contactUrl: form[field.key],
        isActive: true,
      };
      const response = await fetch(
        existing
          ? `/api/admin/social-media-contacts/${encodeURIComponent(existing.code)}`
          : "/api/admin/social-media-contacts",
        {
          method: existing ? "PATCH" : "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        setIsSaving(false);
        setError(labels.common.error);
        return;
      }
    }

    setIsSaving(false);
    router.refresh();
  }

  return (
    <form className="admin-settings-social-card" onSubmit={handleSubmit}>
      <div className="admin-settings-card-header">
        <h2>{labels.social.title}</h2>
      </div>
      <div className="admin-settings-social-grid">
        {socialFields.map((field) => (
          <SettingsField
            key={field.key}
            label={locale === "th" ? field.labelTh : field.labelEn}
            onChange={(value) =>
              setForm((current) => ({
                ...current,
                [field.key]: value,
              }))
            }
            value={form[field.key]}
          />
        ))}
      </div>
      <div className="admin-product-modal-actions">
        <button className="admin-product-secondary-button" type="button">
          {labels.common.cancel}
        </button>
        <button className="admin-product-add-button" disabled={isSaving} type="submit">
          {isSaving ? labels.common.saving : labels.common.save}
        </button>
      </div>
      {error ? <p className="admin-product-form-error">{error}</p> : null}
    </form>
  );
}

function UserModal({
  initialUser,
  labels,
  onClose,
  onSaved,
}: {
  initialUser?: AdminUserRow;
  labels: ReturnType<typeof getLabels>;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [roleOptions, setRoleOptions] = useState<UserRoleOption[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const initialRole = initialUser?.role ?? "";
  const [form, setForm] = useState(() => ({
    displayName: initialUser?.displayName ?? "",
    email: initialUser?.email ?? "",
    isActive: initialUser?.isActive ?? true,
    password: "",
    role: initialRole,
    username: initialUser?.username ?? "",
  }));

  useEffect(() => {
    let isMounted = true;

    async function loadRoles() {
      setIsLoadingRoles(true);
      const response = await fetch("/api/admin/admin-users/roles", {
        cache: "no-store",
      });

      if (!isMounted) {
        return;
      }

      if (!response.ok) {
        setError(labels.common.error);
        setIsLoadingRoles(false);
        return;
      }

      const payload = (await response.json()) as string[];
      setRoleOptions(
        currentRoleIsMissing(initialRole, payload) ? [initialRole, ...payload] : payload,
      );
      setForm((current) => ({
        ...current,
        role: current.role || payload[0] || "",
      }));
      setIsLoadingRoles(false);
    }

    void loadRoles();

    return () => {
      isMounted = false;
    };
  }, [initialRole, labels.common.error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      displayName: form.displayName,
      email: form.email,
      isActive: form.isActive,
      password: form.password || undefined,
      role: form.role,
      username: form.username,
    };

    const response = await fetch(
      initialUser
        ? `/api/admin/admin-users/${encodeURIComponent(initialUser.id)}`
        : "/api/admin/admin-users",
      {
        method: initialUser ? "PATCH" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.user.error);
      return;
    }

    onSaved();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{initialUser ? labels.user.editTitle : labels.user.addTitle}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>{labels.user.formSection}</legend>
            <SettingsField
              label={labels.user.fields.displayName}
              onChange={(value) => setForm((current) => ({ ...current, displayName: value }))}
              required
              value={form.displayName}
            />
            <SettingsField
              label={labels.user.fields.username}
              onChange={(value) => setForm((current) => ({ ...current, username: value }))}
              required
              value={form.username}
            />
            <SettingsField
              label={labels.user.fields.email}
              onChange={(value) => setForm((current) => ({ ...current, email: value }))}
              required
              type="email"
              value={form.email}
            />
            <label className="admin-product-field">
              <span>{labels.user.fields.role}</span>
              <select
                disabled={isLoadingRoles}
                onChange={(event) =>
                  setForm((current) => ({ ...current, role: event.target.value }))
                }
                value={form.role}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </label>
            <SettingsField
              label={labels.user.fields.password}
              onChange={(value) => setForm((current) => ({ ...current, password: value }))}
              placeholder={initialUser ? labels.user.passwordHint : undefined}
              required={!initialUser}
              type="password"
              value={form.password}
            />
            <label className="admin-product-toggle">
              <input
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                type="checkbox"
              />
              <span>{labels.common.active}</span>
            </label>
          </fieldset>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">
              {labels.common.cancel}
            </button>
            <button
              className="admin-product-add-button"
              disabled={isSaving || isLoadingRoles || roleOptions.length === 0}
              type="submit"
            >
              {isSaving ? labels.common.saving : labels.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteUserModal({
  body,
  labels,
  onClose,
  onConfirm,
  title,
}: {
  body: string;
  labels: ReturnType<typeof getLabels>;
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
            {labels.common.cancel}
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
            {isDeleting ? labels.user.deleting : labels.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function FaqModal({
  categories,
  initialFaq,
  labels,
  locale,
  onClose,
  onSaved,
}: {
  categories: CategoryOption[];
  initialFaq?: FaqRow;
  labels: ReturnType<typeof getLabels>;
  locale: Locale;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    answerEn: initialFaq?.answerEn ?? "",
    answerTh: initialFaq?.answerTh ?? "",
    categoryCode: initialFaq?.categoryCode ?? "",
    isActive: initialFaq?.isActive ?? true,
    questionEn: initialFaq?.questionEn ?? "",
    questionTh: initialFaq?.questionTh ?? "",
    rank: String(initialFaq?.rank ?? 1),
    url: initialFaq?.url ?? "",
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload = {
      rank: Number(form.rank || 1),
      questionTh: form.questionTh,
      questionEn: form.questionEn,
      answerTh: form.answerTh,
      answerEn: form.answerEn,
      url: form.url || undefined,
      categoryCode: form.categoryCode || undefined,
      isActive: form.isActive,
    };

    const response = await fetch(
      initialFaq ? `/api/admin/faqs/${encodeURIComponent(initialFaq.id)}` : "/api/admin/faqs",
      {
        method: initialFaq ? "PATCH" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.faq.error);
      return;
    }

    onSaved();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal admin-faq-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{initialFaq ? labels.faq.editTitle : labels.faq.addTitle}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form admin-faq-form" onSubmit={handleSubmit}>
          <fieldset>
            <legend>{labels.faq.formSection}</legend>
            <div className="admin-faq-form-grid">
              <div className="admin-faq-top-grid">
                <SettingsField
                  className="admin-faq-rank-field"
                  label={labels.faq.fields.rank}
                  onChange={(value) => setForm((current) => ({ ...current, rank: value }))}
                  type="number"
                  value={form.rank}
                />
                <label className="admin-product-field admin-faq-category-field">
                  <span>{labels.faq.fields.categoryCode}</span>
                  <select
                    onChange={(event) =>
                      setForm((current) => ({ ...current, categoryCode: event.target.value }))
                    }
                    value={form.categoryCode}
                  >
                    <option value="">{labels.faq.fields.categoryPlaceholder}</option>
                    {categories.map((category) => (
                      <option key={category.code} value={category.code}>
                        {category.code} - {locale === "th" ? category.nameTh : category.nameEn}
                      </option>
                    ))}
                  </select>
                </label>
                <SettingsField
                  className="admin-product-field-wide"
                  label={labels.faq.fields.url}
                  onChange={(value) => setForm((current) => ({ ...current, url: value }))}
                  type="url"
                  value={form.url}
                />
              </div>
              <div className="admin-faq-question-grid">
                <SettingsField
                  label={labels.faq.fields.questionTh}
                  onChange={(value) => setForm((current) => ({ ...current, questionTh: value }))}
                  required
                  value={form.questionTh}
                />
                <SettingsField
                  label={labels.faq.fields.questionEn}
                  onChange={(value) => setForm((current) => ({ ...current, questionEn: value }))}
                  required
                  value={form.questionEn}
                />
              </div>
              <div className="admin-faq-answer-grid">
                <RichTextEditor
                  label={labels.faq.fields.answerTh}
                  onChange={(value) => setForm((current) => ({ ...current, answerTh: value }))}
                  placeholder={labels.faq.fields.answerPlaceholder}
                  showToolbar={false}
                  value={form.answerTh}
                />
                <RichTextEditor
                  label={labels.faq.fields.answerEn}
                  onChange={(value) => setForm((current) => ({ ...current, answerEn: value }))}
                  placeholder={labels.faq.fields.answerPlaceholder}
                  showToolbar={false}
                  value={form.answerEn}
                />
              </div>
            </div>
          </fieldset>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions admin-faq-modal-actions">
            <label className="admin-product-toggle admin-faq-toggle">
              <input
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({ ...current, isActive: event.target.checked }))
                }
                type="checkbox"
              />
              <span>{labels.common.active}</span>
            </label>
            <div className="admin-faq-modal-action-buttons">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">
              {labels.common.cancel}
            </button>
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
              {isSaving ? labels.common.saving : labels.common.save}
            </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteFaqModal({
  body,
  labels,
  onClose,
  onConfirm,
  title,
}: {
  body: string;
  labels: ReturnType<typeof getLabels>;
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
            {labels.common.cancel}
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
            {isDeleting ? labels.faq.deleting : labels.common.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsField({
  className,
  label,
  maxLength,
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  className?: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: string;
  value: string;
}) {
  return (
    <label className={className ? `admin-product-field ${className}` : "admin-product-field"}>
      <span>{label}</span>
      <input
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        required={required}
        type={type}
        value={value}
      />
    </label>
  );
}

function SettingsTextarea({
  className,
  label,
  maxLength,
  onChange,
  placeholder,
  value,
}: {
  className?: string;
  label: string;
  maxLength?: number;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className={className ? `admin-product-field ${className}` : "admin-product-field"}>
      <span>{label}</span>
      <textarea
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function buildHomeSectionCards(
  homeSettings: HomeSettingRow[],
  labels: ReturnType<typeof getLabels>,
) {
  const defaultCards = [
    createFallbackHomeCard("hero-banner", labels.home.sectionTitles.hero),
    createFallbackHomeCard("business-unit", labels.home.sectionTitles.businessUnit),
    createFallbackHomeCard("about-santa", labels.home.sectionTitles.about),
    createFallbackHomeCard("brand", labels.home.sectionTitles.brand),
    createFallbackHomeCard("news-activities", labels.home.sectionTitles.news),
    createFallbackHomeCard("recommended-product", labels.home.sectionTitles.recommended),
  ];

  const cardByKey = new Map(
    defaultCards.map((card) => [normalizeHomeSectionKey(card.name), card]),
  );

  homeSettings.forEach((item) => {
    const key = normalizeHomeSectionKey(item.name);
    cardByKey.set(key, {
      contentEn: item.contentEn ?? "",
      contentTh: item.contentTh ?? "",
      headlineEn: item.headlineEn,
      headlineTh: item.headlineTh,
      id: item.id,
      imgUrl: item.imgUrl ?? ([] as string[]),
      isActive: item.isActive,
      name: item.name,
      resource: "home-section-settings" as const,
      title: resolveHomeSectionTitle(item.name, labels.home.sectionTitles),
    });
  });

  const orderedCards = defaultCards.map(
    (card) => cardByKey.get(normalizeHomeSectionKey(card.name)) ?? card,
  );

  const dedupedCards = new Map<string, (typeof orderedCards)[number]>();

  orderedCards.forEach((card) => {
    const key = normalizeHomeSectionKey(card.name);
    const existing = dedupedCards.get(key);

    if (!existing) {
      dedupedCards.set(key, card);
      return;
    }

    if (!existing.id && card.id) {
      dedupedCards.set(key, card);
    }
  });

  return defaultCards
    .map((card) => dedupedCards.get(normalizeHomeSectionKey(card.name)))
    .filter((card): card is (typeof orderedCards)[number] => Boolean(card));
}

function buildAboutCard(
  aboutSettings: AboutSettingRow[],
  labels: ReturnType<typeof getLabels>,
) {
  const current = aboutSettings[0];

  return {
    contentEn: current?.contentEn ?? "",
    contentTh: current?.contentTh ?? "",
    headlineEn: current?.headlineEn ?? "",
    headlineTh: current?.headlineTh ?? "",
    id: current?.id ?? "",
    imgUrl: current?.imgUrl ?? ([] as string[]),
    title: labels.about.title,
  };
}

function createFallbackHomeCard(
  name: string,
  title: string,
  options?: {
    resource?: "about-page-settings" | "home-section-settings";
  },
) {
  return {
    contentEn: "",
    contentTh: "",
    headlineEn: "",
    headlineTh: "",
    id: "",
    imgUrl: [] as string[],
    isActive: true,
    name,
    resource: options?.resource ?? ("home-section-settings" as const),
    title,
  };
}

function normalizeHomeSectionKey(name: string) {
  const normalized = name.trim().toLowerCase().replace(/[_\s-]+/g, " ");

  if (normalized.includes("hero")) {
    return "hero";
  }

  if (
    normalized.includes("business") ||
    normalized.includes("unit") ||
    normalized.includes("category")
  ) {
    return "business";
  }

  if (normalized.includes("about")) {
    return "about";
  }

  if (normalized.includes("brand")) {
    return "brand";
  }

  if (normalized.includes("news") || normalized.includes("activit")) {
    return "news";
  }

  if (normalized.includes("recommend")) {
    return "recommended";
  }

  return normalized;
}

function currentRoleIsMissing(currentRole: string, availableRoles: string[]) {
  return Boolean(currentRole) && !availableRoles.includes(currentRole);
}

function resolveSocialContactValue(
  key: (typeof socialFields)[number]["key"],
  socialContacts: SocialContactRow[],
) {
  return findSocialContact(key, socialContacts)?.contactUrl ?? "";
}

function findSocialContact(
  key: (typeof socialFields)[number]["key"],
  socialContacts: SocialContactRow[],
) {
  return socialContacts.find((contact) => {
    const normalized = `${contact.code} ${contact.name}`.toLowerCase();
    return normalized.includes(key.replace("-", ""));
  });
}

const socialFields = [
  {
    code: "SM-LINE",
    key: "line",
    labelEn: "LINE OA URL",
    labelTh: "LINE OA URL",
    name: "LINE",
  },
  {
    code: "SM-FACEBOOK",
    key: "facebook",
    labelEn: "FACEBOOK URL",
    labelTh: "FACEBOOK URL",
    name: "FACEBOOK",
  },
  {
    code: "SM-TIKTOK",
    key: "tiktok",
    labelEn: "TIKTOK URL",
    labelTh: "TIKTOK URL",
    name: "TIKTOK",
  },
  {
    code: "SM-YOUTUBE",
    key: "youtube",
    labelEn: "YOUTUBE URL",
    labelTh: "YOUTUBE URL",
    name: "YOUTUBE",
  },
  {
    code: "SM-WEBSITE",
    key: "website",
    labelEn: "WEBSITE URL",
    labelTh: "WEBSITE URL",
    name: "WEBSITE",
  },
  {
    code: "SM-INSTAGRAM",
    key: "instagram",
    labelEn: "INSTAGRAM URL",
    labelTh: "INSTAGRAM URL",
    name: "INSTAGRAM",
  },
] as const;

function resolveHomeSectionTitle(
  name: string,
  sectionTitles: ReturnType<typeof getLabels>["home"]["sectionTitles"],
) {
  const normalized = name.trim().toLowerCase().replace(/[_\s-]+/g, " ");

  if (normalized.includes("hero")) {
    return sectionTitles.hero;
  }

  if (
    normalized.includes("business") ||
    normalized.includes("unit") ||
    normalized.includes("category")
  ) {
    return sectionTitles.businessUnit;
  }

  if (normalized.includes("about")) {
    return sectionTitles.about;
  }

  if (normalized.includes("brand")) {
    return sectionTitles.brand;
  }

  if (normalized.includes("news") || normalized.includes("activit")) {
    return sectionTitles.news;
  }

  if (normalized.includes("recommend")) {
    return sectionTitles.recommended;
  }

  return `${name} Section`;
}

function countRichTextCharacters(html: string) {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim().length;
}

function createSettingsPageHref(
  locale: Locale,
  tab: "faq" | "users",
  page: number,
  pageSize: number,
) {
  const searchParams = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    section: "settings",
    tab,
  });

  return `/${locale}/admin?${searchParams.toString()}`;
}

function getUserBatchFieldLabel(
  labels: ReturnType<typeof getLabels>,
  action: UserBatchAction,
) {
  if (action === "isActive") {
    return labels.common.activeToggle;
  }

  return labels.user.fields[action];
}

function getFaqBatchFieldLabel(
  labels: ReturnType<typeof getLabels>,
  action: FaqBatchAction,
) {
  if (action === "isActive") {
    return labels.common.activeToggle;
  }

  return labels.faq.fields[action];
}

function getUserBatchFieldConfig(
  labels: ReturnType<typeof getLabels>,
  action: UserBatchAction,
  row: AdminUserRow,
): AdminBatchFieldModalConfig {
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

  return {
    fieldLabel: labels.user.fields[action],
    initialValue: row[action],
    type: "text",
  };
}

function getFaqBatchFieldConfig(
  labels: ReturnType<typeof getLabels>,
  action: FaqBatchAction,
  row: FaqRow,
): AdminBatchFieldModalConfig {
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

  if (action === "rank") {
    return {
      fieldLabel: labels.faq.fields.rank,
      initialValue: row.rank ?? 1,
      type: "number",
    };
  }

  if (action === "answerTh" || action === "answerEn") {
    return {
      fieldLabel: labels.faq.fields[action],
      initialValue: row[action] ?? "",
      type: "textarea",
    };
  }

  return {
    fieldLabel: labels.faq.fields[action],
    initialValue: row[action] ?? "",
    type: "text",
  };
}

function buildUserPayload(
  row: AdminUserRow,
  action: UserBatchAction,
  value: boolean | number | string,
) {
  const next = {
    displayName: row.displayName,
    email: row.email,
    isActive: row.isActive,
    role: row.role,
    username: row.username,
  };

  if (action === "isActive") {
    next.isActive = Boolean(value);
  } else {
    next[action] = String(value);
  }

  return next;
}

function buildFaqPayload(
  row: FaqRow,
  action: FaqBatchAction,
  value: boolean | number | string,
) {
  const next = {
    answerEn: row.answerEn ?? undefined,
    answerTh: row.answerTh ?? undefined,
    categoryCode: row.categoryCode ?? undefined,
    isActive: row.isActive,
    questionEn: row.questionEn ?? undefined,
    questionTh: row.questionTh ?? undefined,
    rank: row.rank ?? 1,
    url: row.url ?? undefined,
  };

  if (action === "isActive") {
    next.isActive = Boolean(value);
  } else if (action === "rank") {
    next.rank = Number(value || 1);
  } else {
    next[action] = String(value);
  }

  return next;
}

function getLabels(locale: Locale) {
  return locale === "th"
    ? {
        title: "ตั้งค่า",
        tabs: {
          about: "เกี่ยวกับเรา",
          faq: "FAQ",
          users: "ผู้ใช้งาน",
          homeContent: "เนื้อหาหน้าแรก",
          socialMedia: "โซเชียลมีเดีย",
        },
        common: {
          active: "ACTIVE",
          activeToggle: "การแสดงผล",
          cancel: "ยกเลิก",
          delete: "ลบ",
          edit: "แก้ไข",
          error: "ไม่สามารถบันทึกข้อมูลได้",
          inactive: "INACTIVE",
          nextPage: "หน้าถัดไป",
          previousPage: "หน้าก่อนหน้า",
          rowsPerPage: "จำนวนต่อหน้า",
          save: "บันทึก",
          saving: "กำลังบันทึก...",
          selectAll: "เลือกรายการทั้งหมด",
          selectRow: "เลือกรายการ",
        },
        user: {
          add: "เพิ่มผู้ใช้งาน",
          addTitle: "เพิ่มผู้ใช้งาน",
          columns: {
            actions: "จัดการ",
            displayName: "ชื่อ",
            email: "อีเมล",
            role: "บทบาท",
            status: "สถานะ",
            username: "ชื่อผู้ใช้งาน",
          },
          deleteBody: (username: string) =>
            `ยืนยันการลบผู้ใช้งาน ${username} อีกครั้งก่อนดำเนินการ`,
          deleteTitle: "ยืนยันการลบผู้ใช้งาน",
          bulkEditDescription: (count: number, fieldLabel: string) =>
            `อัปเดตฟิลด์ ${fieldLabel} ของผู้ใช้งานพร้อมกัน ${count} รายการ`,
          bulkEditTitle: (fieldLabel: string) => `แก้ไขผู้ใช้งานหลายรายการ: ${fieldLabel}`,
          deleting: "กำลังลบ...",
          editTitle: "แก้ไขผู้ใช้งาน",
          empty: "ไม่พบข้อมูลผู้ใช้งาน",
          error: "ไม่สามารถบันทึกข้อมูลผู้ใช้งานได้",
          fields: {
            displayName: "ชื่อ",
            email: "อีเมล",
            password: "รหัสผ่าน",
            role: "บทบาท",
            username: "ชื่อผู้ใช้งาน",
          },
          formSection: "รายละเอียดผู้ใช้งาน",
          passwordHint: "กรอกเมื่อต้องการเปลี่ยนรหัสผ่าน",
        },
        home: {
          fields: {
            contentEn: "เนื้อหา (Content) ภาษาอังกฤษ (EN)",
            contentTh: "เนื้อหา (Content) ภาษาไทย (TH)",
            headlineEn: "พาดหัว (Headline) ภาษาอังกฤษ (EN)",
            headlineTh: "พาดหัว (Headline) ภาษาไทย (TH)",
            image: "รูปประจำ Section",
          },
          imageAlt: "รูปประจำ Section",
          noImage: "ยังไม่ได้อัปโหลดรูปภาพหรือวิดีโอสำหรับ Section นี้",
          placeholders: {
            contentEn: "ไม่เกิน 500 ตัวอักษร",
            contentTh: "ไม่เกิน 500 ตัวอักษร",
            headlineEn: "ไม่เกิน 150 ตัวอักษร",
            headlineTh: "ไม่เกิน 150 ตัวอักษร",
          },
          previewImage: "เปิดดูไฟล์",
          removeImage: "ลบไฟล์",
          sectionTitles: {
            about: "เกี่ยวกับซานต้า - About Santa Section",
            brand: "แบรนด์ - Brand Section",
            businessUnit: "หมวดหมู่สินค้าและบริการ - Business Unit Section",
            hero: "ฮีโร่แบนเนอร์ - Hero Banner Section",
            news: "ข่าวสารกิจกรรม - News & Activities Section",
            recommended: "สินค้าแนะนำ - Recommended Product Section",
          },
          toggleDescription: "ตั้งค่าการแสดงบนหน้าแรกของ Section",
          toggleTitle: "การแสดงผล",
          uploadImage: "อัปโหลดรูปภาพหรือวิดีโอ",
          uploadHeroImageHelper:
            "ใช้แสดงเป็น Hero banner หน้าแรก แนะนำอัปโหลด 1920 x 720 px ขนาดไฟล์ไม่เกิน 10 MB",
          uploadAboutImageHelper:
            "ใช้แสดงใน Section About Santa หน้าแรก แนะนำอัปโหลด 960 x 720 px ขนาดไฟล์ไม่เกิน 10 MB",
          uploadingImage: "กำลังอัปโหลดไฟล์...",
          validation: {
            contentMax: "เนื้อหาต้องมีความยาวไม่เกิน 500 ตัวอักษร",
            headlineMax: "พาดหัวต้องมีความยาวไม่เกิน 150 ตัวอักษร",
            imageType: "กรุณาเลือกไฟล์รูปภาพหรือวิดีโอเท่านั้น",
          },
        },
        about: {
          fields: {
            contentEn: "เนื้อหา (Content) ภาษาอังกฤษ (EN)",
            contentTh: "เนื้อหา (Content) ภาษาไทย (TH)",
            headlineEn: "หัวข้อภาษาอังกฤษ (EN)",
            headlineTh: "หัวข้อภาษาไทย (TH)",
            image: "รูปภาพและวิดีโอ",
          },
          imageAlt: "รูปภาพและวิดีโอ",
          noImage: "ยังไม่ได้อัปโหลดรูปภาพหรือวิดีโอ",
          placeholders: {
            contentEn: "ใส่เนื้อหาเกี่ยวกับซานต้าเทคโนโลยี ภาษาอังกฤษ",
            contentTh: "ใส่เนื้อหาเกี่ยวกับซานต้าเทคโนโลยี ภาษาไทย",
            headlineEn: "ใส่หัวข้อเกี่ยวกับซานต้าเทคโนโลยี ภาษาอังกฤษ",
            headlineTh: "ใส่หัวข้อเกี่ยวกับซานต้าเทคโนโลยี ภาษาไทย",
          },
          previewImage: "เปิดดูไฟล์",
          removeImage: "ลบไฟล์",
          removeAllImages: "ลบทั้งหมด",
          title: "เกี่ยวกับเรา",
          uploadImage: "อัปโหลดรูปภาพหรือวิดีโอ",
          uploadImageHelper:
            "ใช้แสดงในแกลเลอรีหน้า About Us แนะนำอัปโหลด 1280 x 720 px ขนาดไฟล์ไม่เกิน 10 MB",
          uploadingImage: "กำลังอัปโหลดไฟล์...",
          validation: {
            imageType: "กรุณาเลือกไฟล์รูปภาพหรือวิดีโอเท่านั้น",
          },
        },
        social: {
          title: "โซเชียลมีเดีย",
        },
        faq: {
          add: "เพิ่ม FAQ",
          addTitle: "เพิ่ม FAQ",
          columns: {
            actions: "จัดการ",
            categoryCode: "หมวดหมู่",
            questionEn: "คำถามภาษาอังกฤษ",
            questionTh: "คำถามภาษาไทย",
            rank: "ลำดับ",
            status: "สถานะ",
            url: "URL",
          },
          deleteBody: (question: string) => `ยืนยันการลบ FAQ ${question} อีกครั้งก่อนดำเนินการ`,
          deleteTitle: "ยืนยันการลบ FAQ",
          bulkEditDescription: (count: number, fieldLabel: string) =>
            `อัปเดตฟิลด์ ${fieldLabel} ของ FAQ พร้อมกัน ${count} รายการ`,
          bulkEditTitle: (fieldLabel: string) => `แก้ไข FAQ หลายรายการ: ${fieldLabel}`,
          deleting: "กำลังลบ...",
          editTitle: "แก้ไข FAQ",
          empty: "ไม่พบข้อมูล FAQ",
          error: "ไม่สามารถบันทึกข้อมูล FAQ ได้",
          fields: {
            answerEn: "คำตอบภาษาอังกฤษ",
            answerPlaceholder: "กรอกคำตอบ",
            answerTh: "คำตอบภาษาไทย",
            categoryCode: "Category",
            categoryPlaceholder: "เลือกหมวดหมู่",
            questionEn: "คำถามภาษาอังกฤษ",
            questionTh: "คำถามภาษาไทย",
            rank: "ลำดับ",
            url: "URL",
          },
          formSection: "รายละเอียด FAQ",
        },
      }
    : {
        title: "Settings",
        tabs: {
          about: "About Us",
          faq: "FAQ",
          users: "Users",
          homeContent: "Home Content",
          socialMedia: "Social Media",
        },
        common: {
          active: "ACTIVE",
          activeToggle: "Visibility",
          cancel: "Cancel",
          delete: "Delete",
          edit: "Edit",
          error: "Unable to save data",
          inactive: "INACTIVE",
          nextPage: "Next page",
          previousPage: "Previous page",
          rowsPerPage: "Rows per page",
          save: "Save",
          saving: "Saving...",
          selectAll: "Select all rows",
          selectRow: "Select row",
        },
        user: {
          add: "Add User",
          addTitle: "Add User",
          columns: {
            actions: "Actions",
            displayName: "Name",
            email: "Email",
            role: "Role",
            status: "Status",
            username: "Username",
          },
          deleteBody: (username: string) =>
            `Please confirm deleting user ${username}.`,
          deleteTitle: "Confirm User Delete",
          bulkEditDescription: (count: number, fieldLabel: string) =>
            `Update ${fieldLabel} for ${count} users at once.`,
          bulkEditTitle: (fieldLabel: string) => `Bulk edit users: ${fieldLabel}`,
          deleting: "Deleting...",
          editTitle: "Edit User",
          empty: "No users found",
          error: "Unable to save user data",
          fields: {
            displayName: "Name",
            email: "Email",
            password: "Password",
            role: "Role",
            username: "Username",
          },
          formSection: "User Details",
          passwordHint: "Leave blank to keep the current password",
        },
        home: {
          fields: {
            contentEn: "Content (EN)",
            contentTh: "Content (TH)",
            headlineEn: "Headline (EN)",
            headlineTh: "Headline (TH)",
            image: "Section image",
          },
          imageAlt: "Section image",
          noImage: "No image or video uploaded for this section yet",
          placeholders: {
            contentEn: "No more than 500 characters",
            contentTh: "No more than 500 characters",
            headlineEn: "No more than 150 characters",
            headlineTh: "No more than 150 characters",
          },
          previewImage: "Open file",
          removeImage: "Remove file",
          sectionTitles: {
            about: "About Santa - About Santa Section",
            brand: "Brand - Brand Section",
            businessUnit: "Business Unit - Business Unit Section",
            hero: "Hero Banner - Hero Banner Section",
            news: "News & Activities - News & Activities Section",
            recommended: "Recommended Product - Recommended Product Section",
          },
          toggleDescription: "Control section visibility on the home page",
          toggleTitle: "Visibility",
          uploadImage: "Upload image or video",
          uploadHeroImageHelper:
            "Shown as the home hero banner. Recommended upload size 1920 x 720 px, maximum file size 10 MB",
          uploadAboutImageHelper:
            "Shown in the About Santa section on the home page. Recommended upload size 960 x 720 px, maximum file size 10 MB",
          uploadingImage: "Uploading file...",
          validation: {
            contentMax: "Content must be 500 characters or fewer",
            headlineMax: "Headline must be 150 characters or fewer",
            imageType: "Please select an image or video file only",
          },
        },
        about: {
          fields: {
            contentEn: "Content (EN)",
            contentTh: "Content (TH)",
            headlineEn: "Heading (EN)",
            headlineTh: "Heading (TH)",
            image: "Images & Videos",
          },
          imageAlt: "Images & Videos",
          noImage: "No image or video uploaded yet",
          placeholders: {
            contentEn: "Enter the English about content",
            contentTh: "Enter the Thai about content",
            headlineEn: "Enter the English heading",
            headlineTh: "Enter the Thai heading",
          },
          previewImage: "Open file",
          removeImage: "Remove file",
          removeAllImages: "Remove all",
          title: "About Us",
          uploadImage: "Upload image or video",
          uploadImageHelper:
            "Shown in the About Us page gallery. Recommended upload size 1280 x 720 px, maximum file size 10 MB",
          uploadingImage: "Uploading file...",
          validation: {
            imageType: "Please select an image or video file only",
          },
        },
        social: {
          title: "Social Media",
        },
        faq: {
          add: "Add FAQ",
          addTitle: "Add FAQ",
          columns: {
            actions: "Actions",
            categoryCode: "Category",
            questionEn: "English Question",
            questionTh: "Thai Question",
            rank: "Rank",
            status: "Status",
            url: "URL",
          },
          deleteBody: (question: string) => `Please confirm deleting FAQ ${question}.`,
          deleteTitle: "Confirm FAQ Delete",
          bulkEditDescription: (count: number, fieldLabel: string) =>
            `Update ${fieldLabel} for ${count} FAQ entries at once.`,
          bulkEditTitle: (fieldLabel: string) => `Bulk edit FAQs: ${fieldLabel}`,
          deleting: "Deleting...",
          editTitle: "Edit FAQ",
          empty: "No FAQ found",
          error: "Unable to save FAQ data",
          fields: {
            answerEn: "English Answer",
            answerPlaceholder: "Enter answer",
            answerTh: "Thai Answer",
            categoryCode: "Category",
            categoryPlaceholder: "Select category",
            questionEn: "English Question",
            questionTh: "Thai Question",
            rank: "Rank",
            url: "URL",
          },
          formSection: "FAQ Details",
        },
      };
}
