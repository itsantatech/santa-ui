"use client";

import { type FormEvent, useEffect, useId, useState } from "react";

export function AdminResourceSearch<Row>({
  endpoint,
  getKey,
  getLabel,
  locale,
  onSearch,
  onSelect,
  placeholder,
}: {
  endpoint: string;
  getKey: (row: Row) => string;
  getLabel: (row: Row) => string;
  locale: "th" | "en";
  onSearch: (query: string) => void;
  onSelect?: (row: Row) => void;
  placeholder: string;
}) {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Row[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const tooShort = locale === "th" ? "พิมพ์อย่างน้อย 3 ตัวอักษร" : "Enter at least 3 characters";

  useEffect(() => {
    const term = query.trim();
    if (term.length < 3) return;
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const response = await fetch(`${endpoint}${separator}search=${encodeURIComponent(term)}&pageSize=10`, { signal: controller.signal });
        const payload = response.ok ? await response.json() as { items?: Row[] } : null;
        setSuggestions((payload?.items ?? []).slice(0, 10));
        setIsOpen(true);
      } catch { if (!controller.signal.aborted) setSuggestions([]); }
      finally { if (!controller.signal.aborted) setIsLoading(false); }
    }, 180);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [endpoint, query]);

  function submit(event: FormEvent<HTMLFormElement>) { event.preventDefault(); onSearch(query.trim()); setIsOpen(false); }
  return <form className="admin-product-search" onSubmit={submit} role="search"><div className="admin-product-search-field"><label className="sr-only" htmlFor={inputId}>{placeholder}</label><input aria-autocomplete="list" aria-controls={`${inputId}-suggestions`} aria-expanded={isOpen} autoComplete="off" id={inputId} minLength={3} onBlur={() => window.setTimeout(() => setIsOpen(false), 120)} onChange={(event) => { setQuery(event.target.value); if (event.target.value.trim().length < 3) { setSuggestions([]); setIsOpen(false); } }} onFocus={() => suggestions.length > 0 && setIsOpen(true)} placeholder={placeholder} role="combobox" type="search" value={query} />{query.trim().length > 0 && query.trim().length < 3 ? <span className="admin-product-search-hint">{tooShort}</span> : null}{isOpen ? <div className="admin-product-suggestions" id={`${inputId}-suggestions`} role="listbox">{suggestions.length ? suggestions.map((row) => <button aria-selected="false" className="admin-product-suggestion" key={getKey(row)} onClick={() => { setQuery(getKey(row)); onSelect?.(row); onSearch(getKey(row)); setIsOpen(false); }} onMouseDown={(event) => event.preventDefault()} role="option" type="button"><strong>{getKey(row)}</strong><span>{getLabel(row)}</span></button>) : <span className="admin-product-suggestion-empty">{isLoading ? (locale === "th" ? "กำลังค้นหา" : "Searching") : (locale === "th" ? "ไม่พบข้อมูล" : "No results")}</span>}</div> : null}</div><button type="submit">{locale === "th" ? "ค้นหา" : "Search"}</button></form>;
}
