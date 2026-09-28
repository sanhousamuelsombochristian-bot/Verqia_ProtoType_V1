import { useState } from 'react';
import { Modal } from '@/components/ui';
import { useData } from '@/services/DataProvider';
import { useSubmit } from './useSubmit';

export const SECTORS = ['Distribution / grossiste', 'Services B2B', 'BTP / fournisseur', 'Maintenance / location', 'Agence / cabinet', 'Autre'];

/** « + Nouveau client » : crée une fiche client. Le Rule Engine l'évaluera ensuite. */
export function NewClientDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (name: string) => void }) {
  const { createClient } = useData();
  const [f, setF] = useState({ name: '', email: '', phone: '', sector: SECTORS[0] });
  const close = () => { setF({ name: '', email: '', phone: '', sector: SECTORS[0] }); onClose(); };
  const { busy, error, submit } = useSubmit(() => { onCreated?.(f.name); close(); });

  return (
    <Modal open={open} onClose={close} title="Nouveau client" subtitle="Risque, priorité et niveau apparaîtront après l’évaluation du Rule Engine." busy={busy} error={error} submitLabel="Créer le client"
      onSubmit={() => submit(() => createClient(f), `Client « ${f.name.trim()} » créé`)}>
      <div className="vq-field"><label htmlFor="nc-name">Raison sociale *</label><input id="nc-name" className="vq-input" required value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Ex. Pharmacie Exemple G" /></div>
      <div className="vq-grid cols-2">
        <div className="vq-field"><label htmlFor="nc-mail">E-mail</label><input id="nc-mail" type="email" className="vq-input" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="contact@client.ci" /></div>
        <div className="vq-field"><label htmlFor="nc-tel">Téléphone / WhatsApp</label><input id="nc-tel" type="tel" className="vq-input" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="+225 …" /></div>
      </div>
      <div className="vq-field"><label htmlFor="nc-sec">Secteur</label><select id="nc-sec" className="vq-input" value={f.sector} onChange={(e) => setF({ ...f, sector: e.target.value })}>{SECTORS.map((s) => <option key={s}>{s}</option>)}</select></div>
    </Modal>
  );
}
