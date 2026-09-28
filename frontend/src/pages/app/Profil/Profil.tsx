import { useState } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { PageHeader, Segmented, Toggle, useToast } from '@/components/ui';
import { PasswordDialog } from '@/components/forms';
import { loadSettings, saveSettings } from '@/services/settings';

const FIELDS: [string, string, string][] = [
  ['prenom', 'Prénom', '[Prénom]'], ['nom', 'Nom', '[Nom]'], ['mail', 'E-mail professionnel', '[à compléter]'],
  ['tel', 'Téléphone', '[à compléter]'], ['org', 'Organisation', 'Mon entreprise'], ['role', 'Rôle', '[rôle à définir]'],
];
const NOTIFS = [
  { k: 'appro', label: 'Approbation requise', desc: 'Quand une action attend votre décision' },
  { k: 'promesse', label: 'Promesse rompue', desc: 'Quand une date promise est dépassée' },
  { k: 'paiement', label: 'Paiement reçu', desc: 'À chaque encaissement rapproché' },
  { k: 'hold', label: 'Fin de mise en attente', desc: 'À la date de réessai prévue' },
];

/** Profil : identité, sécurité, préférences et notifications. */
export default function Profil() {
  const { mode, toggle } = useTheme();
  const toast = useToast();
  const [profile, setProfile] = useState<Record<string, string>>(() => loadSettings('profil', Object.fromEntries(FIELDS.map(([id, , v]) => [id, v]))));
  const [mfa, setMfa] = useState(() => loadSettings('securite', { mfa: false }).mfa);
  const [notifs, setNotifs] = useState<Record<string, boolean>>(() => loadSettings('notifications', { appro: true, promesse: true, paiement: true, hold: false }));
  const [pwd, setPwd] = useState(false);
  const saveProfile = () => {
    if (profile.mail && profile.mail !== '[à compléter]' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(profile.mail)) return toast('Adresse e-mail invalide', 'warn');
    saveSettings('profil', profile);
    toast('Profil enregistré');
  };

  return (
    <>
      <PageHeader title="Profil" sub="Votre compte, votre sécurité et vos préférences." />
      <div className="vq-row">
        <form className="vq-card grow" onSubmit={(e) => { e.preventDefault(); saveProfile(); }}>
          <div className="vq-eyebrow">Identité</div>
          <div className="vq-grid cols-2">
            {FIELDS.map(([id, l]) => <div key={id} className="vq-field"><label htmlFor={id}>{l}</label><input id={id} className="vq-input" value={profile[id] ?? ''} onChange={(e) => setProfile({ ...profile, [id]: e.target.value })} /></div>)}
          </div>
          <p className="vq-sub">Votre rôle détermine les actions que vous pouvez approuver ou overrider. Il est revérifié au moment de chaque exécution.</p>
          <div><button type="submit" className="vq-btn primary">Enregistrer</button></div>
        </form>
        <div style={{ width: 440, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <section className="vq-card">
            <div className="vq-eyebrow">Sécurité</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><strong>Mot de passe</strong><div className="vq-sub">••••••••••</div></div><button type="button" className="vq-btn sm" onClick={() => setPwd(true)}>Modifier</button></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}><div><strong>Double authentification</strong><div className="vq-sub">Un code à usage unique à chaque connexion</div></div><Toggle label="Double authentification" on={mfa} onChange={(v) => { setMfa(v); saveSettings('securite', { mfa: v }); toast(v ? 'Double authentification activée' : 'Double authentification désactivée'); }} /></div>
          </section>
          <section className="vq-card">
            <div className="vq-eyebrow">Préférences</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><strong>Apparence</strong>
              <Segmented label="Apparence" value={mode} onChange={(m) => m !== mode && toggle()} options={[{ key: 'sombre', label: 'Sombre' }, { key: 'clair', label: 'Clair' }]} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><strong>Langue · devise</strong><span className="vq-muted">Français · FCFA</span></div>
            {NOTIFS.map((n) => (
              <div key={n.k} style={{ display: 'flex', alignItems: 'center', gap: 12, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
                <div style={{ flex: 1 }}><strong>{n.label}</strong><div className="vq-sub">{n.desc}</div></div>
                <Toggle label={n.label} on={notifs[n.k]} onChange={(v) => { const next = { ...notifs, [n.k]: v }; setNotifs(next); saveSettings('notifications', next); }} />
              </div>
            ))}
          </section>
        </div>
      </div>
      <PasswordDialog open={pwd} onClose={() => setPwd(false)} />
    </>
  );
}
