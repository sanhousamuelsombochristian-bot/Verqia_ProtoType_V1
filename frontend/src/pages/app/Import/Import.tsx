import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { PageHeader, PriorityPill, RankTag, SectionHead } from '@/components/ui';
import './Import.css';

const STEP_NAMES = ['Source', 'Correspondance', 'Vérification', 'Résultat'];
const SOURCES = [
  { k: 'fichier', title: 'Fichier Excel ou CSV', desc: 'Importez l’export de votre logiciel ou votre tableau de suivi.' },
  { k: 'manuel', title: 'Saisie manuelle', desc: 'Ajoutez vos factures une par une.' },
  { k: 'logiciel', title: 'Logiciel de facturation', desc: 'Connexion directe : intégration à venir.', off: true },
];
const MAPPING: [string, string, string, 'ok' | 'warn' | 'ign'][] = [
  ['N° Fact', 'Numéro de facture', 'F-0142', 'ok'], ['Client', 'Client', 'Distribution Exemple A', 'ok'], ['Montant TTC', 'Montant (FCFA)', '1 250 000', 'ok'],
  ['Date limite', 'Échéance', '16/09/2026', 'ok'], ['Réglé le', 'Date de paiement', '26/09/2026', 'ok'], ['Contact', 'E-mail du client', '[adresse masquée]', 'warn'], ['Remarque', 'Ignorer', '—', 'ign'],
];
const STATUS = { ok: ['ok', 'Reconnu'], warn: ['warn', 'À vérifier'], ign: ['', 'Ignorée'] } as const;

/** Import des factures en 4 étapes — jusqu'au « moment magique ». */
export default function Import() {
  const [step, setStep] = useState(1);
  const [src, setSrc] = useState('fichier');
  const [fileName, setFileName] = useState('factures_septembre.xlsx');
  const { queue } = useInvoices();
  const clients = useClients();

  return (
    <>
      <PageHeader title="Importer vos factures" sub="Quatre étapes pour passer de vos fichiers à la liste de ce qu’il faut traiter maintenant." />
      <section className="vq-card" style={{ gap: 22 }}>
        <ol className="vq-stepper">
          {STEP_NAMES.map((n, i) => (
            <li key={n} className={i + 1 === step ? 'now' : i + 1 < step ? 'done' : ''} aria-current={i + 1 === step ? 'step' : undefined}>
              <span className="n">{i + 1 < step ? '✓' : i + 1}</span>{n}
            </li>
          ))}
        </ol>

        {step === 1 && (
          <>
            <SectionHead eyebrow="Étape 1" title="D’où viennent vos factures ?" />
            <div className="vq-grid cols-3">
              {SOURCES.map((o) => (
                <button key={o.k} type="button" className={`vq-source ${src === o.k ? 'on' : ''}`} disabled={o.off} aria-pressed={src === o.k} onClick={() => setSrc(o.k)}>
                  <strong>{o.title}</strong><span>{o.desc}</span>
                </button>
              ))}
            </div>
            <label className="vq-drop">
              <input type="file" accept=".xlsx,.xls,.csv" className="sr-only" onChange={(e) => e.target.files?.[0] && setFileName(e.target.files[0].name)} />
              <div><strong>{fileName}</strong><div className="vq-sub">Fichier de démonstration · 10 lignes · 7 colonnes — cliquez pour choisir un autre fichier</div></div>
              <span className="vq-chip ok">Fichier déposé</span>
            </label>
            <p className="vq-sub">Formats acceptés : .xlsx, .xls, .csv. Vos outils actuels restent en place : VERQIA PILOT lit, il ne remplace pas.</p>
          </>
        )}

        {step === 2 && (
          <>
            <SectionHead eyebrow="Étape 2" title="Correspondance des colonnes" sub="VERQIA propose une correspondance ; vous pouvez la modifier." />
            <table className="vq-table">
              <thead><tr><th>Colonne du fichier</th><th>Champ VERQIA</th><th>Exemple lu</th><th>Statut</th></tr></thead>
              <tbody>
                {MAPPING.map(([col, field, ex, st]) => (
                  <tr key={col}>
                    <td className="vq-mono">{col}</td>
                    <td><select className="vq-input" style={{ height: 36, width: 220 }} defaultValue={field} aria-label={`Champ pour ${col}`}>{MAPPING.map((m) => <option key={m[1]}>{m[1]}</option>)}</select></td>
                    <td className="vq-muted">{ex}</td>
                    <td><span className={`vq-chip ${STATUS[st][0]}`}>{STATUS[st][1]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {step === 3 && (
          <>
            <SectionHead eyebrow="Étape 3" title="Vérification avant import" />
            <div className="vq-grid cols-4">
              {[['Factures lues', '10', '10 lignes, 0 doublon'], ['Ouvertes', '7 640 000', 'FCFA · 7 factures'], ['Payées', '2 740 000', 'FCFA · 3 factures'], ['Clients', '6', 'créés ou reconnus']].map(([l, v, s]) => (
                <div key={l} className="vq-kpi"><div className="label">{l}</div><div className="value">{v}</div><div className="hint">{s}</div></div>
              ))}
            </div>
            <div className="vq-callout amber filled" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16 }}>
              <div><div className="title-amber">1 point à vérifier</div>Agence Exemple F — adresse e-mail manquante. L’import reste possible ; complétez la fiche client plus tard.</div>
              <button type="button" className="vq-btn sm">Compléter</button>
            </div>
            <p className="vq-sub">Aucune donnée n’est envoyée à vos clients pendant l’import. Les relances ne partent qu’après décision du Rule Engine.</p>
          </>
        )}

        {step === 4 && (
          <div className="vq-row">
            <div className="vq-callout lime grow" style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div className="vq-eyebrow">Moment magique</div>
              <div style={{ fontSize: 26, fontWeight: 800, lineHeight: 1.2 }}>Votre liste de factures est devenue une liste d’actions.</div>
              <div>Le Rule Engine a évalué chaque facture : risque, priorité et niveau de recouvrement, séparément.</div>
              <div className="vq-grid cols-3">
                {[['À traiter maintenant', '6 actions'], ['En retard', '2 480 000'], ['Approbation requise', '1 action']].map(([l, v]) => (
                  <div key={l} className="vq-tile"><span className="vq-sub">{l}</span><strong style={{ fontSize: 24 }}>{v}</strong></div>
                ))}
              </div>
            </div>
            <div className="vq-card" style={{ width: 420, flexShrink: 0 }}>
              <div className="vq-eyebrow">Les 3 premières</div>
              {queue.slice(0, 3).map((i) => (
                <div key={i.id} className="vq-event" style={{ alignItems: 'center' }}>
                  <RankTag rank={i.rank} />
                  <div style={{ flex: 1 }}><div className="title">{clients.byId(i.clientId)?.name}</div><div className="detail">{i.id} · {i.delayLabel}</div></div>
                  <PriorityPill value={i.priority} />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="vq-wizard-nav">
          {step === 1 ? <Link to="/app/factures" className="vq-muted" style={{ textDecoration: 'none' }}>Annuler</Link> : step < 4 ? <button type="button" className="vq-btn" onClick={() => setStep(step - 1)}>← Retour</button> : <span />}
          {step < 4 ? (
            <button type="button" className="vq-btn primary" onClick={() => setStep(step + 1)}>{step === 3 ? 'Importer 10 factures' : 'Continuer'}</button>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}><Link className="vq-btn" to="/app/recouvrement">Ouvrir le recouvrement</Link><Link className="vq-btn primary" to="/app">Voir la vue d’ensemble →</Link></div>
          )}
        </div>
      </section>
    </>
  );
}
