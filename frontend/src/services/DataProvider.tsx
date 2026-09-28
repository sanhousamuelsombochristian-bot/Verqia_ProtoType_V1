import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import demoJson from '@shared/demo-data.json';
import type { DemoData } from '@/domain/types';
import { api } from './api';
import * as store from './store';
import type { AppState } from './store';

const DEMO = demoJson as unknown as DemoData;
const STORAGE_KEY = 'verqia.demo.v1';

/** Résultat d'une action : null si tout va bien, sinon le message d'erreur à afficher. */
export type ActionResult = Promise<string | null>;

interface DataContextValue {
  data: AppState;
  /** 'api' si le backend Python répond, sinon 'local' (navigateur). */
  source: 'api' | 'local';
  tasks: AppState['tasks'];
  error: string | null;
  claimTask: (id: string) => ActionResult;
  completeTask: (id: string) => ActionResult;
  resetTasks: () => Promise<void>;
  createClient: (i: store.NewClientInput) => ActionResult;
  createInvoice: (i: store.NewInvoiceInput) => ActionResult;
  recordPayment: (i: store.PaymentInput) => ActionResult;
  placeHold: (i: store.HoldInput) => ActionResult;
  decideApproval: (i: store.ApprovalInput) => ActionResult;
  addNote: (i: { invoiceId: string; text: string }) => ActionResult;
  resetDemo: () => Promise<void>;
}

const DataContext = createContext<DataContextValue | null>(null);

function loadLocal(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as AppState;
  } catch {
    /* stockage indisponible ou corrompu : on repart des données de démo */
  }
  return store.initialState(DEMO);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [state, setState] = useState<AppState>(loadLocal);
  const [error, setError] = useState<string | null>(null);
  const sourceRef = useRef(source);
  sourceRef.current = source;

  // Détection du backend : s'il répond, il devient la source de vérité.
  useEffect(() => {
    api.health().then(() => api.state()).then((s) => { setState(s); setSource('api'); }).catch(() => setSource('local'));
  }, []);

  // Persistance locale (mode sans backend uniquement).
  useEffect(() => {
    if (source !== 'local') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state, source]);

  /** Exécute une action : via l'API si disponible, sinon avec le store local. */
  const run = useCallback(
    async (remote: () => Promise<unknown>, local: (s: AppState) => { state: AppState }): ActionResult => {
      setError(null);
      try {
        if (sourceRef.current === 'api') {
          await remote();
          setState(await api.state());
        } else {
          setState((s) => local(s).state);
        }
        return null;
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        return msg;
      }
    },
    [],
  );

  const guarded = useCallback(
    (remote: () => Promise<unknown>, fn: (s: AppState) => { state: AppState }): ActionResult => {
      // Validation préalable sur l'état courant (messages en français, avec ou sans API).
      try {
        fn(state);
      } catch (e) {
        const msg = (e as Error).message;
        setError(msg);
        return Promise.resolve(msg);
      }
      return run(remote, fn);
    },
    [state, run],
  );

  const resetDemo = useCallback(async () => {
    if (sourceRef.current === 'api') {
      await api.resetDemo().catch(() => undefined);
      setState(await api.state());
    } else {
      try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
      setState(store.initialState(DEMO));
    }
    setError(null);
  }, []);

  const value = useMemo<DataContextValue>(() => {
    const data: AppState = { ...state, kpis: store.computeKpis(state) };
    return {
      data,
      source,
      tasks: state.tasks,
      error,
      claimTask: (id) => guarded(() => api.claimTask(id), (s) => store.transitionTask(s, id, 'claim')),
      completeTask: (id) => guarded(() => api.completeTask(id), (s) => store.transitionTask(s, id, 'complete')),
      resetTasks: resetDemo,
      createClient: (i) => guarded(() => api.createClient(i), (s) => store.createClient(s, i)),
      createInvoice: (i) => guarded(() => api.createInvoice(i), (s) => store.createInvoice(s, i)),
      recordPayment: (i) => guarded(() => api.recordPayment(i), (s) => store.recordPayment(s, i)),
      placeHold: (i) => guarded(() => api.placeHold(i), (s) => store.placeHold(s, i)),
      decideApproval: (i) => guarded(() => api.decideApproval(i), (s) => store.decideApproval(s, i)),
      addNote: (i) => guarded(() => api.addNote(i), (s) => store.addNote(s, i)),
      resetDemo,
    };
  }, [state, source, error, guarded, resetDemo]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData doit être utilisé dans <DataProvider>');
  return ctx;
}
