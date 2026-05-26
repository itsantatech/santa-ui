"use client";

import {
  AdminBatchFieldModal,
  type AdminBatchFieldModalConfig,
} from "./admin-batch-field-modal";

export function AdminBatchStatusModal({
  activeLabel,
  cancelLabel,
  description,
  errorMessage,
  inactiveLabel,
  items,
  onClose,
  onSubmit,
  saveLabel,
  savingLabel,
  statusLabel,
  title,
}: {
  activeLabel: string;
  cancelLabel: string;
  description: string;
  errorMessage: string;
  inactiveLabel: string;
  items: string[];
  onClose: () => void;
  onSubmit: (isActive: boolean) => Promise<void>;
  saveLabel: string;
  savingLabel: string;
  statusLabel: string;
  title: string;
}) {
  const config: AdminBatchFieldModalConfig = {
    fieldLabel: statusLabel,
    options: [
      { label: activeLabel, value: "true" },
      { label: inactiveLabel, value: "false" },
    ],
    type: "boolean",
  };

  return (
    <AdminBatchFieldModal
      cancelLabel={cancelLabel}
      config={config}
      description={description}
      errorMessage={errorMessage}
      items={items}
      onClose={onClose}
      onSubmit={async (value) => onSubmit(Boolean(value))}
      saveLabel={saveLabel}
      savingLabel={savingLabel}
      title={title}
    />
  );
}
