"use client";

import { useEffect } from "react";

export const ADMIN_TABLE_EDIT_REQUEST_EVENT = "admin-table:edit-request";

export type AdminTableEditRequestDetail = {
  actionId: string;
  tableId: string;
  rowIds: string[];
};

export function dispatchAdminTableEditRequest(
  detail: AdminTableEditRequestDetail,
) {
  window.dispatchEvent(
    new CustomEvent<AdminTableEditRequestDetail>(
      ADMIN_TABLE_EDIT_REQUEST_EVENT,
      { detail },
    ),
  );
}

export function useAdminTableEditRequest(
  tableId: string,
  onRequest: (actionId: string, rowIds: string[]) => void,
) {
  useEffect(() => {
    function handleEvent(event: Event) {
      const detail = (
        event as CustomEvent<AdminTableEditRequestDetail>
      ).detail;

      if (!detail || detail.tableId !== tableId) {
        return;
      }

      onRequest(detail.actionId, detail.rowIds);
    }

    window.addEventListener(ADMIN_TABLE_EDIT_REQUEST_EVENT, handleEvent);

    return () => {
      window.removeEventListener(
        ADMIN_TABLE_EDIT_REQUEST_EVENT,
        handleEvent,
      );
    };
  }, [onRequest, tableId]);
}
