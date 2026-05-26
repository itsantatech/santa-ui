import Link from "next/link";
import type { ReactNode } from "react";
import { AdminTableEnhancer } from "./admin-table-enhancer";
import { AdminTablePageSizeControl } from "./admin-table-page-size-control";

export type AdminDataTableColumn<Row> = {
  key: string;
  header: ReactNode;
  className?: string;
  width?: string;
  render: (row: Row) => ReactNode;
};

export type AdminDataTableContextAction = {
  id: string;
  label: string;
};

export type AdminDataTablePagination = {
  currentPage: number;
  currentPageSize?: number;
  totalPages: number;
  getPageHref: (page: number) => string;
  previousLabel: string;
  nextLabel: string;
  rowsPerPageLabel?: string;
};

type AdminDataTableProps<Row> = {
  rows: Row[];
  columns: AdminDataTableColumn<Row>[];
  tableId: string;
  getRowId: (row: Row) => string;
  getRowClassName?: (row: Row) => string | undefined;
  emptyLabel?: string;
  selectAllLabel: string;
  selectRowLabel: (row: Row) => string;
  pagination?: AdminDataTablePagination;
  wide?: boolean;
  contextMenuActions?: AdminDataTableContextAction[];
  editActionLabel?: string;
};

export function AdminStatusBadge({
  label,
  tone = "active",
}: {
  label: string;
  tone?: "active" | "inactive";
}) {
  return (
    <span className={`admin-status-badge admin-status-badge-${tone}`}>
      <span aria-hidden="true" />
      {label}
    </span>
  );
}

export function AdminRowActions({
  deleteLabel,
  editLabel,
}: {
  deleteLabel: string;
  editLabel: string;
}) {
  return (
    <div className="admin-table-actions">
      <button className="admin-table-icon-button" type="button" aria-label={editLabel}>
        <span className="material-symbols-outlined" aria-hidden="true">
          edit
        </span>
      </button>
      <button className="admin-table-icon-button" type="button" aria-label={deleteLabel}>
        <span className="material-symbols-outlined" aria-hidden="true">
          delete
        </span>
      </button>
    </div>
  );
}

export function AdminCategoryChip({ children }: { children: ReactNode }) {
  return <span className="admin-category-chip">{children}</span>;
}

export function AdminDataTable<Row>({
  columns,
  contextMenuActions,
  editActionLabel,
  emptyLabel,
  getRowId,
  getRowClassName,
  pagination,
  rows,
  selectAllLabel,
  selectRowLabel,
  tableId,
  wide = false,
}: AdminDataTableProps<Row>) {
  return (
    <div className="admin-table-shell" data-admin-table-id={tableId}>
      <div className="admin-table-scroll">
        <table
          className={
            wide
              ? "admin-data-table admin-data-table-wide"
              : "admin-data-table"
          }
        >
          <colgroup>
            <col className="admin-table-select-col" />
            {columns.map((column) => (
              <col key={column.key} style={{ width: column.width }} />
            ))}
          </colgroup>
          <thead>
            <tr>
              <th className="admin-table-select-cell" scope="col">
                <label className="admin-table-checkbox-label">
                  <span className="sr-only">{selectAllLabel}</span>
                  <input data-admin-table-select-all type="checkbox" />
                </label>
              </th>
              {columns.map((column) => (
                <th className={column.className} key={column.key} scope="col">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  className={getRowClassName?.(row)}
                  data-admin-table-row-id={getRowId(row)}
                  key={getRowId(row)}
                >
                  <td className="admin-table-select-cell">
                    <label className="admin-table-checkbox-label">
                      <span className="sr-only">{selectRowLabel(row)}</span>
                      <input data-admin-table-row-select type="checkbox" />
                    </label>
                  </td>
                  {columns.map((column) => (
                    <td className={column.className} key={column.key}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td className="admin-table-empty-cell" colSpan={columns.length + 1}>
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AdminTableEnhancer
        contextMenuActions={
          contextMenuActions ??
          (editActionLabel ? [{ id: "edit", label: editActionLabel }] : undefined)
        }
        tableId={tableId}
      />
      {pagination ? <AdminTablePagination pagination={pagination} /> : null}
    </div>
  );
}

function AdminTablePagination({
  pagination,
}: {
  pagination: AdminDataTablePagination;
}) {
  const totalPages = Math.max(1, pagination.totalPages);
  const pageStart = Math.max(1, Math.min(pagination.currentPage - 2, totalPages - 4));
  const pageEnd = Math.min(totalPages, pageStart + 4);
  const pages = Array.from(
    { length: pageEnd - pageStart + 1 },
    (_, index) => pageStart + index,
  );
  const previousPage = Math.max(1, pagination.currentPage - 1);
  const nextPage = Math.min(totalPages, pagination.currentPage + 1);

  return (
    <nav className="admin-table-pagination" aria-label="Table pagination">
      {pagination.currentPageSize ? (
        <AdminTablePageSizeControl
          currentPageSize={pagination.currentPageSize}
          rowsPerPageLabel={pagination.rowsPerPageLabel}
        />
      ) : null}
      <Link
        aria-label={pagination.previousLabel}
        className="admin-table-page-link"
        href={pagination.getPageHref(previousPage)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          chevron_left
        </span>
      </Link>
      {pages.map((page) => (
        <Link
          aria-current={page === pagination.currentPage ? "page" : undefined}
          className={
            page === pagination.currentPage
              ? "admin-table-page-link admin-table-page-link-active"
              : "admin-table-page-link"
          }
          href={pagination.getPageHref(page)}
          key={page}
        >
          {page}
        </Link>
      ))}
      <Link
        aria-label={pagination.nextLabel}
        className="admin-table-page-link"
        href={pagination.getPageHref(nextPage)}
      >
        <span className="material-symbols-outlined" aria-hidden="true">
          chevron_right
        </span>
      </Link>
    </nav>
  );
}
