import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader, Tabs, Toggle, useToast } from '@/components/ui';
import { useData } from '@/services/DataProvider';
import { loadSettings, saveSettings } from '@/services/settings';

type TabKey = 'entreprise' | 'relances' | 'canaux' | 'abonnement';

const RULES = [
  { k: 'j3', label: 'Rappel 3 jours avant l’échéance', desc: 'Un message courtois avant la date' },
  { k: 'j0', label: 'Relance le jour de l’échéance', desc: 'Si la facture n’est pas encore payée' },
  { k: 'j7', label: 'Relance 7 jours après', desc: 'Proposée dans « À traiter maintenant »' },
  { k: 'j15', label: 'Relance 15 jours après', desc: 'Avec proposition d’appel' },
  { k: 'promesse', label: 'Alerte promesse non tenue', desc: 'Quand une date promise est dépassée' },
];
const CHANNELS = [
  { k: 'wa', label: 'WhatsApp', desc: 'Relances envoyées depuis votre numéro professionnel' },
  { k: 'sms', label: 'SMS', desc: 'Pour les clients sans WhatsApp' },
  { k: 'mail', label: 'E-mail', desc: 'Avec la facture en pièce jointe' },
];
const SECTORS = ['Distribution / grossiste', 'Services B2B', 'BTP / fournisseur', 'Maintenance / location', 'Agence / cabinet', 'Autre'];

function ToggleList({ items, state, onChange }: { items: { k: string; label: string; desc: string }[]; state: Record<string, boolean>; onChange: (s: Record<string, boolean>) => void }) {
  return (
    <>
      {items.map((r) => (
        <div key={r.k} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 0', borderTop: '1px solid var(--line)' }}>
          <div style={{ flex: 1 }}><div style={{ fontWeight: 600, color: 'var(--heading)' }}>{r.label}</div><div className="vq-sub">{r.desc}</div></div>
          <Toggle label={r.label} on={!!state[r.k]} onChange={(v) => onChange({ ...state, [r.k]: v })} />
        </div>
      ))}
    </>
  );
}

