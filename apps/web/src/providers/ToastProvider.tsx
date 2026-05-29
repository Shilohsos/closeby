import React, { createContext, useCallback, useContext, useReducer } from 'react';
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';

type ToastVariant = 'default' | 'destructive' | 'success';

type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  open: boolean;
};

type AddAction = { type: 'ADD'; toast: Omit<ToastItem, 'id' | 'open'> };
type DismissAction = { type: 'DISMISS'; id: string };

function reducer(state: ToastItem[], action: AddAction | DismissAction): ToastItem[] {
  if (action.type === 'ADD') {
    return [...state.slice(-4), { ...action.toast, id: crypto.randomUUID(), open: true }];
  }
  return state.map((t) => (t.id === action.id ? { ...t, open: false } : t));
}

type ToastOptions = { title?: string; description?: string; variant?: ToastVariant };
type ToastContextType = { toast: (opts: ToastOptions) => void };

const ToastContext = createContext<ToastContextType | null>(null);

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within AppToastProvider');
  return ctx;
}

export function AppToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, dispatch] = useReducer(reducer, []);

  const toast = useCallback((opts: ToastOptions) => {
    dispatch({ type: 'ADD', toast: opts });
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      <ToastProvider>
        {children}
        {toasts.map((t) => (
          <Toast
            key={t.id}
            variant={t.variant}
            open={t.open}
            onOpenChange={(open) => { if (!open) dispatch({ type: 'DISMISS', id: t.id }); }}
          >
            <div className="grid gap-1">
              {t.title && <ToastTitle>{t.title}</ToastTitle>}
              {t.description && <ToastDescription>{t.description}</ToastDescription>}
            </div>
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </ToastContext.Provider>
  );
}
