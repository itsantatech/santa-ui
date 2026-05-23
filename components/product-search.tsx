"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useId,
  useState,
  useTransition,
} from "react";

export type ProductSearchSuggestion = {
  sku: string;
  nameTh: string;
  nameEn: string;
  model: string | null;
};

type ProductSearchLabels = {
  noSuggestions?: string;
  search?: string;
  searchPlaceholder?: string;
  searchTooShort?: string;
};

export function ProductSearch<
  Row extends ProductSearchSuggestion = ProductSearchSuggestion,
>({
  disabled = false,
  initialSearch = "",
  labels,
  locale,
  onSearch,
  onSelect,
  placeholder,
}: {
  disabled?: boolean;
  initialSearch?: string;
  labels?: ProductSearchLabels;
  locale: "th" | "en";
  onSearch?: (query: string) => void;
  onSelect?: (product: Row) => void;
  placeholder?: string;
}) {
  const inputId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<Row[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchLabel = labels?.search ?? (locale === "th" ? "ค้นหา" : "Search");
  const searchPlaceholder =
    placeholder ??
    labels?.searchPlaceholder ??
    (locale === "th" ? "ค้นหาสินค้า" : "Search products");
  const searchTooShort =
    labels?.searchTooShort ??
    (locale === "th" ? "พิมพ์อย่างน้อย 3 ตัวอักษร" : "Enter at least 3 characters");
  const noSuggestions =
    labels?.noSuggestions ?? (locale === "th" ? "ไม่พบสินค้า" : "No products found");

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery.length < 3) {
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/admin/products?search=${encodeURIComponent(trimmedQuery)}&pageSize=10`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const payload = (await response.json()) as {
          items?: Row[];
        };

        setSuggestions((payload.items ?? []).slice(0, 10));
        setIsOpen(true);
      } catch {
        if (!controller.signal.aborted) {
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 180);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [query]);

  function updateTable(nextSearch: string) {
    const trimmedSearch = nextSearch.trim();
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.set("section", "products-services");
    nextSearchParams.delete("page");

    if (trimmedSearch.length >= 3) {
      nextSearchParams.set("search", trimmedSearch);
    } else {
      nextSearchParams.delete("search");
    }

    startTransition(() => {
      router.replace(`${pathname}?${nextSearchParams.toString()}`);
    });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (onSearch) {
      onSearch(query.trim());
    } else {
      updateTable(query);
    }
    setIsOpen(false);
  }

  return (
    <form className="admin-product-search" role="search" onSubmit={handleSubmit}>
      <div className="admin-product-search-field">
        <label className="sr-only" htmlFor={inputId}>
          {searchPlaceholder}
        </label>
        <input
          aria-autocomplete="list"
          aria-controls={`${inputId}-suggestions`}
          aria-expanded={isOpen}
          autoComplete="off"
          id={inputId}
          disabled={disabled}
          minLength={3}
          name="search"
          onBlur={() => {
            window.setTimeout(() => setIsOpen(false), 120);
          }}
          onChange={(event) => {
            setQuery(event.target.value);

            if (event.target.value.trim().length < 3) {
              setSuggestions([]);
              setIsOpen(false);
            }
          }}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={searchPlaceholder}
          role="combobox"
          type="search"
          value={query}
        />
        {query.trim().length > 0 && query.trim().length < 3 ? (
          <span className="admin-product-search-hint">{searchTooShort}</span>
        ) : null}
        {isOpen ? (
          <div
            className="admin-product-suggestions"
            id={`${inputId}-suggestions`}
            role="listbox"
          >
            {suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <button
                  className="admin-product-suggestion"
                  key={suggestion.sku}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(suggestion.sku);
                    if (onSelect) {
                      onSelect(suggestion);
                    } else {
                      updateTable(suggestion.sku);
                    }
                    setIsOpen(false);
                  }}
                  aria-selected="false"
                  role="option"
                  type="button"
                >
                  <strong>{suggestion.sku}</strong>
                  <span>
                    {locale === "th" ? suggestion.nameTh : suggestion.nameEn}
                    {suggestion.model ? ` / ${suggestion.model}` : ""}
                  </span>
                </button>
              ))
            ) : (
              <span className="admin-product-suggestion-empty">
                {isLoading ? searchLabel : noSuggestions}
              </span>
            )}
          </div>
        ) : null}
      </div>
      <button disabled={disabled} type="submit">
        {searchLabel}
      </button>
    </form>
  );
}
