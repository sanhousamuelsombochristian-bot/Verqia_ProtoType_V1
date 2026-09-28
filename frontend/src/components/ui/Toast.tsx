import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

type Tone = 'ok' | 'warn';
interface ToastItem { id: number; text: string; tone: Tone }

const ToastContext = createContext<(text: string, tone?: Tone) => void>(() => undefined);

/** Notifications éphémères (« Client créé », « Paiement enregistré »…). */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const push = useCallback((text: string, tone: Tone = 'ok') => {
    const id = Date.now() + Math.random();
    setItems((xs) => [...xs, { id, text, tone }]);
    setTimeout(() => setItems((xs) => xs.filter((x) => x.id !== id)), 4000);
  }, []);
  return (
    <ToastContext.Provider value={push}>
      {children}
      <div className="vq-toasts" role="status" aria-live="polite">
        {items.map((t) => <div key={t.id} className={`vq-toast ${t.tone}`}>{t.text}</div>)}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
