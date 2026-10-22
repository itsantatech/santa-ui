"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useId, useRef, useState, useTransition } from "react";

type ProductFilterChip = {
  label: string;
  parentValue?: string;
  value: string;
};

export type ProductFilterOption = ProductFilterChip;

type ProductFilterField = {
  dependsOn?: string;
  disabledPlaceholder?: string;
  id: string;
  label: string;
  options?: ProductFilterOption[];
  placeholder?: string;
  searchable?: boolean;
  selected?: ProductFilterChip[];
  showOptionCount?: boolean;
};

export type ProductFilterProps = {
  resultCount: number;
  resultLabel: string;
  resultUnit: string;
  title: string;
  fields: ProductFilterField[];
  locale: string;
  removeFilterLabel?: string;
  syncQueryParams?: boolean;
  variant?: "default" | "admin";
};

function FilterIcon() {
  return (
    <svg aria-hidden="true" className="product-filter-title-icon" viewBox="0 0 24 24">
      <path
        d="M3.5 5.5h17l-6.8 7.6v5.8l-3.4-1.7v-4.1L3.5 5.5Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" className="product-filter-chip-icon" viewBox="0 0 16 16">
      <path
        d="m4 4 8 8m0-8-8 8"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.7"
      />
    </svg>
  );
}

function getInitialFieldValues(fields: ProductFilterField[]) {
  return Object.fromEntries(
    fields.map((field) => [
      field.id,
      field.selected?.[0]?.value ?? "",
    ]),
  );
}

export function ProductFilter({
  fields,
  locale,
  removeFilterLabel = "Remove filter",
  resultCount,
  resultLabel,
  resultUnit,
  syncQueryParams = false,
  title,
  variant = "default",
}: ProductFilterProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [selectedValues, setSelectedValues] = useState<Record<string, string>>(
    () => getInitialFieldValues(fields),
  );

  return (
    <section
      className={
        variant === "admin"
          ? "product-filter-section product-filter-section-admin"
          : "product-filter-section"
      }
      aria-labelledby="product-filter-heading"
    >
      <h1 id="product-filter-heading" className="product-filter-result-heading">
        {resultLabel} {resultCount.toLocaleString(locale)} {resultUnit}
      </h1>

      <form className="product-filter-card" action="">
        <div className="product-filter-title-row">
          <FilterIcon />
          <h2>{title}</h2>
        </div>

        <div className="product-filter-grid">
          {fields.map((field) => (
            <div className="product-filter-field" key={field.label}>
              <span className="product-filter-field-label">
                {field.label}
                {field.showOptionCount
                  ? ` (${getAvailableOptions(field, selectedValues)?.length ?? 0})`
                  : ""}
              </span>
              <FilterSelect
                availableOptions={getAvailableOptions(field, selectedValues)}
                field={field}
                onChange={(value) => {
                  const nextSelectedValues = getNextSelectedValues(
                    fields,
                    selectedValues,
                    field.id,
                    value,
                  );

                  setSelectedValues(nextSelectedValues);

                  if (syncQueryParams) {
                    const nextSearchParams = new URLSearchParams(
                      searchParams.toString(),
                    );

                    nextSearchParams.delete("page");

                    for (const [key, nextValue] of Object.entries(nextSelectedValues)) {
                      if (nextValue) {
                        nextSearchParams.set(key, nextValue);
                      } else {
                        nextSearchParams.delete(key);
                      }
                    }

                    startTransition(() => {
                      router.replace(`${pathname}?${nextSearchParams.toString()}`);
                    });
                  }
                }}
                removeFilterLabel={removeFilterLabel}
                selectedValue={selectedValues[field.id] ?? ""}
                selectedValues={selectedValues}
              />
            </div>
          ))}
        </div>
      </form>
    </section>
  );
}

function getAvailableOptions(
  field: ProductFilterField,
  selectedValues: Record<string, string>,
) {
  if (!field.options) {
    return undefined;
  }

  if (!field.dependsOn) {
    return field.options;
  }

  const parentValue = selectedValues[field.dependsOn];

  if (!parentValue) {
    return [];
  }

  return field.options.filter((option) => option.parentValue === parentValue);
}

