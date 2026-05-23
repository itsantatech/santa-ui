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
  page: number;
  pageSize?: number;
  isActive?: boolean;
  search?: string;
  subCategoryCode?: string;
};

const defaultPageSize = 20;
const santaApiBaseUrl =
  process.env.SANTA_API_BASE_URL ??
  process.env.NEXT_PUBLIC_SANTA_API_BASE_URL ??
  "http://localhost:4000";

export async function fetchAdminList<Row>(
  resourcePath: string,
  {
    brandCode,
    categoryCode,
    isActive = true,
    page,
    pageSize = defaultPageSize,
    search,
    subCategoryCode,
  }: AdminListOptions,
): Promise<AdminListResponse<Row> | null> {
  const url = new URL(resourcePath, santaApiBaseUrl);
  url.searchParams.set("page", String(page));
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("isActive", String(isActive));
  if (search) {
    url.searchParams.set("search", search);
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

  try {
    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AdminListResponse<Row>;
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
