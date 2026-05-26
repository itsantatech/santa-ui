"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

export function AdminTablePageSizeControl({
  currentPageSize,
  rowsPerPageLabel,
}: {
  currentPageSize: number;
  rowsPerPageLabel?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pageSize, setPageSize] = useState(String(currentPageSize));

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedPageSize = Number(pageSize);

    if (
      !Number.isInteger(normalizedPageSize) ||
      normalizedPageSize < 1 ||
      normalizedPageSize > 100
    ) {
      return;
    }

    const nextSearchParams = new URLSearchParams(searchParams.toString());
    nextSearchParams.set("page", "1");
    nextSearchParams.set("pageSize", String(normalizedPageSize));
    router.push(`?${nextSearchParams.toString()}`);
  }

  return (
    <form className="admin-table-page-size" onSubmit={handleSubmit}>
      <label className="admin-table-page-size-label">
        <span>{rowsPerPageLabel ?? "Rows per page"}</span>
        <input
          inputMode="numeric"
          max={100}
          min={1}
          onChange={(event) => setPageSize(event.target.value)}
          type="number"
          value={pageSize}
        />
      </label>
      <button className="admin-table-page-size-submit" type="submit">
        OK
      </button>
    </form>
  );
}
