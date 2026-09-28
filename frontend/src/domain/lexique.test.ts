import { describe, expect, it } from 'vitest';
import { dueText, outcomeCode, outcomeKey, priorityClass, riskClass, OUTCOME_LABEL } from './lexique';
import demo from '@shared/demo-data.json';
import type { Invoice } from './types';

const inv = (id: string) => (demo.invoices as Invoice[]).find((i) => i.id === id)!;

describe('vocabulaire métier', () => {
  it('distingue approbation requise et à exécuter', () => {
    expect(outcomeKey(inv('F-0144'))).toBe('APPROVAL');
    expect(outcomeKey(inv('F-0142'))).toBe('PROCEED');
    expect(OUTCOME_LABEL[outcomeKey(inv('F-0145'))]).toBe('Différée');
  });
  it('affiche les codes moteur seulement en détail', () => {
    expect(outcomeCode('APPROVAL')).toBe('PROCEED · requires_approval');
    expect(outcomeCode('NONE')).toBe('—');
  });
  it('produit des classes CSS sans accents', () => {
    expect(riskClass('Élevé')).toBe('eleve');
    expect(priorityClass('Urgente')).toBe('urgente');
  });
  it('formule le statut d’échéance', () => {
    expect(dueText(inv('F-0142'))).toBe('En retard · 12 j');
    expect(dueText(inv('F-0141'))).toBe('Payée · 26/09');
  });
});

describe('données de démonstration', () => {
  it('reste cohérente avec les indicateurs', () => {
    const open = (demo.invoices as Invoice[]).filter((i) => i.dueStatus !== 'paid');
    expect(open.reduce((s, i) => s + i.amount, 0)).toBe(demo.kpis.openReceivables.value);
  });
});
