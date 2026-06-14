"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ProductSearch } from "@/components/product-search";

type SortOption = {
  label: string;
  value: string;
};

export function ProductsPageControls({
  currentSearch,
  currentSort,
  locale,
  searchPlaceholder,
  searchButtonLabel,
  sortLabel,
  sortOptions,
}: {
  currentSearch: string;
  currentSort: string;
  locale: "th" | "en";
  searchPlaceholder: string;
  searchButtonLabel: string;
  sortLabel: string;
  sortOptions: SortOption[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | null>) {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.delete("page");

    for (const [key, value] of Object.entries(updates)) {
      if (value && value.trim().length > 0) {
        nextSearchParams.set(key, value);
      } else {
        nextSearchParams.delete(key);
      }
    }

    router.push(`${pathname}?${nextSearchParams.toString()}`);
  }

  return (
    <div className="products-page-toolbar">
      <ProductSearch
        embedded
        initialSearch={currentSearch}
        labels={{
          search: searchButtonLabel,
          searchPlaceholder: searchPlaceholder,
        }}
        locale={locale}
        onSearch={(query) => updateParams({ search: query || null })}
      />

      <label className="products-sort-control">
        <span>{sortLabel}</span>
        <select
          onChange={(event) => updateParams({ sort: event.target.value })}
          value={currentSort}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span
          className="material-symbols-outlined products-sort-control-icon"
          aria-hidden="true"
        >
          expand_more
        </span>
      </label>
    </div>
  );
}
