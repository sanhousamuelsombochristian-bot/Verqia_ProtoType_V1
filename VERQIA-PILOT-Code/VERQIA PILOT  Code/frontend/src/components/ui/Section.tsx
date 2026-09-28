import type { ReactNode } from 'react';

/** En-tête de carte : sur-titre (eyebrow), titre, sous-titre. */
export function SectionHead({ eyebrow, title, sub, right }: { eyebrow: string; title?: ReactNode; sub?: ReactNode; right?: ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="vq-eyebrow">{eyebrow}</div>
        {title && <div className="vq-h2">{title}</div>}
        {sub && <div className="vq-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/** En-tête de page de l'espace client. */
export function PageHeader({ title, sub, actions }: { title: ReactNode; sub: ReactNode; actions?: ReactNode }) {
  return (
    <header className="vq-page-head">
      <div>
        <h1 className="vq-h1">{title}</h1>
        <p>{sub}</p>
      </div>
      {actions && <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>{actions}</div>}
    </header>
  );
}

/** Légende des 3 dimensions indépendantes. */
export function DimensionsLegend() {
  return (
    <div className="vq-legend" style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontSize: 13, color: 'var(--muted2)', background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 14px' }}>
      <strong style={{ color: 'var(--heading)' }}>3 dimensions indépendantes</strong>
      <span className="vq-risk eleve" style={{ color: 'var(--muted2)' }}>Risque</span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 18, height: 10, borderRadius: 999, background: '#97F201' }} />
        Priorité
      </span>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <span className="vq-level" style={{ fontSize: 11, padding: '0 4px' }}>L</span>
        Niveau de recouvrement
      </span>
    </div>
  );
}
