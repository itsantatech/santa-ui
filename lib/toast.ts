"use client";

export type ToastTone = "success" | "error" | "info";

export type ToastItem = {
  description?: string;
  id?: string;
  title: string;
  tone: ToastTone;
};

type ToastEventDetail = ToastItem & {
  id: string;
};

const toastEventName = "santa-ui:toast";

export function showToast(input: ToastItem) {
  if (typeof window === "undefined") {
    return;
  }

  const detail: ToastEventDetail = {
    ...input,
    id: input.id ?? createToastId(),
  };

  window.dispatchEvent(new CustomEvent<ToastEventDetail>(toastEventName, { detail }));
}

export function showSuccessToast(title: string, description?: string) {
  showToast({ description, title, tone: "success" });
}

export function showErrorToast(title: string, description?: string) {
  showToast({ description, title, tone: "error" });
}

export function showInfoToast(title: string, description?: string) {
  showToast({ description, title, tone: "info" });
}

export function subscribeToToasts(
  listener: (toast: ToastEventDetail) => void,
) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handler = (event: Event) => {
    const customEvent = event as CustomEvent<ToastEventDetail>;
    listener(customEvent.detail);
  };

  window.addEventListener(toastEventName, handler as EventListener);

  return () => {
    window.removeEventListener(toastEventName, handler as EventListener);
  };
}

function createToastId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