/** Paramètres : entreprise, calendrier de relance, canaux, abonnement. */
export default function Parametres() {
  const [tab, setTab] = useState<TabKey>('entreprise');
  const toast = useToast();
  const { resetDemo, source } = useData();
  const [company, setCompany] = useState(() => loadSettings('entreprise', { name: 'Mon entreprise', sector: SECTORS[0], address: '', currency: 'FCFA (XOF)', email: '', whatsapp: '' }));
  const [rules, setRules] = useState<Record<string, boolean>>(() => loadSettings('relances', { j3: true, j0: true, j7: true, j15: false, promesse: true }));
  const [channels, setChannels] = useState<Record<string, boolean>>(() => loadSettings('canaux', { wa: true, sms: false, mail: true }));
  const [template, setTemplate] = useState(() => loadSettings('modele', { text: "Bonjour {client}, nous vous rappelons que la facture {numero} d'un montant de {montant} FCFA arrive à échéance le {date}. Merci de votre confiance." }).text);
  const [confirmReset, setConfirmReset] = useState(false);

  const save = (key: string, value: object, label: string) => toast(saveSettings(key, value) ? label : 'Enregistrement impossible dans ce navigateur', 'ok');
  const saveCompany = () => {
    if (company.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(company.email)) return toast('Adresse e-mail invalide', 'warn');
    save('entreprise', company, 'Informations de l’entreprise enregistrées');
  };
  const preview = template.replace('{client}', 'Distribution Exemple A').replace('{numero}', 'F-0142').replace('{montant}', '1 250 000').replace('{date}', '16/09/2026');

  return (
    <>
      <PageHeader title="Paramètres" sub="Configurez votre entreprise, vos relances et vos canaux." />
      <Tabs label="Sections des paramètres" value={tab} onChange={setTab} tabs={[
        { key: 'entreprise', label: 'Entreprise' }, { key: 'relances', label: 'Relances' }, { key: 'canaux', label: 'Canaux' }, { key: 'abonnement', label: 'Abonnement' },
      ]} />
      {tab === 'entreprise' && (
        <>
        <form className="vq-card" style={{ maxWidth: 760 }} onSubmit={(e) => { e.preventDefault(); saveCompany(); }}>
          <div className="vq-grid cols-2">
            <div className="vq-field"><label htmlFor="rs">Raison sociale</label><input id="rs" className="vq-input" value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></div>
            <div className="vq-field"><label htmlFor="sec">Secteur</label><select id="sec" className="vq-input" value={company.sector} onChange={(e) => setCompany({ ...company, sector: e.target.value })}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div className="vq-field"><label htmlFor="adr">Adresse</label><input id="adr" className="vq-input" placeholder="[à compléter]" value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></div>
            <div className="vq-field"><label htmlFor="dev">Devise</label><select id="dev" className="vq-input" value={company.currency} onChange={(e) => setCompany({ ...company, currency: e.target.value })}><option>FCFA (XOF)</option></select></div>
            <div className="vq-field"><label htmlFor="mail">E-mail de contact</label><input id="mail" type="email" className="vq-input" placeholder="[à compléter]" value={company.email} onChange={(e) => setCompany({ ...company, email: e.target.value })} /></div>
            <div className="vq-field"><label htmlFor="wa">Numéro WhatsApp</label><input id="wa" type="tel" className="vq-input" placeholder="+225 …" value={company.whatsapp} onChange={(e) => setCompany({ ...company, whatsapp: e.target.value })} /></div>
          </div>
          <div><button type="submit" className="vq-btn primary">Enregistrer</button></div>
        </form>
        <section className="vq-card" style={{ maxWidth: 760 }}>
          <div className="vq-h2">Données de démonstration</div>
          <p className="vq-sub">Source actuelle : {source === 'api' ? 'API Python' : 'ce navigateur'}. La réinitialisation efface les clients, factures, paiements, notes et mises en attente ajoutés.</p>
          {!confirmReset ? (
            <div><button type="button" className="vq-btn" onClick={() => setConfirmReset(true)}>Réinitialiser les données de démonstration</button></div>
          ) : (
            <div className="vq-callout amber filled" style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <span>Confirmer la réinitialisation ?</span>
              <button type="button" className="vq-btn sm" onClick={() => setConfirmReset(false)}>Annuler</button>
              <button type="button" className="vq-btn sm primary" onClick={async () => { await resetDemo(); setConfirmReset(false); toast('Données de démonstration réinitialisées'); }}>Réinitialiser</button>
            </div>
          )}
        </section>
        </>
      )}
      {tab === 'relances' && (
        <div className="vq-row">
          <section className="vq-card" style={{ width: 560, flexShrink: 0, gap: 0 }}>
            <div className="vq-h2" style={{ marginBottom: 10 }}>Calendrier de relance</div>
            <ToggleList items={RULES} state={rules} onChange={setRules} />
            <div style={{ paddingTop: 14 }}><button type="button" className="vq-btn primary" onClick={() => save('relances', rules, 'Calendrier de relance enregistré')}>Enregistrer le calendrier</button></div>
          </section>
          <section className="vq-card grow">
            <label htmlFor="tpl" className="vq-h2">Modèle de message</label>
            <textarea id="tpl" rows={6} className="vq-input" value={template} onChange={(e) => setTemplate(e.target.value)} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 13 }}><span className="vq-muted">Variables (cliquer pour insérer) :</span>{['{client}', '{numero}', '{montant}', '{date}'].map((v) => <button type="button" key={v} className="vq-chip ok" style={{ background: 'none', cursor: 'pointer' }} onClick={() => setTemplate((t) => `${t} ${v}`)}>{v}</button>)}</div>
            <div className="vq-callout dashed"><strong>Aperçu :</strong> {preview}</div>
            <div><button type="button" className="vq-btn primary" onClick={() => save('modele', { text: template }, 'Modèle de message enregistré')}>Enregistrer le modèle</button></div>
            <p className="vq-sub" style={{ lineHeight: 1.5 }}>Chaque relance reste soumise à la décision du Rule Engine (À exécuter, Différée, Supprimée) et est enregistrée dans l’historique du client.</p>
          </section>
        </div>
      )}
      {tab === 'canaux' && (
        <section className="vq-card" style={{ maxWidth: 720, gap: 0 }}>
          <ToggleList items={CHANNELS} state={channels} onChange={setChannels} />
          <div style={{ padding: '4px 0 14px' }}><button type="button" className="vq-btn primary" onClick={() => save('canaux', channels, 'Canaux enregistrés')}>Enregistrer les canaux</button></div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderTop: '1px solid var(--line)' }}>
            <div><div style={{ fontWeight: 600, color: 'var(--heading)' }}>Moyens de paiement</div><div className="vq-sub">Connexion progressive aux moyens de paiement disponibles</div></div>
            <span className="vq-chip">À venir</span>
          </div>
          <p className="vq-sub" style={{ paddingTop: 10 }}>Communications autorisées uniquement, utilisées de manière structurée et conforme.</p>
        </section>
      )}
      {tab === 'abonnement' && (
        <section className="vq-card" style={{ maxWidth: 720 }}>
          <div className="vq-label">Offre actuelle</div>
          <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)' }}>Pilote</div>
          <div className="vq-muted">10 000 – 15 000 FCFA / mois · tarif indicatif</div>
          <div><Link className="vq-btn" to="/tarifs">Voir les offres</Link></div>
          <div className="vq-callout amber">Les tarifs sont temporaires et en cours de validation : ils peuvent changer à tout moment. Vous serez prévenu avant tout changement.</div>
        </section>
      )}
    </>
  );
}
