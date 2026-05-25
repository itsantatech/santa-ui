"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { AdminDataTable, type AdminDataTableColumn, AdminStatusBadge } from "./admin-data-table";
import type { Locale } from "@/lib/i18n";
import { formatAdminDateTime } from "@/lib/admin-api";

type HomeSettingRow = {
  id: string;
  name: string;
  headlineTh: string;
  headlineEn: string;
  contentTh?: string | null;
  contentEn?: string | null;
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

type TabValue = "users" | "home-content" | "social-media" | "faq";

export function SettingsSectionClient({
  aboutSettings,
  activeTab,
  canManageUsers = false,
  categories,
  faqs,
  homeSettings,
  locale,
  socialContacts,
  users,
}: {
  aboutSettings: AboutSettingRow[];
  activeTab: TabValue;
  categories: CategoryOption[];
  canManageUsers?: boolean;
  faqs: FaqRow[];
  homeSettings: HomeSettingRow[];
  locale: Locale;
  socialContacts: SocialContactRow[];
  users: AdminUserRow[];
}) {
  const labels = getLabels(locale);
  const router = useRouter();
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUserRow | null>(null);
  const [isCreateUserOpen, setIsCreateUserOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FaqRow | null>(null);
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

  const sections = buildHomeSectionCards(homeSettings, aboutSettings, labels);

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
            getRowId={(row) => row.id}
            rows={users}
            selectAllLabel={labels.common.selectAll}
            selectRowLabel={(row) => `${labels.common.selectRow} ${row.username}`}
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
            getRowId={(row) => row.id}
            rows={faqs}
            selectAllLabel={labels.common.selectAll}
            selectRowLabel={(row) => `${labels.common.selectRow} ${row.questionTh ?? row.id}`}
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
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState(() => ({
    contentEn: card.contentEn,
    contentTh: card.contentTh,
    headlineEn: card.headlineEn,
    headlineTh: card.headlineTh,
    isActive: card.isActive,
  }));

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    setError("");

    const payload =
      card.resource === "home-section-settings"
        ? {
            name: card.name,
            headlineTh: form.headlineTh,
            headlineEn: form.headlineEn,
            contentTh: form.contentTh,
            contentEn: form.contentEn,
            isActive: form.isActive,
          }
        : {
            headlineTh: form.headlineTh,
            headlineEn: form.headlineEn,
            contentTh: form.contentTh,
            contentEn: form.contentEn,
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
        <button aria-label="close" className="admin-settings-card-close" type="button">
          <span className="material-symbols-outlined" aria-hidden="true">
            close
          </span>
        </button>
      </div>
      <div className="admin-settings-card-grid">
        <SettingsField
          label={labels.home.fields.headlineTh}
          placeholder={labels.home.placeholders.headlineTh}
          onChange={(value) => setForm((current) => ({ ...current, headlineTh: value }))}
          value={form.headlineTh}
        />
        <SettingsField
          label={labels.home.fields.headlineEn}
          placeholder={labels.home.placeholders.headlineEn}
          onChange={(value) => setForm((current) => ({ ...current, headlineEn: value }))}
          value={form.headlineEn}
        />
        <SettingsTextarea
          label={labels.home.fields.contentTh}
          placeholder={labels.home.placeholders.contentTh}
          onChange={(value) => setForm((current) => ({ ...current, contentTh: value }))}
          value={form.contentTh}
        />
        <SettingsTextarea
          label={labels.home.fields.contentEn}
          placeholder={labels.home.placeholders.contentEn}
          onChange={(value) => setForm((current) => ({ ...current, contentEn: value }))}
          value={form.contentEn}
        />
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
          <button className="admin-product-secondary-button" type="button">
            {labels.common.cancel}
          </button>
          <button className="admin-product-add-button" disabled={isSaving} type="submit">
            {isSaving ? labels.common.saving : labels.common.save}
          </button>
        </div>
      </div>
      {error ? <p className="admin-product-form-error">{error}</p> : null}
    </form>
  );
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
  const [form, setForm] = useState(() => ({
    displayName: initialUser?.displayName ?? "",
    email: initialUser?.email ?? "",
    isActive: initialUser?.isActive ?? true,
    password: "",
    role: initialUser?.role ?? "",
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
        currentRoleIsMissing(form.role, payload) ? [form.role, ...payload] : payload,
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
  }, [labels.common.error]);

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
  onChange,
  placeholder,
  required = false,
  type = "text",
  value,
}: {
  className?: string;
  label: string;
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
  label,
  onChange,
  placeholder,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  placeholder?: string;
  value: string;
}) {
  return (
    <label className="admin-product-field">
      <span>{label}</span>
      <textarea
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </label>
  );
}

function buildHomeSectionCards(
  homeSettings: HomeSettingRow[],
  aboutSettings: AboutSettingRow[],
  labels: ReturnType<typeof getLabels>,
) {
  const defaultCards = [
    createFallbackHomeCard("hero-banner", labels.home.sectionTitles.hero),
    createFallbackHomeCard("business-unit", labels.home.sectionTitles.businessUnit),
    createFallbackHomeCard("about-us", labels.home.sectionTitles.about, {
      resource: "about-page-settings",
    }),
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
      imgUrl: [] as string[],
      isActive: item.isActive,
      name: item.name,
      resource: "home-section-settings" as const,
      title: resolveHomeSectionTitle(item.name, labels.home.sectionTitles),
    });
  });

  if (aboutSettings[0]) {
    cardByKey.set("about", {
      contentEn: aboutSettings[0].contentEn,
      contentTh: aboutSettings[0].contentTh,
      headlineEn: aboutSettings[0].headlineEn,
      headlineTh: aboutSettings[0].headlineTh,
      id: aboutSettings[0].id,
      imgUrl: aboutSettings[0].imgUrl,
      isActive: true,
      name: "about-us",
      resource: "about-page-settings" as const,
      title: labels.home.sectionTitles.about,
    });
  }

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

