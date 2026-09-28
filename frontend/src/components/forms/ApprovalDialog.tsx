import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui';
import { useData } from '@/services/DataProvider';
import { fcfa } from '@/domain/format';
import { useSubmit } from './useSubmit';

/** « Décider » : un utilisateur habilité accorde ou refuse l'approbation requise. */
export function ApprovalDialog({ invoiceId, onClose }: { invoiceId: string | null; onClose: () => void }) {
  const { data, decideApproval } = useData();
  const [decision, setDecision] = useState<'APPROVED' | 'REFUSED'>('APPROVED');
  const [reason, setReason] = useState('');
  useEffect(() => { setDecision('APPROVED'); setReason(''); }, [invoiceId]);
  const { busy, error, submit } = useSubmit(onClose);
  const inv = data.invoices.find((i) => i.id === invoiceId);
  if (!inv) return null;
  const client = data.clients.find((c) => c.id === inv.clientId)?.name;

  return (
    <Modal open={!!invoiceId} onClose={onClose} title="Décider de l’approbation" subtitle={<>{inv.id} · {client} · {fcfa(inv.amount)} FCFA · {inv.action}</>} busy={busy} error={error} submitLabel="Confirmer la décision"
      onSubmit={() => submit(() => decideApproval({ invoiceId: inv.id, decision, reason }), decision === 'APPROVED' ? 'Approbation accordée' : 'Approbation refusée')}>
      <div className="vq-radio-row">
        <label className="vq-radio"><input type="radio" name="dec" checked={decision === 'APPROVED'} onChange={() => setDecision('APPROVED')} />Approuver l’action</label>
        <label className="vq-radio"><input type="radio" name="dec" checked={decision === 'REFUSED'} onChange={() => setDecision('REFUSED')} />Refuser</label>
      </div>
      <div className="vq-field"><label htmlFor="ap-reason">Motif *</label><textarea id="ap-reason" rows={3} className="vq-input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex. client prévenu par le commercial, appel autorisé" /></div>
      <div className="vq-hint">Votre décision est tracée dans le journal. Si elle est accordée, la tâche manuelle peut être prise en charge ; le Rule Engine reste l’autorité à l’exécution.</div>
    </Modal>
  );
}
