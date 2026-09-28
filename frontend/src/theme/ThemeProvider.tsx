import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

export type Mode = 'sombre' | 'clair';
const KEY = 'verqia.mode';

const ThemeContext = createContext<{ mode: Mode; toggle: () => void }>({ mode: 'sombre', toggle: () => undefined });

function initialMode(): Mode {
  try {
    const saved = localStorage.getItem(KEY);
    if (saved === 'clair' || saved === 'sombre') return saved;
  } catch {
    /* stockage indisponible : mode par défaut */
  }
  return 'sombre';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(initialMode);
  useEffect(() => {
    document.documentElement.dataset.theme = mode;
    try {
      localStorage.setItem(KEY, mode);
    } catch {
      /* ignore */
    }
  }, [mode]);
  return (
    <ThemeContext.Provider value={{ mode, toggle: () => setMode((m) => (m === 'sombre' ? 'clair' : 'sombre')) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
