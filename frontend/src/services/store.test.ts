import { describe, expect, it } from 'vitest';
import demo from '@shared/demo-data.json';
import type { DemoData } from '@/domain/types';
import * as store from './store';

const fresh = () => store.initialState(demo as unknown as DemoData);

describe('store (actions des boutons)', () => {
  it('crée un client non évalué par le moteur', () => {
    const { state, client } = store.createClient(fresh(), { name: 'Pharmacie Exemple G' });
    expect(client.id).toBe('G');
    expect(client.rank).toBeNull();
    expect(state.events[0].title).toBe('Client créé');
  });

  it('refuse un client en double', () => {
    expect(() => store.createClient(fresh(), { name: 'BTP Exemple B' })).toThrow(store.StoreError);
  });

  it('crée une facture sans décision du Rule Engine', () => {
    const { state, invoice } = store.createInvoice(fresh(), { clientId: 'A', amount: 500000, dueDate: '2026-10-03' });
    expect(invoice.id).toBe('F-0149');
    expect(invoice.dueStatus).toBe('near');
    expect(invoice.outcome).toBeNull();
    expect(state.decisions['F-0149'].stepIndex).toBe(-2);
  });

  it('enregistre un paiement partiel puis total', () => {
    let s = store.recordPayment(fresh(), { invoiceId: 'F-0142', amount: 250000, date: '2026-09-28', method: 'Virement' }).state;
    expect(s.invoices.find((i) => i.id === 'F-0142')!.dueStatus).toBe('late');
    s = store.recordPayment(s, { invoiceId: 'F-0142', amount: 1000000, date: '2026-09-28', method: 'Mobile money' }).state;
    const inv = s.invoices.find((i) => i.id === 'F-0142')!;
    expect(inv.dueStatus).toBe('paid');
    expect(inv.rank).toBeNull();
    expect(store.computeKpis(s).late.value).toBe(2_480_000 - 1_250_000);
  });

  it('refuse un paiement supérieur au reste dû', () => {
    expect(() => store.recordPayment(fresh(), { invoiceId: 'F-0145', amount: 999999, date: '2026-09-28', method: 'Espèces' })).toThrow();
  });

  it('place une mise en attente et la retrouve pour la facture', () => {
    const s = store.placeHold(fresh(), { scope: 'INVOICE', type: 'LEGAL', targetId: 'F-0143', retryAt: '2026-10-10', cause: 'Litige' }).state;
    expect(store.holdsFor(s, s.invoices.find((i) => i.id === 'F-0143')!)).toHaveLength(1);
  });

  it('débloque la tâche après approbation', () => {
    let s = store.decideApproval(fresh(), { invoiceId: 'F-0144', decision: 'APPROVED', reason: 'Appel autorisé' }).state;
    s = store.transitionTask(s, 'T-F0144', 'claim').state;
    expect(s.tasks.find((t) => t.id === 'T-F0144')!.state).toBe('CLAIMED');
  });

  it('calcule les indicateurs à partir des factures', () => {
    const k = store.computeKpis(fresh());
    expect(k.openReceivables.value).toBe(7_640_000);
    expect(k.late.value).toBe(2_480_000);
    expect(k.expected30d.value).toBe(5_160_000);
    expect(k.collectedMonth.value).toBe(2_740_000);
    expect(k.atRisk.value).toBe(4_130_000);
  });
});
