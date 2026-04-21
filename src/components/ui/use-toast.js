/**
 * Minimal but correct toast hook.
 *
 * Problems with the original:
 *  - useToast() only returned { toast } — never a `toasts` array.
 *  - Toaster.jsx destructured { toasts } → always undefined → nothing rendered.
 *
 * This version uses a tiny shared pub/sub store that works
 * across any number of component instances without a Context Provider.
 */

import { useState, useEffect, useCallback } from "react";

let _id = 0;
let _toasts = [];
const _listeners = new Set();

const notify = () => _listeners.forEach(fn => fn([..._toasts]));

const addToast = ({ title, description, variant = "default", duration = 4000 }) => {
  const id = ++_id;
  const toast = { id, title, description, variant, open: true };
  _toasts = [toast, ..._toasts].slice(0, 5); // keep max 5
  notify();

  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }
  return id;
};

const dismissToast = (id) => {
  _toasts = _toasts.map(t => (t.id === id ? { ...t, open: false } : t));
  notify();
  // Remove from array after animation (~300 ms)
  setTimeout(() => {
    _toasts = _toasts.filter(t => t.id !== id);
    notify();
  }, 350);
};

export function useToast() {
  const [toasts, setToasts] = useState(_toasts);

  useEffect(() => {
    _listeners.add(setToasts);
    return () => _listeners.delete(setToasts);
  }, []);

  const toast = useCallback((opts) => {
    // Support both object form { description, variant } and shorthand string
    if (typeof opts === "string") return addToast({ description: opts });
    return addToast(opts);
  }, []);

  return { toasts, toast, dismiss: dismissToast };
}

export default useToast;
