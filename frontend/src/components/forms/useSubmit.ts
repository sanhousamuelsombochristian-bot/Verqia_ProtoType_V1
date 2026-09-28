import { useState } from 'react';
import { useToast } from '@/components/ui';
import type { ActionResult } from '@/services/DataProvider';

/** Gère l'état « en cours / erreur » d'un formulaire relié à une action du store. */
export function useSubmit(onDone: () => void) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const submit = async (action: () => ActionResult, success: string) => {
    setBusy(true);
    setError(null);
    const err = await action();
    setBusy(false);
    if (err) setError(err);
    else {
      toast(success);
      onDone();
    }
  };
  return { busy, error, setError, submit };
}
