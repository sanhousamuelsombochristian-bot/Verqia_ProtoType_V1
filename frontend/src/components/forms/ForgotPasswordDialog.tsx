import { useState } from 'react';
import { Modal } from '@/components/ui';

/** « Mot de passe oublié ? » — prototype : aucun e-mail n'est réellement envoyé. */
export function ForgotPasswordDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const close = () => { setEmail(''); setSent(false); setError(null); onClose(); };
  const send = () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return setError('Saisissez une adresse e-mail valide.');
    setError(null);
    setSent(true);
  };
  return (
    <Modal open={open} onClose={close} title="Mot de passe oublié" error={error} onSubmit={sent ? close : send} submitLabel={sent ? 'Fermer' : 'Envoyer le lien'}>
      {sent ? (
        <div className="vq-callout lime">Si un compte existe pour <strong>{email}</strong>, un lien de réinitialisation sera envoyé. (Prototype : aucun e-mail n’est envoyé.)</div>
      ) : (
        <div className="vq-field"><label htmlFor="fp-mail">E-mail professionnel</label><input id="fp-mail" type="email" className="vq-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@entreprise.ci" /></div>
      )}
    </Modal>
  );
}
