export interface KpiCardProps {
  label: string;
  value: string;
  unit?: string;
  hint?: string;
  tone?: 'amber' | 'red';
}

export function KpiCard({ label, value, unit, hint, tone }: KpiCardProps) {
  return (
    <div className="vq-kpi">
      <div className={`label ${tone ?? ''}`}>{label}</div>
      <div className="value">
        {value} {unit && <span className="unit">{unit}</span>}
      </div>
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}
