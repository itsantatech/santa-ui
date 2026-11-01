import type { Metadata } from "next";
import CategoryDetailPage, {
  generateMetadata as generateCategoryMetadata,
} from "../page";
import { encodePathSegment } from "@/lib/paths";

type SubCategoryDetailPageProps = {
  params: Promise<{
    "category-slug": string;
    "sub-category-slug": string;
    locale: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(
  { params, searchParams }: SubCategoryDetailPageProps,
): Promise<Metadata> {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const path = `/products/categories/${encodePathSegment(resolvedParams["category-slug"])}/${encodePathSegment(resolvedParams["sub-category-slug"])}`;
  const categoryMetadata = await generateCategoryMetadata({
    params: Promise.resolve({
      "category-slug": resolvedParams["category-slug"],
      locale: resolvedParams.locale,
    }),
    searchParams: Promise.resolve({}),
  });

  return {
    ...categoryMetadata,
    alternates: {
      canonical: `/${resolvedParams.locale}${path}`,
      languages: { th: `/th${path}`, en: `/en${path}` },
    },
    openGraph: {
      ...categoryMetadata.openGraph,
      url: `/${resolvedParams.locale}${path}`,
    },
    robots: hasQueryParameters(resolvedSearchParams)
      ? { follow: true, index: false }
      : undefined,
  };
}

function hasQueryParameters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return Object.values(searchParams).some((value) =>
    Array.isArray(value) ? value.length > 0 : Boolean(value),
  );
}

export default async function SubCategoryDetailPage({
  params,
  searchParams,
}: SubCategoryDetailPageProps) {
  const resolvedParams = await params;

  return (
    <CategoryDetailPage
      params={Promise.resolve({
        "category-slug": resolvedParams["category-slug"],
        locale: resolvedParams.locale,
      })}
      searchParams={searchParams}
      subCategorySlug={resolvedParams["sub-category-slug"]}
    />
  );
}
