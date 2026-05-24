"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  type FormEvent,
  useEffect,
  useId,
  useState,
  useTransition,
} from "react";

export type BrandSearchSuggestion = {
  code: string;
  nameTh: string;
  nameEn: string;
  slug: string;
};

type BrandSearchLabels = {
  empty: string;
  placeholder: string;
  search: string;
  tooShort: string;
};

export function BrandSearch({
  initialSearch = "",
  labels,
  locale,
}: {
  initialSearch?: string;
  labels: BrandSearchLabels;
  locale: "th" | "en";
}) {
  const inputId = useId();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [query, setQuery] = useState(initialSearch);
  const [suggestions, setSuggestions] = useState<BrandSearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          `/api/admin/brands?search=${encodeURIComponent(trimmedQuery)}&pageSize=10`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setSuggestions([]);
          return;
        }

        const payload = (await response.json()) as {
          items?: BrandSearchSuggestion[];
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

    nextSearchParams.set("section", "brands");
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
    updateTable(query);
    setIsOpen(false);
  }

  return (
    <form className="admin-product-search" onSubmit={handleSubmit} role="search">
      <div className="admin-product-search-field">
        <label className="sr-only" htmlFor={inputId}>
          {labels.placeholder}
        </label>
        <input
          aria-autocomplete="list"
          aria-controls={`${inputId}-suggestions`}
          aria-expanded={isOpen}
          autoComplete="off"
          id={inputId}
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
          placeholder={labels.placeholder}
          role="combobox"
          type="search"
          value={query}
        />
        {query.trim().length > 0 && query.trim().length < 3 ? (
          <span className="admin-product-search-hint">{labels.tooShort}</span>
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
                  aria-selected="false"
                  className="admin-product-suggestion"
                  key={suggestion.code}
                  onClick={() => {
                    setQuery(suggestion.code);
                    updateTable(suggestion.code);
                    setIsOpen(false);
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  role="option"
                  type="button"
                >
                  <strong>{suggestion.code}</strong>
                  <span>
                    {locale === "th" ? suggestion.nameTh : suggestion.nameEn}
                    {suggestion.slug ? ` / ${suggestion.slug}` : ""}
                  </span>
                </button>
              ))
            ) : (
              <span className="admin-product-suggestion-empty">
                {isLoading ? labels.search : labels.empty}
              </span>
            )}
          </div>
        ) : null}
      </div>
      <button type="submit">{labels.search}</button>
    </form>
  );
}
