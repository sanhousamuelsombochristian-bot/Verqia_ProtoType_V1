import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { fcfa } from '@/domain/format';
import { STATE_LABEL } from '@/domain/lexique';
import type { OutcomeKey } from '@/domain/types';
import { InvoiceOutcome, OutcomeTag, PageHeader, SectionHead, Toggle } from '@/components/ui';

const STEPS = [
  { k: 'j3', when: 'J−3', label: 'Rappel 3 jours avant l’échéance', desc: 'Un message courtois avant la date', canal: 'E-mail' },
  { k: 'j0', when: 'J0', label: 'Relance le jour de l’échéance', desc: 'Si la facture n’est pas encore payée', canal: 'WhatsApp' },
  { k: 'j7', when: 'J+7', label: 'Relance 7 jours après', desc: 'Proposée dans « À traiter maintenant »', canal: 'WhatsApp' },
  { k: 'j15', when: 'J+15', label: 'Relance 15 jours après', desc: 'Avec proposition d’appel', canal: 'Appel' },
  { k: 'promesse', when: 'Promesse', label: 'Alerte promesse non tenue', desc: 'Quand une date promise est dépassée', canal: 'Alerte' },
];

const GUARDS: [OutcomeKey, string][] = [
  ['PROCEED', 'L’envoi part au moment prévu, dans l’état Planifiée puis En exécution.'],
  ['DEFER', 'Une mise en attente active (facture, client ou organisation) diffère l’envoi jusqu’au réessai prévu.'],
  ['SUPPRESS', 'Le moteur annule l’envoi pour une raison métier, portée par un code de suppression.'],
  ['APPROVAL', 'Aucune exécution automatique : un utilisateur habilité doit décider.'],
  ['OVERRIDDEN', 'Une exception overridée reste revérifiée au moment de l’exécution.'],
];

const RUNS: [string, string, string][] = [
  ['F-0142', '28/09/2026', 'J+7 · relance WhatsApp'],
  ['F-0143', '28/09/2026', 'J−3 · rappel e-mail'],
  ['F-0145', '27/09/2026', 'J+15 · relance WhatsApp'],
  ['F-0146', '28/09/2026', 'J−3 · rappel e-mail'],
];

/** Automatisations : séquence de relance soumise aux décisions du Rule Engine. */
export default function Automatisations() {
  const [on, setOn] = useState<Record<string, boolean>>({ j3: true, j0: true, j7: true, j15: false, promesse: true });
  const { byId } = useInvoices();
  const clients = useClients();

  return (
    <>
      <PageHeader title="Automatisations" sub="Vos séquences de relance, exécutées selon les décisions du Rule Engine." />
      <div className="vq-row">
        <section className="vq-card grow" style={{ gap: 4 }}>
          <SectionHead eyebrow="Séquence de relance" title="Séquence standard" sub="Configurée par vous. Chaque étape propose une action ; le Rule Engine décide si elle s’exécute." />
          {STEPS.map((s) => (
            <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '1px solid var(--line)' }}>
              <span className="vq-rank" style={{ width: 70 }}>{s.when}</span>
              <div style={{ flex: 1 }}><div style={{ fontWeight: 700, color: 'var(--heading)' }}>{s.label}</div><div className="vq-sub">{s.desc}</div></div>
              <span className="vq-chip">{s.canal}</span>
              <Toggle label={s.label} on={on[s.k]} onChange={(v) => setOn({ ...on, [s.k]: v })} />
            </div>
          ))}
          <Link className="vq-link" to="/app/parametres">Modèles de messages et canaux → Paramètres</Link>
        </section>
        <section className="vq-card" style={{ width: 420, flexShrink: 0 }}>
          <SectionHead eyebrow="Garde-fous" title="Avant chaque envoi, le Rule Engine décide" />
          {GUARDS.map(([k, t]) => (
            <div key={k} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <span style={{ minWidth: 150 }}><OutcomeTag outcome={k} /></span>
              <span style={{ fontSize: 13.5, lineHeight: 1.5 }}>{t}</span>
            </div>
          ))}
        </section>
      </div>
      <section className="vq-card">
        <SectionHead eyebrow="Exécutions récentes" title="Ce que la séquence a produit" />
        <div className="vq-table-wrap">
          <table className="vq-table">
            <thead><tr><th>Date</th><th>Facture</th><th>Étape · canal</th><th>Décision</th><th>État de l’action</th></tr></thead>
            <tbody>
              {RUNS.map(([id, date, step]) => {
                const inv = byId(id)!;
                return (
                  <tr key={id}>
                    <td className="vq-muted">{date}</td>
                    <td><div className="strong">{clients.byId(inv.clientId)?.name}</div><div className="small">{id} · {fcfa(inv.amount)} FCFA</div></td>
                    <td>{step}</td>
                    <td><InvoiceOutcome invoice={inv} /></td>
                    <td>{inv.actionState && <><strong>{STATE_LABEL[inv.actionState]}</strong> <span className="vq-code">{inv.actionState}</span></>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
