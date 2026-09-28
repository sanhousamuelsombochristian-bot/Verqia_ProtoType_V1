import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui';
import { useData } from '@/services/DataProvider';
import { remaining } from '@/services/store';
import { fcfa } from '@/domain/format';
import type { PaymentMethod } from '@/domain/types';
import { useSubmit } from './useSubmit';

const METHODS: PaymentMethod[] = ['Virement', 'Mobile money', 'Espèces', 'Chèque', '[à préciser]'];

/** « Enregistrer un paiement » : paiement total ou partiel, rapproché d'une facture. */
export function PaymentDialog({ open, onClose, invoiceId }: { open: boolean; onClose: () => void; invoiceId?: string }) {
  const { data, recordPayment } = useData();
  const openInv = data.invoices.filter((i) => i.dueStatus !== 'paid');
  const init = () => { const id = invoiceId ?? openInv[0]?.id ?? ''; const inv = data.invoices.find((i) => i.id === id); return { invoiceId: id, amount: inv ? String(remaining(inv)) : '', date: data.today, method: METHODS[0] }; };
  const [f, setF] = useState(init);
  useEffect(() => { if (open) setF(init()); }, [open, invoiceId]); // eslint-disable-line react-hooks/exhaustive-deps
  const inv = data.invoices.find((i) => i.id === f.invoiceId);
  const { busy, error, submit } = useSubmit(onClose);
  const amount = Number(String(f.amount).replace(/\s/g, ''));

  return (
    <Modal open={open} onClose={onClose} title="Enregistrer un paiement" subtitle="Le paiement est rapproché de la facture choisie." busy={busy} error={error} submitLabel="Enregistrer le paiement"
      onSubmit={() => submit(() => recordPayment({ invoiceId: f.invoiceId, amount, date: f.date, method: f.method }), `Paiement de ${fcfa(amount || 0)} FCFA enregistré`)}>
      <div className="vq-field"><label htmlFor="pay-inv">Facture *</label>
        <select id="pay-inv" className="vq-input" value={f.invoiceId} disabled={!!invoiceId} onChange={(e) => { const x = data.invoices.find((i) => i.id === e.target.value); setF({ ...f, invoiceId: e.target.value, amount: x ? String(remaining(x)) : '' }); }}>
          {openInv.map((i) => <option key={i.id} value={i.id}>{i.id} · {data.clients.find((c) => c.id === i.clientId)?.name} · reste {fcfa(remaining(i))}</option>)}
        </select>
      </div>
      <div className="vq-grid cols-2">
        <div className="vq-field"><label htmlFor="pay-amt">Montant reçu (FCFA) *</label><input id="pay-amt" inputMode="numeric" className="vq-input" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
        <div className="vq-field"><label htmlFor="pay-date">Date de réception *</label><input id="pay-date" type="date" className="vq-input" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></div>
      </div>
      <div className="vq-field"><label htmlFor="pay-m">Moyen de paiement</label><select id="pay-m" className="vq-input" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value as PaymentMethod })}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
      {inv && <div className="vq-hint">Reste dû : <strong>{fcfa(remaining(inv))} FCFA</strong>. Un montant inférieur est enregistré comme paiement partiel.</div>}
    </Modal>
  );
}
