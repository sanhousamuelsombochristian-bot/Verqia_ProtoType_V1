import { STATE_LABEL, TASK_PATH } from '@/domain/lexique';
import { fcfa } from '@/domain/format';
import { useData } from '@/services/DataProvider';
import { useInvoices } from '@/hooks/useDemo';
import type { Task } from '@/domain/types';
import { useToast } from '@/components/ui';
import './TaskCard.css';

/** Tâche manuelle : cas d'usage ClaimTask (Prendre en charge) puis CompleteTask (Clôturer). */
export function TaskCard({ task, onWhy }: { task: Task; onWhy: (invoiceId: string) => void }) {
  const { claimTask, completeTask, error } = useData();
  const toast = useToast();
  const inv = useInvoices().byId(task.invoiceId);
  const idx = TASK_PATH.indexOf(task.state);

  if (task.blockedByApproval) {
    return (
      <div className="vq-task blocked">
        <div>
          <div className="vq-label" style={{ color: 'var(--amber-text)' }}>Tâche manuelle · bloquée</div>
          <div className="title">{task.label}</div>
          <div className="vq-sub"><span className="vq-mono">{task.invoiceId}</span> · {STATE_LABEL[task.state]} · prise en charge impossible tant que l’approbation n’est pas accordée.</div>
        </div>
        <button type="button" className="vq-btn sm" onClick={() => onWhy(task.invoiceId)}>Pourquoi ?</button>
      </div>
    );
  }

  return (
    <div className="vq-task">
      <div className="top">
        <div>
          <div className="vq-eyebrow">Tâche manuelle · relance</div>
          <div className="title">{task.label}</div>
          {inv && <div className="vq-sub"><span className="vq-mono">{inv.id}</span> · {fcfa(inv.amount)} FCFA · {inv.note}</div>}
        </div>
        <button type="button" className="vq-btn sm" onClick={() => onWhy(task.invoiceId)}>Pourquoi ?</button>
      </div>
      <ol className="path">
        {TASK_PATH.map((code, i) => (
          <li key={code} className={i === idx ? 'now' : i < idx ? 'done' : ''}>
            <span>{STATE_LABEL[code]}</span>
            <span className="vq-code">{code}</span>
          </li>
        ))}
      </ol>
      <div className="actions">
        {(task.state === 'RESCHEDULED' || task.state === 'PROPOSED') && (
          <><button type="button" className="vq-btn primary" onClick={async () => { if (!(await claimTask(task.id))) toast('Tâche prise en charge'); }}>Prendre en charge</button><span className="vq-code">ClaimTask</span></>
        )}
        {task.state === 'CLAIMED' && (
          <><button type="button" className="vq-btn primary" onClick={async () => { if (!(await completeTask(task.id))) toast('Tâche clôturée'); }}>Clôturer</button><span className="vq-code">CompleteTask</span></>
        )}
        {task.state === 'COMPLETED' && <span className="vq-chip ok">Tâche clôturée · résultat ajouté au journal</span>}
        {task.state === 'CANCELLED' && <span className="vq-chip">Tâche annulée (approbation refusée)</span>}
      </div>
      {error && <div role="alert" className="vq-callout amber">{error}</div>}
    </div>
  );
}
