"use client";

import { type FormEvent, useState } from "react";

type Props = {
  currentPage: number;
  currentPageSize: number;
  disabled?: boolean;
  locale: "th" | "en";
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  totalPages: number;
};

export function ClientTablePagination({
  currentPage,
  currentPageSize,
  disabled = false,
  locale,
  onPageChange,
  onPageSizeChange,
  totalPages,
}: Props) {
  const [pageSize, setPageSize] = useState(String(currentPageSize));
  const normalizedTotalPages = Math.max(1, totalPages);
  const pageStart = Math.max(1, Math.min(currentPage - 2, normalizedTotalPages - 4));
  const pageEnd = Math.min(normalizedTotalPages, pageStart + 4);
  const pages = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );

  function submitPageSize(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPageSize = Number(pageSize);
    if (!Number.isInteger(nextPageSize) || nextPageSize < 1 || nextPageSize > 10_000) return;
    onPageSizeChange(nextPageSize);
  }

  return (
    <nav className="admin-table-pagination" aria-label={locale === "th" ? "แบ่งหน้าตาราง" : "Table pagination"}>
      <form className="admin-table-page-size" onSubmit={submitPageSize}>
        <label className="admin-table-page-size-label">
          <span>{locale === "th" ? "จำนวนต่อหน้า" : "Rows per page"}</span>
          <input disabled={disabled} inputMode="numeric" max={10_000} min={1} onChange={(event) => setPageSize(event.target.value)} type="number" value={pageSize} />
        </label>
        <button className="admin-table-page-size-submit" disabled={disabled} type="submit">OK</button>
      </form>
      <button
        aria-label={locale === "th" ? "หน้าก่อนหน้า" : "Previous page"}
        className="admin-table-page-link"
        disabled={disabled || currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">chevron_left</span>
      </button>
      {pages.map((page) => (
        <button
          aria-current={page === currentPage ? "page" : undefined}
          className={page === currentPage ? "admin-table-page-link admin-table-page-link-active" : "admin-table-page-link"}
          disabled={disabled}
          key={page}
          onClick={() => onPageChange(page)}
          type="button"
        >
          {page}
        </button>
      ))}
      <button
        aria-label={locale === "th" ? "หน้าถัดไป" : "Next page"}
        className="admin-table-page-link"
        disabled={disabled || currentPage >= normalizedTotalPages}
        onClick={() => onPageChange(currentPage + 1)}
        type="button"
      >
        <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
      </button>
    </nav>
  );
}
