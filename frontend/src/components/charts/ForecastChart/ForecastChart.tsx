import { millions } from '@/domain/format';

export type ScenarioKey = 'pess' | 'base' | 'opt';
export const SCENARIO_LABEL: Record<ScenarioKey, string> = { pess: 'Pessimiste', base: 'Base', opt: 'Optimiste' };

/** Valeur (en millions FCFA) d'un scénario à J+d. Courbe illustrative — méthode à définir. */
export const scenarioValue = (start: number, slope: number, d: number) => start + slope * d * (1 - d / 1200);

interface Props {
  start: number;
  slopes: Record<ScenarioKey, number>;
  scenario: ScenarioKey;
  horizon: number;
  width?: number;
  height?: number;
}

/** Historique sur 60 jours puis projection ; le scénario choisi est en lime, les autres en pointillés. */
export function ForecastChart({ start, slopes, scenario, horizon, width = 640, height = 220 }: Props) {
  const hist0 = 60;
  const total = hist0 + horizon;
  const x = (d: number) => ((d + hist0) / total) * width;
  const hist: [number, number][] = [];
  for (let d = -60; d <= 0; d += 5) hist.push([d, start - 1.4 + (d + 60) * 0.0235 + Math.sin(d / 6) * 0.18]);
  hist[hist.length - 1][1] = start;
  const fc = (k: ScenarioKey) => Array.from({ length: 13 }, (_, i) => { const d = (i * horizon) / 12; return [d, scenarioValue(start, slopes[k], d)] as [number, number]; });
  const all = { pess: fc('pess'), base: fc('base'), opt: fc('opt') };
  const vals = [...hist, ...all.pess, ...all.opt].map((p) => p[1]);
  const vmin = Math.min(...vals) * 0.94;
  const vmax = Math.max(...vals) * 1.04;
  const y = (v: number) => height - ((v - vmin) / (vmax - vmin)) * (height - 8) - 4;
  const path = (pts: [number, number][]) => pts.map((p, i) => `${i ? 'L' : 'M'}${x(p[0]).toFixed(1)} ${y(p[1]).toFixed(1)}`).join(' ');
  const histPath = path(hist);
  const others = (['pess', 'base', 'opt'] as ScenarioKey[]).filter((k) => k !== scenario);

  return (
    <figure style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ width: 64, height, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontSize: 11.5, color: 'var(--muted)', textAlign: 'right' }}>
          <div>{millions(vmax)}</div><div>{millions((vmax + vmin) / 2)}</div><div>{millions(vmin)}</div>
        </div>
        <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none" role="img" aria-label={`Trésorerie : historique puis prévision, scénario ${SCENARIO_LABEL[scenario]}, horizon ${horizon} jours`}>
          {[1, height / 2, height - 1].map((ly) => <line key={ly} x1={0} x2={width} y1={ly} y2={ly} stroke="var(--line)" />)}
          <path d={`${histPath} L${x(0).toFixed(1)} ${height} L0 ${height} Z`} fill="var(--a12)" opacity={0.5} />
          {others.map((k) => <path key={k} d={path(all[k])} fill="none" stroke="var(--muted)" strokeWidth={1.5} strokeDasharray="3 5" opacity={0.6} />)}
          <path d={histPath} fill="none" stroke="var(--text)" strokeWidth={2.5} />
          <path d={path(all[scenario])} fill="none" stroke="#97F201" strokeWidth={3} strokeDasharray="8 6" />
          <line x1={x(0)} x2={x(0)} y1={0} y2={height} stroke="var(--heading)" strokeWidth={1.5} strokeDasharray="2 4" />
          <circle cx={x(0)} cy={y(start)} r={5} fill="#97F201" stroke="var(--card)" strokeWidth={2} />
        </svg>
      </div>
      <figcaption style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 76, fontSize: 12, color: 'var(--muted)' }}>
        <span>−60 j</span><strong style={{ color: 'var(--heading)' }}>Aujourd’hui</strong><span>+{horizon} j</span>
      </figcaption>
    </figure>
  );
}
