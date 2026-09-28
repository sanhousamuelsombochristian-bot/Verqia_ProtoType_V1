import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui';
import { useData } from '@/services/DataProvider';
import { dueInfo, nextInvoiceId } from '@/services/store';
import { DUE_LABEL } from '@/domain/lexique';
import { useSubmit } from './useSubmit';

/** « + Nouvelle facture » : saisie manuelle d'une facture. */
export function NewInvoiceDialog({ open, onClose, clientId, onCreated }: { open: boolean; onClose: () => void; clientId?: string; onCreated?: (id: string) => void }) {
  const { data, createInvoice } = useData();
  const blank = () => ({ id: nextInvoiceId(data), clientId: clientId ?? data.clients[0]?.id ?? '', amount: '', dueDate: '' });
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(blank()); }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const { busy, error, submit } = useSubmit(() => { onCreated?.(f.id); onClose(); });
  const amount = Number(String(f.amount).replace(/\s/g, ''));
  const preview = /^\d{4}-\d{2}-\d{2}$/.test(f.dueDate) ? dueInfo(f.dueDate, data.today) : null;

  return (
    <Modal open={open} onClose={onClose} title="Nouvelle facture" subtitle="La facture sera évaluée par le Rule Engine : aucune priorité n’est calculée ici." busy={busy} error={error} submitLabel="Créer la facture"
      onSubmit={() => submit(() => createInvoice({ id: f.id, clientId: f.clientId, amount, dueDate: f.dueDate }), `Facture ${f.id} créée`)}>
      <div className="vq-grid cols-2">
        <div className="vq-field"><label htmlFor="ni-id">Numéro</label><input id="ni-id" className="vq-input vq-mono" value={f.id} onChange={(e) => setF({ ...f, id: e.target.value })} /></div>
        <div className="vq-field"><label htmlFor="ni-cli">Client *</label>
          <select id="ni-cli" className="vq-input" value={f.clientId} onChange={(e) => setF({ ...f, clientId: e.target.value })}>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        </div>
        <div className="vq-field"><label htmlFor="ni-amt">Montant TTC (FCFA) *</label><input id="ni-amt" inputMode="numeric" className="vq-input" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} placeholder="Ex. 850000" /></div>
        <div className="vq-field"><label htmlFor="ni-due">Échéance *</label><input id="ni-due" type="date" className="vq-input" value={f.dueDate} onChange={(e) => setF({ ...f, dueDate: e.target.value })} /></div>
      </div>
      {preview && <div className="vq-hint">Statut d’échéance : <strong>{DUE_LABEL[preview.dueStatus]}</strong> · {preview.delayLabel}</div>}
    </Modal>
  );
}
