import { useState } from 'react';
import { Modal, useToast } from '@/components/ui';

/** « Modifier » le mot de passe (prototype : vérifications côté interface uniquement). */
export function PasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ old: '', next: '', confirm: '' });
  const [error, setError] = useState<string | null>(null);
  const close = () => { setF({ old: '', next: '', confirm: '' }); setError(null); onClose(); };
  const save = () => {
    if (!f.old) return setError('Saisissez votre mot de passe actuel.');
    if (f.next.length < 8) return setError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
    if (!/\d/.test(f.next) || !/[A-Za-z]/.test(f.next)) return setError('Utilisez au moins une lettre et un chiffre.');
    if (f.next !== f.confirm) return setError('Les deux mots de passe ne correspondent pas.');
    toast('Mot de passe modifié (prototype)');
    close();
  };
  return (
    <Modal open={open} onClose={close} title="Modifier le mot de passe" error={error} onSubmit={save} submitLabel="Modifier">
      <div className="vq-field"><label htmlFor="pw-old">Mot de passe actuel</label><input id="pw-old" type="password" autoComplete="current-password" className="vq-input" value={f.old} onChange={(e) => setF({ ...f, old: e.target.value })} /></div>
      <div className="vq-field"><label htmlFor="pw-new">Nouveau mot de passe</label><input id="pw-new" type="password" autoComplete="new-password" className="vq-input" value={f.next} onChange={(e) => setF({ ...f, next: e.target.value })} /></div>
      <div className="vq-field"><label htmlFor="pw-conf">Confirmer</label><input id="pw-conf" type="password" autoComplete="new-password" className="vq-input" value={f.confirm} onChange={(e) => setF({ ...f, confirm: e.target.value })} /></div>
      <div className="vq-hint">8 caractères minimum, avec au moins une lettre et un chiffre.</div>
    </Modal>
  );
}
