import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui';
import { useData } from '@/services/DataProvider';
import { HOLD_SCOPE_LABEL, HOLD_TYPE_LABEL } from '@/domain/lexique';
import type { Hold } from '@/domain/types';
import { useSubmit } from './useSubmit';

const plusDays = (iso: string, n: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };

/** « Placer une mise en attente » (hold) : facture, client ou organisation. */
export function HoldDialog({ open, onClose, invoiceId }: { open: boolean; onClose: () => void; invoiceId?: string }) {
  const { data, placeHold } = useData();
  const openInv = data.invoices.filter((i) => i.dueStatus !== 'paid');
  const init = () => ({ scope: 'INVOICE' as Hold['scope'], type: 'NEGOTIATION' as Hold['type'], invoice: invoiceId ?? openInv[0]?.id ?? '', client: data.invoices.find((i) => i.id === invoiceId)?.clientId ?? data.clients[0]?.id ?? '', retryAt: plusDays(data.today, 7), cause: '' });
  const [f, setF] = useState(init);
  useEffect(() => { if (open) setF(init()); }, [open, invoiceId]); // eslint-disable-line react-hooks/exhaustive-deps
  const { busy, error, submit } = useSubmit(onClose);
  const targetId = f.scope === 'INVOICE' ? f.invoice : f.scope === 'CUSTOMER' ? f.client : undefined;

  return (
    <Modal open={open} onClose={onClose} title="Placer une mise en attente" subtitle="Les actions concernées seront différées ; le Rule Engine réévaluera sa décision." busy={busy} error={error} submitLabel="Placer la mise en attente"
      onSubmit={() => submit(() => placeHold({ scope: f.scope, type: f.type, targetId, retryAt: f.retryAt, cause: f.cause }), 'Mise en attente placée')}>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend className="vq-label" style={{ marginBottom: 8 }}>Portée</legend>
        <div className="vq-radio-row">
          {(Object.keys(HOLD_SCOPE_LABEL) as Hold['scope'][]).map((k) => (
            <label key={k} className="vq-radio"><input type="radio" name="scope" checked={f.scope === k} onChange={() => setF({ ...f, scope: k })} />{HOLD_SCOPE_LABEL[k]} <span className="vq-code">{k}</span></label>
          ))}
        </div>
      </fieldset>
      {f.scope === 'INVOICE' && (
        <div className="vq-field"><label htmlFor="h-inv">Facture</label><select id="h-inv" className="vq-input" value={f.invoice} onChange={(e) => setF({ ...f, invoice: e.target.value })}>{openInv.map((i) => <option key={i.id} value={i.id}>{i.id} · {data.clients.find((c) => c.id === i.clientId)?.name}</option>)}</select></div>
      )}
      {f.scope === 'CUSTOMER' && (
        <div className="vq-field"><label htmlFor="h-cli">Client</label><select id="h-cli" className="vq-input" value={f.client} onChange={(e) => setF({ ...f, client: e.target.value })}>{data.clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      )}
      {f.scope === 'ORGANIZATION' && <div className="vq-callout amber">Toutes les actions de l’organisation seront différées jusqu’à la date de réessai.</div>}
      <div className="vq-grid cols-2">
        <div className="vq-field"><label htmlFor="h-type">Type</label><select id="h-type" className="vq-input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value as Hold['type'] })}>{(Object.keys(HOLD_TYPE_LABEL) as Hold['type'][]).map((k) => <option key={k} value={k}>{HOLD_TYPE_LABEL[k]}</option>)}</select></div>
        <div className="vq-field"><label htmlFor="h-retry">Réessai prévu *</label><input id="h-retry" type="date" className="vq-input" value={f.retryAt} onChange={(e) => setF({ ...f, retryAt: e.target.value })} /></div>
      </div>
      <div className="vq-field"><label htmlFor="h-cause">Cause</label><textarea id="h-cause" rows={3} className="vq-input" value={f.cause} onChange={(e) => setF({ ...f, cause: e.target.value })} placeholder="Ex. négociation d’un échéancier en cours" /></div>
    </Modal>
  );
}
