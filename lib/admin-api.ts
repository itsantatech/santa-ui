export type AdminListResponse<Row> = {
  items: Row[];
  meta: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};

type AdminListOptions = {
  brandCode?: string;
  categoryCode?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page: number;
  pageSize?: number;
  isActive?: boolean;
  lowStockOnly?: boolean;
  search?: string;
  subCategoryCode?: string;
};

type FetchBehavior = {
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

const defaultPageSize = 50;
export const santaApiBaseUrl =
  process.env.SANTA_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SANTA_API_BASE_URL ??
  "http://localhost:4000";

export function createSantaApiUrl(resourcePath: string) {
  return new URL(resourcePath, santaApiBaseUrl);
}

export async function fetchAdminList<Row>(
  resourcePath: string,
  {
    brandCode,
    categoryCode,
    isActive,
    lowStockOnly,
    page,
    pageSize = defaultPageSize,
    search,
    sortBy,
    sortOrder,
    subCategoryCode,
  }: AdminListOptions,
  fetchBehavior: FetchBehavior = { cache: "no-store" },
): Promise<AdminListResponse<Row> | null> {
  const url = createSantaApiUrl(resourcePath);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  if (isActive !== undefined) {
    url.searchParams.set("isActive", String(isActive));
  }
  if (search) {
    url.searchParams.set("search", search);
  }
  if (lowStockOnly !== undefined) {
    url.searchParams.set("lowStockOnly", String(lowStockOnly));
  }
  if (categoryCode) {
    url.searchParams.set("categoryCode", categoryCode);
  }
  if (subCategoryCode) {
    url.searchParams.set("subCategoryCode", subCategoryCode);
  }
  if (brandCode) {
    url.searchParams.set("brandCode", brandCode);
  }
  if (sortBy) {
    url.searchParams.set("sortBy", sortBy);
  }
  if (sortOrder) {
    url.searchParams.set("sortOrder", sortOrder);
  }

  try {
    const response = await fetch(url, fetchBehavior);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AdminListResponse<Row>;
  } catch {
    return null;
  }
}

export async function fetchSantaApiResource<Row>(
  resourcePath: string,
  fetchBehavior: FetchBehavior = { cache: "no-store" },
): Promise<Row | null> {
  const url = createSantaApiUrl(resourcePath);

  try {
    const response = await fetch(url, fetchBehavior);

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as Row;
  } catch {
    return null;
  }
}

export function formatAdminDateTime(value: string | null | undefined, locale: "th" | "en") {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