function getLabels(locale: Locale) {
  return locale === "th"
    ? {
        title: "ตั้งค่า",
        tabs: {
          faq: "FAQ",
          users: "ผู้ใช้งาน",
          homeContent: "เนื้อหาหน้าแรก",
          socialMedia: "โซเชียลมีเดีย",
        },
        common: {
          active: "ACTIVE",
          cancel: "ยกเลิก",
          delete: "ลบ",
          edit: "แก้ไข",
          error: "ไม่สามารถบันทึกข้อมูลได้",
          inactive: "INACTIVE",
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
          },
          placeholders: {
            contentEn: "ไม่เกิน 200 ตัวอักษร",
            contentTh: "ไม่เกิน 200 ตัวอักษร",
            headlineEn: "ไม่เกิน 100 ตัวอักษร",
            headlineTh: "ไม่เกิน 100 ตัวอักษร",
          },
          sectionTitles: {
            about: "เกี่ยวกับเรา - About US Section",
            brand: "แบรนด์ - Brand Section",
            businessUnit: "หมวดหมู่สินค้าและบริการ - Business Unit Section",
            hero: "ฮีโร่แบนเนอร์ - Hero Banner Section",
            news: "ข่าวสารกิจกรรม - News & Activities Section",
            recommended: "สินค้าแนะนำ - Recommended Product Section",
          },
          toggleDescription: "ตั้งค่าการแสดงบนหน้าแรกของ Section",
          toggleTitle: "การแสดงผล",
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
          faq: "FAQ",
          users: "Users",
          homeContent: "Home Content",
          socialMedia: "Social Media",
        },
        common: {
          active: "ACTIVE",
          cancel: "Cancel",
          delete: "Delete",
          edit: "Edit",
          error: "Unable to save data",
          inactive: "INACTIVE",
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
          },
          placeholders: {
            contentEn: "No more than 200 characters",
            contentTh: "No more than 200 characters",
            headlineEn: "No more than 100 characters",
            headlineTh: "No more than 100 characters",
          },
          sectionTitles: {
            about: "About Us - About US Section",
            brand: "Brand - Brand Section",
            businessUnit: "Business Unit - Business Unit Section",
            hero: "Hero Banner - Hero Banner Section",
            news: "News & Activities - News & Activities Section",
            recommended: "Recommended Product - Recommended Product Section",
          },
          toggleDescription: "Control section visibility on the home page",
          toggleTitle: "Visibility",
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
