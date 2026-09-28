/** Sélecteurs pratiques sur les données de démonstration. */
import { useMemo } from 'react';
import { useData } from '@/services/DataProvider';
import type { Client, Invoice } from '@/domain/types';

export function useInvoices() {
  const { data } = useData();
  return useMemo(() => {
    const all = data.invoices;
    const byId = (id: string) => all.find((i) => i.id === id);
    const queue = all.filter((i) => i.rank !== null).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0));
    const open = all.filter((i) => i.dueStatus !== 'paid');
    return { all, open, queue, byId };
  }, [data]);
}

export function useClients() {
  const { data } = useData();
  return useMemo(() => {
    const withTotals: Client[] = data.clients.map((c) => {
      const open = data.invoices.filter((i: Invoice) => i.clientId === c.id && i.dueStatus !== 'paid');
      return { ...c, openInvoices: open.length, outstanding: open.reduce((s, i) => s + i.amount, 0) };
    });
    const byId = (id: string) => withTotals.find((c) => c.id === id);
    return { clients: withTotals, byId };
  }, [data]);
}
