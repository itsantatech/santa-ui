import { createSantaApiUrl, fetchAdminList } from "@/lib/admin-api";
import type { Locale } from "@/lib/i18n";

export type FooterCategory = {
  code: string;
  isActive: boolean;
  nameEn: string;
  nameTh: string;
  rank: number;
  slug: string;
};

export type FooterSocialContact = {
  code: string;
  contactUrl: string;
  isActive: boolean;
};

export type AboutPageSetting = {
  id: string;
  headlineTh: string;
  headlineEn: string;
  contentTh: string;
  contentEn: string;
  imgUrl: string[];
  updatedAt?: string;
};

export type PublicContentItem = {
  id: string;
  rank: number;
  topicTh: string;
  topicEn: string;
  contentTh: string;
  contentEn: string;
  slug: string;
  imgUrl: string[];
  relatedSku: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type PublicContentResource = "articles" | "news-and-activities";

type FetchListOptions = {
  isActive?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function fetchPublicChrome() {
  const [categoriesResponse, socialContactsResponse] = await Promise.all([
    fetchAdminList<FooterCategory>("/categories", {
      isActive: true,
      page: 1,
      pageSize: 100,
    }),
    fetchAdminList<FooterSocialContact>("/social-media-contacts", {
      isActive: true,
      page: 1,
      pageSize: 20,
    }),
  ]);

  return {
    categories: sortFooterCategories(categoriesResponse?.items ?? []),
    socialContacts: socialContactsResponse?.items ?? [],
  };
}

export async function fetchAboutPageSetting() {
  const response = await fetchAdminList<AboutPageSetting>("/about-page-settings", {
    page: 1,
    pageSize: 20,
  });

  return response?.items[0] ?? null;
}

export async function fetchPublicContentList(
  resource: PublicContentResource,
  options: FetchListOptions = {},
) {
  return fetchAdminList<PublicContentItem>(`/${resource}`, {
    isActive: options.isActive ?? true,
    page: options.page ?? 1,
    pageSize: options.pageSize ?? 6,
    search: options.search,
    sortBy: options.sortBy,
    sortOrder: options.sortOrder,
  });
}

export async function fetchPublicContentBySlug(
  resource: PublicContentResource,
  slug: string,
) {
  const normalizedSlug = decodeURIComponent(slug).trim().toLowerCase();
  const searchCandidates = await Promise.all([
    fetchPublicContentList(resource, {
      page: 1,
      pageSize: 20,
      search: normalizedSlug,
    }),
    fetchPublicContentList(resource, {
      page: 1,
      pageSize: 200,
    }),
  ]);

  const item = searchCandidates
    .flatMap((response) => response?.items ?? [])
    .find((entry) => entry.slug.trim().toLowerCase() === normalizedSlug && entry.isActive);

  if (!item) {
    return null;
  }

  const detail = await fetchPublicContentById(resource, item.id);

  return detail ?? item;
}

export function getLocalizedAboutContent(setting: AboutPageSetting, locale: Locale) {
  return {
    content: normalizeRichTextHtml(locale === "th" ? setting.contentTh : setting.contentEn),
    headline: (locale === "th" ? setting.headlineTh : setting.headlineEn).trim(),
  };
}

export function getLocalizedContent(item: PublicContentItem, locale: Locale) {
  return {
    content: normalizeRichTextHtml(locale === "th" ? item.contentTh : item.contentEn),
    topic: (locale === "th" ? item.topicTh : item.topicEn).trim(),
  };
}

export function normalizeRichTextHtml(value?: string | null) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "<p>-</p>";
  }

  return normalizedValue.includes("<") ? normalizedValue : `<p>${escapeHtml(normalizedValue)}</p>`;
}

export function stripHtmlToPlainText(value?: string | null) {
  return (value ?? "")
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/p>\s*<p[^>]*>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

export function createContentExcerpt(value?: string | null, maxLength = 180) {
  const text = stripHtmlToPlainText(value);

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.slice(0, maxLength).trimEnd()}...`;
}

export function estimateReadingTime(value?: string | null, locale: Locale = "th") {
  const plainText = stripHtmlToPlainText(value);
  const wordLikeCount = plainText
    .split(/\s+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean).length;
  const minuteCount = Math.max(1, Math.ceil(wordLikeCount / 180));

  return locale === "th" ? `เวลาอ่าน ${minuteCount} นาที` : `${minuteCount} min read`;
}

export function formatContentDate(value: string | null | undefined, locale: Locale) {
  if (!value) {
    return locale === "th" ? "ไม่ระบุวันที่" : "Date unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function getSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];

  return Array.isArray(value) ? value[0] : value;
}

export function getPositiveInteger(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed < 1) {
    return undefined;
  }

  return parsed;
}

export function buildPageHref(
  pathname: string,
  searchParams: Record<string, string | string[] | undefined>,
  page: number,
) {
  const nextSearchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "page") {
      continue;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => nextSearchParams.append(key, entry));
      continue;
    }

    if (typeof value === "string" && value.length > 0) {
      nextSearchParams.set(key, value);
    }
  }

  nextSearchParams.set("page", String(page));

  return `${pathname}?${nextSearchParams.toString()}`;
}

export function getContentSortQuery(sortKey: string | undefined) {
  switch (sortKey) {
    case "oldest":
      return { sortBy: "createdAt", sortOrder: "asc" as const };
    case "title-asc":
      return { sortBy: "topicTh", sortOrder: "asc" as const };
    case "title-desc":
      return { sortBy: "topicTh", sortOrder: "desc" as const };
    case "rank-asc":
      return { sortBy: "rank", sortOrder: "asc" as const };
    default:
      return { sortBy: "createdAt", sortOrder: "desc" as const };
  }
}

async function fetchPublicContentById(
  resource: PublicContentResource,
  id: string,
) {
  const url = createSantaApiUrl(`/${resource}/${id}`);

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as PublicContentItem;
  } catch {
    return null;
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sortFooterCategories(categories: FooterCategory[]) {
  return [...categories]
    .filter((item) => item.isActive && item.slug.trim().length > 0)
    .sort((left, right) => left.rank - right.rank || left.nameTh.localeCompare(right.nameTh));
}
