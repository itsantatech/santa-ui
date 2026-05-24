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
  tab,
}: {
  canManageUsers?: boolean;
  locale: Locale;
  tab?: string;
}) {
  const activeTab = tab === "home-content" || tab === "social-media" ? tab : "users";
  const [users, homeSettings, aboutSettings, socialContacts] = await Promise.all([
    fetchAdminList<AdminUserRow>("/admin-users", {
      isActive: true,
      page: 1,
      pageSize: 50,
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
  ]);

  return (
    <SettingsSectionClient
      aboutSettings={aboutSettings?.items ?? []}
      activeTab={activeTab}
      canManageUsers={canManageUsers}
      homeSettings={homeSettings?.items ?? []}
      locale={locale}
      socialContacts={socialContacts?.items ?? []}
      users={users?.items ?? []}
    />
  );
}
