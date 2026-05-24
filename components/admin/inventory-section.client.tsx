"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useRef, useState, useTransition } from "react";
import { ProductSearch, type ProductSearchSuggestion } from "@/components/product-search";
import type { InventoryLabels, InventoryManagementRow } from "./inventory-section";

export function InventorySearchBar({
  initialSearch = "",
  labels,
  locale,
}: {
  initialSearch?: string;
  labels: InventoryLabels;
  locale: "th" | "en";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function updateTable(nextSearch: string) {
    const trimmedSearch = nextSearch.trim();
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    nextSearchParams.set("section", "inventory");
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

  return (
    <ProductSearch
      initialSearch={initialSearch}
      labels={{
        noSuggestions: labels.noSuggestions,
        search: labels.search,
        searchPlaceholder: labels.searchPlaceholder,
        searchTooShort: labels.searchTooShort,
      }}
      locale={locale}
      onSearch={updateTable}
      onSelect={(product) => updateTable(product.sku)}
      placeholder={labels.searchPlaceholder}
    />
  );
}

export function InventoryToolbarActions({
  labels,
  locale,
}: {
  labels: InventoryLabels;
  locale: "th" | "en";
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUploadOpen, setIsUploadOpen] = useState(false);

  async function handleDownload(path: string, fallbackFilename: string) {
    const response = await fetch(path, { cache: "no-store" });
    if (!response.ok) {
      return;
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fallbackFilename;
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <div className="admin-product-toolbar">
        <button className="admin-product-secondary-button" onClick={() => setIsUploadOpen(true)} type="button">
          <span className="material-symbols-outlined" aria-hidden="true">upload</span>
          {labels.upload}
        </button>
        <button
          className="admin-product-secondary-button"
          onClick={() =>
            void handleDownload(
              `/api/admin/inventory-stocks/export?${searchParams.toString()}`,
              "inventory-stocks-export.xlsx",
            )
          }
          type="button"
        >
          <span className="material-symbols-outlined" aria-hidden="true">download</span>
          {labels.download}
        </button>
        <button
          className="admin-product-add-button"
          onClick={() => setIsAddOpen(true)}
          type="button"
        >
          <span aria-hidden="true">+</span>
          {labels.add}
        </button>
      </div>
      {isAddOpen ? (
        <InventoryFormModal
          labels={labels}
          locale={locale}
          onClose={() => setIsAddOpen(false)}
          onSaved={() => {
            setIsAddOpen(false);
            router.refresh();
          }}
        />
      ) : null}
      {isUploadOpen ? (
        <InventoryUploadModal labels={labels} onClose={() => setIsUploadOpen(false)} />
      ) : null}
    </>
  );
}

export function InventoryRowActions({
  inventory,
  labels,
  locale,
}: {
  inventory: InventoryManagementRow;
  labels: InventoryLabels;
  locale: "th" | "en";
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);

  return (
    <>
      <div className="admin-table-actions">
        <button className="admin-table-icon-button" onClick={() => setMode("edit")} type="button" aria-label={labels.edit}>
          <span className="material-symbols-outlined" aria-hidden="true">edit</span>
        </button>
        <button className="admin-table-icon-button" onClick={() => setMode("delete")} type="button" aria-label={labels.delete}>
          <span className="material-symbols-outlined" aria-hidden="true">delete</span>
        </button>
      </div>
      {mode === "edit" ? (
        <InventoryFormModal
          inventory={inventory}
          labels={labels}
          locale={locale}
          onClose={() => setMode(null)}
          onSaved={() => {
            setMode(null);
            router.refresh();
          }}
        />
      ) : null}
      {mode === "delete" ? (
        <DeleteInventoryModal
          inventory={inventory}
          labels={labels}
          onClose={() => setMode(null)}
          onDeleted={() => {
            setMode(null);
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}

function InventoryFormModal({
  inventory,
  labels,
  locale,
  onClose,
  onSaved,
}: {
  inventory?: InventoryManagementRow;
  labels: InventoryLabels;
  locale: "th" | "en";
  onClose: () => void;
  onSaved: () => void;
}) {
  const [selectedProduct, setSelectedProduct] = useState<ProductSearchSuggestion | null>(
    inventory
      ? {
          sku: inventory.product.sku,
          nameEn: inventory.product.nameEn,
          nameTh: inventory.product.nameTh,
          model: null,
        }
      : null,
  );
  const [stockQuantity, setStockQuantity] = useState(String(inventory?.stockQuantity ?? 0));
  const [lowStockThreshold, setLowStockThreshold] = useState(
    String(inventory?.lowStockThreshold ?? 0),
  );
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!inventory && !selectedProduct) {
      setError(labels.searchPlaceholder);
      return;
    }

    setError("");
    setIsSaving(true);

    const response = await fetch(
      inventory
        ? `/api/admin/inventory-stocks/${encodeURIComponent(inventory.id)}`
        : "/api/admin/inventory-stocks",
      {
        method: inventory ? "PATCH" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          lowStockThreshold: Number(lowStockThreshold || 0),
          productSku: inventory?.productSku ?? selectedProduct?.sku,
          stockQuantity: Number(stockQuantity || 0),
        }),
      },
    );

    setIsSaving(false);

    if (!response.ok) {
      setError(labels.error);
      return;
    }

    onSaved();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{inventory ? labels.editTitle : labels.addTitle}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          {!inventory ? (
            <ProductSearch
              embedded
              labels={{
                noSuggestions: labels.noSuggestions,
                search: labels.search,
                searchPlaceholder: labels.searchPlaceholder,
                searchTooShort: labels.searchTooShort,
              }}
              locale={locale}
              onSelect={(product) => setSelectedProduct(product)}
            />
          ) : null}
          {selectedProduct ? (
            <p className="admin-product-message">{selectedProduct.sku} · {selectedProduct.nameTh}</p>
          ) : null}
          <div className="admin-product-form-grid">
            <label className="admin-product-form-field">
              <span>{labels.columns.stockQuantity}</span>
              <input min="0" onChange={(event) => setStockQuantity(event.target.value)} type="number" value={stockQuantity} />
            </label>
            <label className="admin-product-form-field">
              <span>{labels.columns.lowStockThreshold}</span>
              <input min="0" onChange={(event) => setLowStockThreshold(event.target.value)} type="number" value={lowStockThreshold} />
            </label>
          </div>
          {error ? <p className="admin-product-form-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">{labels.cancel}</button>
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
              {isSaving ? labels.saving : labels.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteInventoryModal({
  inventory,
  labels,
  onClose,
  onDeleted,
}: {
  inventory: InventoryManagementRow;
  labels: InventoryLabels;
  onClose: () => void;
  onDeleted: () => void;
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal admin-product-confirm-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{labels.deleteTitle}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <p>{labels.deleteBodyTemplate.replace("{sku}", inventory.productSku)}</p>
        <div className="admin-product-modal-actions admin-product-confirm-message">
          <button className="admin-product-secondary-button" onClick={onClose} type="button">{labels.cancel}</button>
          <button
            className="admin-product-danger-button"
            disabled={isDeleting}
            onClick={async () => {
              setIsDeleting(true);
              await fetch(`/api/admin/inventory-stocks/${encodeURIComponent(inventory.id)}`, {
                method: "DELETE",
              });
              onDeleted();
            }}
            type="button"
          >
            {labels.delete}
          </button>
        </div>
      </div>
    </div>
  );
}

function InventoryUploadModal({
  labels,
  onClose,
}: {
  labels: InventoryLabels;
  onClose: () => void;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleTemplateDownload() {
    const response = await fetch("/api/admin/inventory-stocks/template", {
      cache: "no-store",
    });

    if (!response.ok) {
      setError(labels.error);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "inventory-stocks-template.xlsx";
    link.click();
    URL.revokeObjectURL(url);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    setIsSaving(true);
    setError("");
    setSummary("");
    const response = await fetch("/api/admin/inventory-stocks/import", {
      method: "POST",
      body: formData,
    });
    setIsSaving(false);
    if (!response.ok) {
      setError(labels.error);
      return;
    }

    const result = (await response.json()) as {
      created: number;
      failed: number;
      updated: number;
    };

    setSummary(
      `Created ${result.created}, updated ${result.updated}, failed ${result.failed}`,
    );
    router.refresh();
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div
        aria-modal="true"
        className="admin-product-modal admin-product-confirm-modal"
        role="dialog"
      >
        <div className="admin-product-modal-header">
          <h2>{labels.upload}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-product-upload-body admin-inventory-upload-body">
            <button
              className="admin-product-secondary-button admin-inventory-template-button"
              onClick={() => void handleTemplateDownload()}
              type="button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">description</span>
              {labels.template}
            </button>
            <div className="admin-inventory-file-picker">
              <input
                accept=".csv,.xlsx"
                className="admin-inventory-file-input"
                hidden
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
                ref={fileInputRef}
                type="file"
              />
              <button
                className="admin-product-secondary-button admin-inventory-file-button"
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                <span className="material-symbols-outlined" aria-hidden="true">upload_file</span>
                {labels.chooseFile}
              </button>
              <span className={file ? "admin-inventory-file-name" : "admin-inventory-file-name admin-inventory-file-name-muted"}>
                {file ? file.name : labels.noFileChosen}
              </span>
            </div>
            {error ? <p className="admin-product-form-error">{error}</p> : null}
            {summary ? <p className="admin-product-file-note">{summary}</p> : null}
          </div>
          <div className="admin-product-modal-actions">
            <button className="admin-product-secondary-button" onClick={onClose} type="button">{labels.cancel}</button>
            <button className="admin-product-add-button" disabled={!file || isSaving} type="submit">
              {isSaving ? labels.saving : labels.upload}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
