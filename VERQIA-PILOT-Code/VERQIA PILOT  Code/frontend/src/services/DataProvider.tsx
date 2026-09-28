import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import demoJson from '@shared/demo-data.json';
import type { DemoData, Task } from '@/domain/types';
import { api } from './api';

const DEMO = demoJson as unknown as DemoData;

interface DataContextValue {
  data: DemoData;
  /** 'api' si le backend Python répond, sinon 'local'. */
  source: 'api' | 'local';
  tasks: Task[];
  claimTask: (id: string) => Promise<void>;
  completeTask: (id: string) => Promise<void>;
  resetTasks: () => Promise<void>;
  error: string | null;
}

const DataContext = createContext<DataContextValue | null>(null);

/** Transitions locales (miroir de backend/app/routers/tasks.py). */
function localTransition(task: Task, action: 'claim' | 'complete'): Task {
  if (action === 'claim') {
    if (task.blockedByApproval) throw new Error('Approbation requise : prise en charge impossible.');
    if (!['RESCHEDULED', 'PROPOSED'].includes(task.state)) throw new Error('Transition impossible.');
    return { ...task, state: 'CLAIMED' };
  }
  if (task.state !== 'CLAIMED') throw new Error('Seule une tâche prise en charge peut être clôturée.');
  return { ...task, state: 'COMPLETED' };
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [source, setSource] = useState<'api' | 'local'>('local');
  const [tasks, setTasks] = useState<Task[]>(DEMO.tasks);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .health()
      .then(() => api.tasks())
      .then((t) => {
        setTasks(t);
        setSource('api');
      })
      .catch(() => setSource('local'));
  }, []);

  const run = useCallback(
    async (id: string, action: 'claim' | 'complete') => {
      setError(null);
      try {
        if (source === 'api') {
          const updated = action === 'claim' ? await api.claimTask(id) : await api.completeTask(id);
          setTasks((ts) => ts.map((t) => (t.id === id ? updated : t)));
        } else {
          setTasks((ts) => ts.map((t) => (t.id === id ? localTransition(t, action) : t)));
        }
      } catch (e) {
        setError((e as Error).message);
      }
    },
    [source],
  );

  const resetTasks = useCallback(async () => {
    if (source === 'api') await api.resetDemo().catch(() => undefined);
    setTasks(DEMO.tasks);
  }, [source]);

  const value = useMemo<DataContextValue>(
    () => ({
      data: DEMO,
      source,
      tasks,
      error,
      claimTask: (id) => run(id, 'claim'),
      completeTask: (id) => run(id, 'complete'),
      resetTasks,
    }),
    [source, tasks, error, run, resetTasks],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData doit être utilisé dans <DataProvider>');
  return ctx;
}