function getNextSelectedValues(
  fields: ProductFilterField[],
  current: Record<string, string>,
  fieldId: string,
  value: string,
) {
  const next = {
    ...current,
    [fieldId]: value,
  };

  for (const field of fields) {
    if (!field.dependsOn) {
      continue;
    }

    const availableOptions = getAvailableOptions(field, next);

    if (!availableOptions?.some((option) => option.value === next[field.id])) {
      next[field.id] = "";
    }
  }

  return next;
}

function FilterSelect({
  availableOptions,
  field,
  onChange,
  removeFilterLabel,
  selectedValue,
  selectedValues,
}: {
  availableOptions?: ProductFilterOption[];
  field: ProductFilterField;
  onChange: (value: string) => void;
  removeFilterLabel: string;
  selectedValue: string;
  selectedValues: Record<string, string>;
}) {
  const listId = useId();
  const [searchValue, setSearchValue] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);

  useEffect(() => {
    if (!isSearchOpen || !inputRef.current) return;

    const updatePosition = () => {
      const rect = inputRef.current?.getBoundingClientRect();
      if (rect) {
        setDropdownPosition({ left: rect.left, top: rect.bottom + 6, width: rect.width });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [isSearchOpen]);
  if (field.options) {
    const parentValue = field.dependsOn ? selectedValues[field.dependsOn] : undefined;
    const isDisabled = Boolean(field.dependsOn && !parentValue) || !availableOptions?.length;
    const placeholder =
      !parentValue && field.dependsOn
        ? (field.disabledPlaceholder ?? field.placeholder ?? "")
        : (field.placeholder ?? "");

    if (field.searchable) {
      const selectedOption = availableOptions?.find((option) => option.value === selectedValue);
      const displayedValue = searchValue || selectedOption?.label || "";
      const matchingOptions = (availableOptions ?? [])
        .filter((option) => option.label.toLowerCase().includes(searchValue.toLowerCase()))
        .slice(0, 10);
      return <div className="product-filter-select product-filter-select-dropdown">
        <input
          aria-label={field.label}
          autoComplete="off"
          disabled={isDisabled}
          ref={inputRef}
          onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 120)}
          onChange={(event) => {
            const nextValue = event.target.value;
            setSearchValue(nextValue);
            setIsSearchOpen(true);
            if (!nextValue) onChange("");
            if (selectedOption && nextValue !== selectedOption.label) onChange("");
            const match = availableOptions?.find((option) => option.label === nextValue);
            if (match) {
              onChange(match.value);
            }
          }}
          onFocus={() => setIsSearchOpen(true)}
          placeholder={placeholder}
          type="search"
          value={displayedValue}
        />
        {isSearchOpen && dropdownPosition && typeof document !== "undefined"
          ? createPortal(
              <div
                className="product-filter-search-options"
                id={listId}
                role="listbox"
                style={{
                  left: dropdownPosition.left,
                  position: "fixed",
                  top: dropdownPosition.top,
                  width: dropdownPosition.width,
                  zIndex: 1000,
                }}
              >
                {matchingOptions.map((option) => <button aria-selected={option.value === selectedValue} key={option.value} onClick={() => { onChange(option.value); setSearchValue(""); setIsSearchOpen(false); }} onMouseDown={(event) => event.preventDefault()} role="option" type="button">{option.label}</button>)}
              </div>,
              document.body,
            )
          : null}
        {selectedValue ? <button aria-label={removeFilterLabel} className="product-filter-chip" onClick={() => onChange("")} type="button"><CloseIcon /></button> : null}
      </div>;
    }

    return (
      <div className="product-filter-select product-filter-select-dropdown">
        <select
          aria-label={field.label}
          disabled={isDisabled}
          onChange={(event) => onChange(event.target.value)}
          value={selectedValue}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {(availableOptions ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <span className="material-symbols-outlined product-filter-select-icon" aria-hidden="true">
          expand_more
        </span>
      </div>
    );
  }

  return (
    <div className="product-filter-select" aria-label={field.label}>
      {(field.selected ?? []).map((item) => (
        <button
          aria-label={`${removeFilterLabel}: ${item.label}`}
          className="product-filter-chip"
          key={item.value}
          type="button"
        >
          <span>{item.label}</span>
          <CloseIcon />
        </button>
      ))}
    </div>
  );
}
