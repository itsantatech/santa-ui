"use client";

import { useEffect, useState } from "react";
import { subscribeToToasts, type ToastTone } from "@/lib/toast";

type ActiveToast = {
  description?: string;
  id: string;
  title: string;
  tone: ToastTone;
};

const toastLifetimeMs = 4200;

export function AppToastHost() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);

  useEffect(() => {
    return subscribeToToasts((toast) => {
      setToasts((current) => [...current, toast]);
      window.setTimeout(() => {
        setToasts((current) => current.filter((item) => item.id !== toast.id));
      }, toastLifetimeMs);
    });
  }, []);

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="app-toast-stack" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div
          className={`app-toast app-toast-${toast.tone}`}
          key={toast.id}
          role={toast.tone === "error" ? "alert" : "status"}
        >
          <div className="app-toast-copy">
            <strong>{toast.title}</strong>
            {toast.description ? <p>{toast.description}</p> : null}
          </div>
          <button
            aria-label="Dismiss notification"
            className="app-toast-close"
            onClick={() =>
              setToasts((current) => current.filter((item) => item.id !== toast.id))
            }
            type="button"
          >
            <span className="material-symbols-outlined" aria-hidden="true">
              close
            </span>
          </button>
        </div>
      ))}
    </div>
  );
}
