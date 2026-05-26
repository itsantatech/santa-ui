"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { dispatchAdminTableEditRequest } from "./admin-table-events";
import type { AdminDataTableContextAction } from "./admin-data-table";

type ContextMenuState = {
  rowIds: string[];
  x: number;
  y: number;
} | null;

type MenuPosition = {
  left: number;
  top: number;
};

export function AdminTableEnhancer({
  contextMenuActions,
  tableId,
}: {
  contextMenuActions?: AdminDataTableContextAction[];
  tableId: string;
}) {
  const [menu, setMenu] = useState<ContextMenuState>(null);
  const [menuPosition, setMenuPosition] = useState<MenuPosition | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const actions = contextMenuActions ?? [];
  const selectedCountSuffix = useMemo(
    () => (menu && menu.rowIds.length > 1 ? ` (${menu.rowIds.length})` : ""),
    [menu],
  );

  useLayoutEffect(() => {
    if (!menu || !menuRef.current) {
      setMenuPosition(null);
      return;
    }

    const menuElement = menuRef.current;
    const viewportPadding = 12;
    const { innerHeight, innerWidth } = window;
    const rect = menuElement.getBoundingClientRect();

    const left = Math.max(
      viewportPadding,
      Math.min(menu.x, innerWidth - rect.width - viewportPadding),
    );
    const top = Math.max(
      viewportPadding,
      Math.min(menu.y, innerHeight - rect.height - viewportPadding),
    );

    setMenuPosition({ left, top });
  }, [menu]);

  useEffect(() => {
    const tableShell = document.querySelector<HTMLElement>(
      `[data-admin-table-id="${tableId}"]`,
    );

    if (!tableShell) {
      return;
    }

    const tableShellElement = tableShell;

    const selectAllCheckbox = tableShell.querySelector<HTMLInputElement>(
      "[data-admin-table-select-all]",
    );

    function getRowCheckboxes() {
      return Array.from(
        tableShellElement.querySelectorAll<HTMLInputElement>(
          "[data-admin-table-row-select]",
        ),
      );
    }

    function syncHeaderCheckbox() {
      if (!selectAllCheckbox) {
        return;
      }

      const rowCheckboxes = getRowCheckboxes();
      const checkedCount = rowCheckboxes.filter((checkbox) => checkbox.checked).length;

      selectAllCheckbox.checked =
        rowCheckboxes.length > 0 && checkedCount === rowCheckboxes.length;
      selectAllCheckbox.indeterminate =
        checkedCount > 0 && checkedCount < rowCheckboxes.length;
    }

    function syncRowStyles() {
      getRowCheckboxes().forEach((checkbox) => {
        const row = checkbox.closest("tr");

        row?.classList.toggle("admin-table-row-selected", checkbox.checked);
      });
    }

    function setSelection(rowIds: string[], preserveExisting = false) {
      const normalizedIds = new Set(rowIds);

      getRowCheckboxes().forEach((checkbox) => {
        const row = checkbox.closest("tr");
        const rowId = row?.getAttribute("data-admin-table-row-id");

        if (!rowId) {
          return;
        }

        checkbox.checked = preserveExisting
          ? checkbox.checked || normalizedIds.has(rowId)
          : normalizedIds.has(rowId);
      });

      syncRowStyles();
      syncHeaderCheckbox();
    }

    function getSelectedRowIds() {
      return getRowCheckboxes()
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) =>
          checkbox.closest("tr")?.getAttribute("data-admin-table-row-id") ?? "",
        )
        .filter(Boolean);
    }

    function handleCheckboxChange() {
      syncRowStyles();
      syncHeaderCheckbox();
    }

    function handleSelectAllChange() {
      const checked = selectAllCheckbox?.checked ?? false;

      getRowCheckboxes().forEach((checkbox) => {
        checkbox.checked = checked;
      });
      syncRowStyles();
      syncHeaderCheckbox();
    }

    function handleContextMenu(event: MouseEvent) {
      if (actions.length === 0) {
        return;
      }

      const row = (event.target as HTMLElement | null)?.closest<HTMLTableRowElement>(
        "tr[data-admin-table-row-id]",
      );

      if (!row) {
        return;
      }

      event.preventDefault();

      const rowId = row.getAttribute("data-admin-table-row-id");

      if (!rowId) {
        return;
      }

      const checkbox = row.querySelector<HTMLInputElement>(
        "[data-admin-table-row-select]",
      );
      const selectedRowIds = getSelectedRowIds();
      const shouldKeepSelection =
        checkbox?.checked && selectedRowIds.length > 1;

      if (shouldKeepSelection) {
        setSelection(selectedRowIds);
      } else {
        setSelection([rowId]);
      }

      setMenu({
        rowIds: shouldKeepSelection ? selectedRowIds : [rowId],
        x: event.clientX,
        y: event.clientY,
      });
    }

    function closeMenu() {
      setMenu(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu();
      }
    }

    selectAllCheckbox?.addEventListener("change", handleSelectAllChange);
    getRowCheckboxes().forEach((checkbox) => {
      checkbox.addEventListener("change", handleCheckboxChange);
    });
    tableShellElement.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("click", closeMenu);
    document.addEventListener("keydown", handleKeyDown);

    syncRowStyles();
    syncHeaderCheckbox();

    return () => {
      selectAllCheckbox?.removeEventListener("change", handleSelectAllChange);
      getRowCheckboxes().forEach((checkbox) => {
        checkbox.removeEventListener("change", handleCheckboxChange);
      });
      tableShellElement.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("click", closeMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [actions.length, tableId]);

  if (!menu || actions.length === 0) {
    return null;
  }

  return (
    <div
      className="admin-table-context-menu"
      role="menu"
      ref={menuRef}
      style={{
        left: menuPosition?.left ?? menu.x,
        top: menuPosition?.top ?? menu.y,
        visibility: menuPosition ? "visible" : "hidden",
      }}
    >
      {actions.map((action) => (
        <button
          className="admin-table-context-menu-item"
          key={action.id}
          onClick={() => {
            dispatchAdminTableEditRequest({
              actionId: action.id,
              rowIds: menu.rowIds,
              tableId,
            });
            setMenu(null);
          }}
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">
            edit
          </span>
          {action.label}
          {selectedCountSuffix}
        </button>
      ))}
    </div>
  );
}
