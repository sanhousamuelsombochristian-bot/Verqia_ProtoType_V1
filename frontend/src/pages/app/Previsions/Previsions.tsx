import { useState } from 'react';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { dateFr, daysBetween, fcfa } from '@/domain/format';
import { ForecastChart, SCENARIO_LABEL, scenarioValue, type ScenarioKey } from '@/components/charts/ForecastChart/ForecastChart';
import { PageHeader, SectionHead, Segmented } from '@/components/ui';

const HORIZONS = [7, 30, 60, 90, 180, 365];
const KEYS: ScenarioKey[] = ['pess', 'base', 'opt'];
const f2 = (v: number) => v.toFixed(2).replace('.', ',') + ' M';

/** Prévisions : trois scénarios, six horizons, factures prises en compte. */
export default function Previsions() {
  const { data } = useData();
  const { open } = useInvoices();
  const { byId } = useClients();
  const [sc, setSc] = useState<ScenarioKey>('base');
  const [hz, setHz] = useState(90);
  const { start, slopes } = data.scenarios;
  const inHorizon = open.filter((i) => i.dueStatus !== 'late' && daysBetween(data.today, i.dueDate) <= hz);

  return (
    <>
      <PageHeader title="Prévisions" sub="Projetez votre trésorerie selon trois scénarios, de 7 jours à 1 an." />
      <section className="vq-card" style={{ gap: 14 }}>
        <SectionHead
          eyebrow="Scénarios"
          title="Trésorerie prévisionnelle"
          sub="Historique sur 60 jours, puis projection selon le scénario et l’horizon choisis."
          right={<div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
            <Segmented label="Scénario" value={sc} onChange={setSc} options={KEYS.map((k) => ({ key: k, label: SCENARIO_LABEL[k] }))} />
            <Segmented label="Horizon" value={hz} onChange={setHz} options={HORIZONS.map((h) => ({ key: h, label: `${h} j` }))} />
          </div>}
        />
        <ForecastChart start={start} slopes={slopes} scenario={sc} horizon={hz} width={980} height={300} />
      </section>
      <div className="vq-row">
        <section className="vq-card grow">
          <SectionHead eyebrow="Projection" title="Valeurs par horizon" sub="Solde prévisionnel estimé, en millions de FCFA." />
          <table className="vq-table">
            <thead><tr><th>Horizon</th>{KEYS.map((k) => <th key={k} className="num">{SCENARIO_LABEL[k]}</th>)}</tr></thead>
            <tbody>
              {HORIZONS.map((h) => (
                <tr key={h} className={h === hz ? 'selected' : ''}>
                  <td className="strong">{h} j</td>
                  {KEYS.map((k) => <td key={k} className="num" style={{ color: k === sc ? 'var(--accent)' : undefined }}>{f2(scenarioValue(start, slopes[k], h))}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="vq-card" style={{ width: 440, flexShrink: 0 }}>
          <SectionHead eyebrow="Entrées prises en compte" title={`Factures dans l’horizon · ${hz} j · ${inHorizon.length}`} sub="Les factures en retard sont comptées à part : leur date est incertaine." />
          {inHorizon.map((i) => (
            <div key={i.id} className="vq-event" style={{ alignItems: 'center' }}>
              <span className="vq-sub" style={{ width: 90 }}>{dateFr(i.dueDate)}</span>
              <div style={{ flex: 1 }}><div className="title">{byId(i.clientId)?.name} · {i.id}</div><div className="detail">{i.delayLabel}</div></div>
              <strong>+ {fcfa(i.amount)}</strong>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--line)', paddingTop: 10 }}><strong style={{ color: 'var(--red-text)' }}>En retard · hors calendrier</strong><strong>{fcfa(data.kpis.late.value)}</strong></div>
          <div className="vq-callout dashed"><strong>Hypothèses de scénario :</strong> [méthode de calcul à définir] — les courbes affichées sont illustratives.</div>
        </section>
      </div>
    </>
  );
}
