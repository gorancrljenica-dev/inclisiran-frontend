"use client";

import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

// ─── Toast display component ──────────────────────────────────────────────────

interface ToastProps {
  message: string;
  type: "success" | "error";
  onHide: () => void;
}

export function Toast({ message, type, onHide }: ToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setTimeout(onHide, 3000);
    return () => clearTimeout(timer);
  }, [onHide]);

  if (!mounted) return null;

  const colorClass =
    type === "success"
      ? "bg-green-600"
      : "bg-red-600";

  return createPortal(
    <div
      className={`fixed top-4 right-4 z-[9999] ${colorClass} text-white text-sm font-medium px-4 py-3 rounded-lg shadow-lg max-w-xs`}
    >
      {message}
    </div>,
    document.body
  );
}

// ─── useToast hook ────────────────────────────────────────────────────────────

interface ToastState {
  message: string;
  type: "success" | "error";
}

export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, type: "success" | "error") => {
    setToast({ message, type });
  }, []);

  const hide = useCallback(() => setToast(null), []);

  return { toast, show, hide };
}
