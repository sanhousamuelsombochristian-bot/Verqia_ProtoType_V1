import { useCallback, useState } from 'react';

/** État du panneau « Pourquoi ? » : identifiant de la facture ouverte. */
export function useDrawer() {
  const [selected, setSelected] = useState<string | null>(null);
  const open = useCallback((id: string) => setSelected(id), []);
  const close = useCallback(() => setSelected(null), []);
  return { selected, open, close };
}
