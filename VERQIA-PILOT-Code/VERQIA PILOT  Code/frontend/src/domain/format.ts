/** Formatage FCFA et dates (fr-CI). */
const nf = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 });

/** 1250000 → « 1 250 000 » (espace fine insécable remplacée par une espace simple). */
export const fcfa = (n: number): string => nf.format(n).replace(/ | /g, ' ');

/** 9.85 → « 9,85 M » */
export const millions = (v: number, digits = 1): string => v.toFixed(digits).replace('.', ',') + ' M';

/** « 2026-09-16 » → « 16/09/2026 » */
export const dateFr = (iso: string | null | undefined): string => {
  if (!iso) return '[à compléter]';
  const [y, m, d] = iso.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};

/** « 2026-09-28T09:12 » → « 28/09 · 09:12 » */
export const dateTimeShort = (iso: string): string => {
  const [date, time = '00:00'] = iso.split('T');
  const [, m, d] = date.split('-');
  return `${d}/${m} · ${time.slice(0, 5)}`;
};

/** Nombre de jours entre deux dates ISO (b - a). */
export const daysBetween = (a: string, b: string): number =>
  Math.round((Date.parse(b) - Date.parse(a)) / 86_400_000);
