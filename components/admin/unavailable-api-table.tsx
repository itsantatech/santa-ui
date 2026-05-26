import type { Locale } from "@/lib/i18n";
import {
  AdminDataTable,
  type AdminDataTableColumn,
} from "./admin-data-table";

type MissingApiRow = {
  resource: string;
  status: string;
};

export function UnavailableApiTable({
  locale,
  resource,
}: {
  locale: Locale;
  resource: string;
}) {
  const labels = getUnavailableApiLabels(locale);
  const rows: MissingApiRow[] = [
    {
      resource,
      status: labels.status,
    },
  ];
  const columns: AdminDataTableColumn<MissingApiRow>[] = [
    {
      key: "resource",
      header: labels.columns.resource,
      className: "admin-table-code-column",
      render: (row) => <strong>{row.resource}</strong>,
    },
    {
      key: "status",
      header: labels.columns.status,
      className: "admin-table-status-column",
      render: (row) => <span className="admin-table-muted">{row.status}</span>,
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      emptyLabel={labels.empty}
      getRowId={(row) => row.resource}
      rows={rows}
      selectAllLabel={labels.selectAll}
      selectRowLabel={(row) => `${labels.selectRow} ${row.resource}`}
      tableId={`unavailable-${resource}`}
    />
  );
}

function getUnavailableApiLabels(locale: Locale) {
  return locale === "th"
    ? {
        columns: {
          resource: "ทรัพยากร",
          status: "สถานะ",
        },
        status: "ยังไม่พบ List API ใน santa-api",
        empty: "ไม่พบข้อมูล",
        selectAll: "เลือกรายการทั้งหมด",
        selectRow: "เลือกรายการ",
      }
    : {
        columns: {
          resource: "Resource",
          status: "Status",
        },
        status: "No list API exists in santa-api yet",
        empty: "No data",
        selectAll: "Select all rows",
        selectRow: "Select row",
      };
}
