import { fetchAdminList } from "@/lib/admin-api";
import type { Locale } from "@/lib/i18n";
import { SettingsSectionClient } from "./settings-section.client";

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

export async function SettingsSection({
  canManageUsers = false,
  locale,
  page = 1,
  pageSize = 50,
  tab,
}: {
  canManageUsers?: boolean;
  locale: Locale;
  page?: number;
  pageSize?: number;
  tab?: string;
}) {
  const activeTab =
    tab === "home-content" || tab === "about" || tab === "social-media" || tab === "faq"
      ? tab
      : "users";
  const [users, homeSettings, aboutSettings, socialContacts, faqs, categories] = await Promise.all([
    fetchAdminList<AdminUserRow>("/admin-users", {
      isActive: true,
      page: activeTab === "users" ? page : 1,
      pageSize: activeTab === "users" ? pageSize : 50,
    }),
    fetchAdminList<HomeSettingRow>("/home-section-settings", {
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<AboutSettingRow>("/about-page-settings", {
      isActive: false,
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<SocialContactRow>("/social-media-contacts", {
      page: 1,
      pageSize: 20,
    }),
    fetchAdminList<FaqRow>("/faqs", {
      page: activeTab === "faq" ? page : 1,
      pageSize: activeTab === "faq" ? pageSize : 50,
    }),
    fetchAdminList<CategoryOption>("/categories", {
      page: 1,
      pageSize: 100,
    }),
  ]);

  return (
    <SettingsSectionClient
      aboutSettings={aboutSettings?.items ?? []}
      activeTab={activeTab}
      canManageUsers={canManageUsers}
      categories={categories?.items ?? []}
      faqMeta={faqs?.meta}
      faqs={faqs?.items ?? []}
      homeSettings={homeSettings?.items ?? []}
      page={page}
      pageSize={pageSize}
      locale={locale}
      socialContacts={socialContacts?.items ?? []}
      userMeta={users?.meta}
      users={users?.items ?? []}
    />
  );
}
