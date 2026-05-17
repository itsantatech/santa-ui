export const adminSections = [
  "products-services",
  "categories",
  "brands",
  "inventory",
  "orders",
  "quotations",
  "news-activities",
  "articles",
  "settings",
] as const;

export type AdminSection = (typeof adminSections)[number];

export const defaultAdminSection: AdminSection = "products-services";

export function isAdminSection(value: string): value is AdminSection {
  return adminSections.includes(value as AdminSection);
}

