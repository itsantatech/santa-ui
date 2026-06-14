import Link from "next/link";

export function ProductListPagination({
  currentPage,
  getPageHref,
  locale,
  totalPages,
}: {
  currentPage: number;
  getPageHref: (page: number) => string;
  locale: "th" | "en";
  totalPages: number;
}) {
  const normalizedTotalPages = Math.max(1, totalPages);
  const pageStart = Math.max(
    1,
    Math.min(currentPage - 2, Math.max(1, normalizedTotalPages - 4)),
  );
  const pageEnd = Math.min(normalizedTotalPages, Math.max(5, pageStart + 4));
  const pages = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );
  const previousPage = Math.max(1, currentPage - 1);
  const nextPage = Math.min(normalizedTotalPages, currentPage + 1);

  return (
    <nav className="product-list-pagination" aria-label="Product list pagination">
      <Link className="product-list-page-link" href={getPageHref(previousPage)}>
        {locale === "th" ? "ก่อนหน้า" : "Previous"}
      </Link>
      {pages.map((page) => (
        <Link
          aria-current={page === currentPage ? "page" : undefined}
          className={
            page === currentPage
              ? "product-list-page-link product-list-page-link-active"
              : "product-list-page-link"
          }
          href={getPageHref(page)}
          key={page}
        >
          {page}
        </Link>
      ))}
      {pageEnd < normalizedTotalPages ? (
        <>
          <span className="product-list-page-gap" aria-hidden="true">
            ...
          </span>
          <Link
            className={
              normalizedTotalPages === currentPage
                ? "product-list-page-link product-list-page-link-active"
                : "product-list-page-link"
            }
            href={getPageHref(normalizedTotalPages)}
          >
            {normalizedTotalPages}
          </Link>
        </>
      ) : null}
      <Link className="product-list-page-link" href={getPageHref(nextPage)}>
        {locale === "th" ? "ถัดไป" : "Next"}
      </Link>
    </nav>
  );
}
