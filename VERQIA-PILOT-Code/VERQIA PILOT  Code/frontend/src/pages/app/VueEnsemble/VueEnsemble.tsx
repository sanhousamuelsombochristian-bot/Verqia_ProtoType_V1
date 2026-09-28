import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { fcfa } from '@/domain/format';
import { DecisionDrawer } from '@/components/decision';
import { ForecastChart, SCENARIO_LABEL, type ScenarioKey } from '@/components/charts/ForecastChart/ForecastChart';
import { DimensionsLegend, EventList, InvoiceOutcome, KpiCard, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, SectionHead, Segmented } from '@/components/ui';
import { RiskBreakdown } from './RiskBreakdown';
import './VueEnsemble.css';

const HORIZONS = [7, 30, 60, 90, 180, 365];

/** Vue d'ensemble : synthèse financière, risque, « À traiter maintenant », trésorerie, événements. */
export default function VueEnsemble() {
  const { data } = useData();
  const { queue } = useInvoices();
  const { clients } = useClients();
  const drawer = useDrawer();
  const [sc, setSc] = useState<ScenarioKey>('base');
  const [hz, setHz] = useState(90);
  const k = data.kpis;

  return (
    <>
      <PageHeader title="Vue d’ensemble" sub="Bonjour, [Prénom] — l’état de votre trésorerie, de votre risque et des actions à traiter." actions={<DimensionsLegend />} />

      <section aria-labelledby="synthese" className="vq-stack" style={{ gap: 10 }}>
        <div id="synthese" className="vq-eyebrow">1 · Synthèse financière</div>
        <div className="vq-grid cols-6">
          <KpiCard label="Encaissements attendus · 30 j" value={fcfa(k.expected30d.value)} unit="FCFA" hint={`${k.expected30d.count} factures · ${k.expected30d.trend}`} />
          <KpiCard label="Encaissements réalisés · ce mois" value={fcfa(k.collectedMonth.value)} unit="FCFA" hint={`${k.collectedMonth.count} paiements · ${k.collectedMonth.trend}`} />
          <KpiCard label="Créances ouvertes" value={fcfa(k.openReceivables.value)} unit="FCFA" hint={`${k.openReceivables.count} factures · à date`} />
          <KpiCard label="Montant à risque · Élevé + Critique" value={fcfa(k.atRisk.value)} unit="FCFA" hint={`${k.atRisk.count} factures · ${k.atRisk.trend}`} tone="amber" />
          <KpiCard label="En retard" value={String(k.late.count)} unit="factures" hint={`${fcfa(k.late.value)} FCFA · à date`} tone="red" />
          <KpiCard label="Trésorerie prévisionnelle · 30 j" value={fcfa(k.forecast30d.value)} unit="FCFA" hint="Scénario base · estimation" />
        </div>
      </section>

      <div className="vq-row">
        <section className="vq-card grow" aria-label="Trésorerie">
          <SectionHead
            eyebrow="4 · Trésorerie"
            title="Historique et prévision"
            right={
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                <Segmented label="Scénario" value={sc} onChange={setSc} options={(Object.keys(SCENARIO_LABEL) as ScenarioKey[]).map((s) => ({ key: s, label: SCENARIO_LABEL[s] }))} />
                <Segmented label="Horizon" value={hz} onChange={setHz} options={HORIZONS.map((h) => ({ key: h, label: `${h} j` }))} />
              </div>
            }
          />
          <ForecastChart start={data.scenarios.start} slopes={data.scenarios.slopes} scenario={sc} horizon={hz} />
        </section>
        <RiskBreakdown />
      </div>

      <section className="vq-card" aria-label="À traiter maintenant">
        <SectionHead
          eyebrow="3 · À traiter maintenant"
          title={<>Actions classées par priorité calculée · <Link className="vq-link" to="/app/recouvrement">Ouvrir le recouvrement →</Link></>}
          right={<span className="vq-sub">Tri : rang (rank_score) → priorité → échéance · jamais par montant</span>}
        />
        <div className="vq-table-wrap">
          <table className="vq-table">
            <thead>
              <tr><th>Rang</th><th>Client · facture</th><th className="num">Montant</th><th>Priorité</th><th>Risque</th><th>Niveau</th><th>Échéance</th><th>Décision · action</th><th /></tr>
            </thead>
            <tbody>
              {queue.map((inv) => (
                <tr key={inv.id} className={drawer.selected === inv.id ? 'selected' : ''}>
                  <td><RankTag rank={inv.rank} /></td>
                  <td><div className="strong">{clients.find((c) => c.id === inv.clientId)?.name}</div><div className="small">{inv.id}</div></td>
                  <td className="num">{fcfa(inv.amount)}</td>
                  <td><PriorityPill value={inv.priority} /></td>
                  <td><RiskBadge value={inv.risk} /></td>
                  <td><LevelChip value={inv.level} /></td>
                  <td>{inv.dueDate.split('-').reverse().join('/')}<div className="small">{inv.delayLabel}</div></td>
                  <td><InvoiceOutcome invoice={inv} /><div className="small">{inv.action}</div></td>
                  <td><button type="button" className="vq-btn sm" onClick={() => drawer.open(inv.id)}>Pourquoi ?</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="vq-row">
        <section className="vq-card grow" aria-label="Clients nécessitant votre attention">
          <SectionHead eyebrow="Clients nécessitant votre attention" sub="Classés par priorité calculée ; l’encours est une information secondaire." />
          {clients.slice(0, 4).map((c) => (
            <div key={c.id} className="vq-client-line">
              <RankTag rank={c.rank} />
              <div className="grow"><div className="strong">{c.name}</div><div className="vq-sub">{c.openInvoices} facture(s) ouverte(s)</div></div>
              <PriorityPill value={c.priority} /><RiskBadge value={c.risk} /><LevelChip value={c.level} />
              <div className="amount">{fcfa(c.outstanding ?? 0)}</div>
            </div>
          ))}
        </section>
        <section className="vq-card" style={{ width: 420, flexShrink: 0 }} aria-label="Événements">
          <SectionHead eyebrow="5 · Événements" sub={<>Alimentés par les événements métier · <Link className="vq-link" to="/app/evenements">Tout voir →</Link></>} />
          <EventList events={data.events.filter((_, i) => [0, 1, 4, 6, 7, 10, 11].includes(i))} />
        </section>
      </div>

      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
    </>
  );
}
