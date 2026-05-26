"use client";

import { type FormEvent, useMemo, useState } from "react";

export type AdminBatchFieldModalConfig = {
  fieldLabel: string;
  initialValue?: boolean | number | string;
  options?: { label: string; value: string }[];
  placeholder?: string;
  type: "boolean" | "number" | "select" | "text" | "textarea";
};

export function AdminBatchFieldModal({
  cancelLabel,
  config,
  description,
  errorMessage,
  items,
  onClose,
  onSubmit,
  saveLabel,
  savingLabel,
  title,
}: {
  cancelLabel: string;
  config: AdminBatchFieldModalConfig;
  description: string;
  errorMessage: string;
  items: string[];
  onClose: () => void;
  onSubmit: (value: boolean | number | string) => Promise<void>;
  saveLabel: string;
  savingLabel: string;
  title: string;
}) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [textValue, setTextValue] = useState(() =>
    typeof config.initialValue === "string" || typeof config.initialValue === "number"
      ? String(config.initialValue)
      : "",
  );
  const [booleanValue, setBooleanValue] = useState(
    typeof config.initialValue === "boolean" ? config.initialValue : true,
  );
  const selectedValue = useMemo(() => {
    if (config.type === "boolean") {
      return booleanValue;
    }

    if (config.type === "number") {
      return Number(textValue || 0);
    }

    return textValue;
  }, [booleanValue, config.type, textValue]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSaving(true);

    try {
      await onSubmit(selectedValue);
    } catch {
      setError(errorMessage);
      setIsSaving(false);
      return;
    }

    setIsSaving(false);
  }

  return (
    <div className="admin-product-modal-backdrop" role="presentation">
      <div aria-modal="true" className="admin-product-modal" role="dialog">
        <div className="admin-product-modal-header">
          <h2>{title}</h2>
          <button onClick={onClose} type="button">
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
        <form className="admin-product-form" onSubmit={handleSubmit}>
          <div className="admin-product-form-section">
            <p className="admin-product-form-hint">{description}</p>
            <div className="admin-table-relations">
              {items.map((item) => (
                <strong key={item}>{item}</strong>
              ))}
            </div>
          </div>
          <div className="admin-product-form-section">
            <label className="admin-product-field">
              <span>{config.fieldLabel}</span>
              {config.type === "textarea" ? (
                <textarea
                  onChange={(event) => setTextValue(event.target.value)}
                  placeholder={config.placeholder}
                  rows={5}
                  value={textValue}
                />
              ) : null}
              {config.type === "text" || config.type === "number" ? (
                <input
                  onChange={(event) => setTextValue(event.target.value)}
                  placeholder={config.placeholder}
                  type={config.type}
                  value={textValue}
                />
              ) : null}
              {config.type === "select" ? (
                <select
                  onChange={(event) => setTextValue(event.target.value)}
                  value={textValue}
                >
                  {(config.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
              {config.type === "boolean" ? (
                <select
                  onChange={(event) => setBooleanValue(event.target.value === "true")}
                  value={booleanValue ? "true" : "false"}
                >
                  {(config.options ?? [
                    { label: "true", value: "true" },
                    { label: "false", value: "false" },
                  ]).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : null}
            </label>
          </div>
          {error ? <p className="admin-product-error">{error}</p> : null}
          <div className="admin-product-modal-actions">
            <button
              className="admin-product-secondary-button"
              onClick={onClose}
              type="button"
            >
              {cancelLabel}
            </button>
            <button className="admin-product-add-button" disabled={isSaving} type="submit">
              {isSaving ? savingLabel : saveLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
