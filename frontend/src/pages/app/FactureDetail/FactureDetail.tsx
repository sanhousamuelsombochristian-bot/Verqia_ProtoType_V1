import { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { holdsFor, remaining } from '@/services/store';
import { dateFr, dateTimeShort, fcfa } from '@/domain/format';
import { HOLD_SCOPE_LABEL, HOLD_TYPE_LABEL, STATE_LABEL } from '@/domain/lexique';
import { DecisionDrawer } from '@/components/decision';
import { HoldDialog, PaymentDialog } from '@/components/forms';
import { DueStatus, InvoiceOutcome, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, SectionHead, useToast } from '@/components/ui';
import './FactureDetail.css';

/** Fiche facture : dimensions, décision, chronologie, paiements, mises en attente, notes. */
export default function FactureDetail() {
  const { id = '' } = useParams();
  const { data, addNote } = useData();
  const { all, byId } = useInvoices();
  const clients = useClients();
  const drawer = useDrawer();
  const toast = useToast();
  const [paying, setPaying] = useState(false);
  const [holding, setHolding] = useState(false);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);

  const inv = byId(id);
  if (!inv) return <Navigate to="/app/factures" replace />;

  const client = clients.byId(inv.clientId)!;
  const paid = inv.dueStatus === 'paid';
  const ids = all.filter((i) => i.dueStatus !== 'paid' || i.id === inv.id).map((i) => i.id);
  const pos = ids.indexOf(inv.id);
  const prev = ids[(pos + ids.length - 1) % ids.length];
  const next = ids[(pos + 1) % ids.length];
  const history = data.events.filter((e) => e.detail.includes(inv.id) || (e.cat === 'hold' && e.detail.includes(client.name)));
  const promises = data.promises.filter((p) => p.invoiceId === inv.id);
  const payments = data.payments.filter((p) => p.invoiceId === inv.id);
  const holds = holdsFor(data, inv);
  const notes = data.notes.filter((n) => n.invoiceId === inv.id);
  const dec = data.decisions[inv.id];

  const saveNote = async () => {
    const err = await addNote({ invoiceId: inv.id, text: note });
    setNoteError(err);
    if (!err) { setNote(''); toast('Note ajoutée'); }
  };

  return (
    <>
      <PageHeader
        title={`${inv.id} · ${client.name}`}
        sub="Fiche facture : montant, décision du moteur, historique et promesses."
        actions={<>
          <Link className="vq-btn" to={`/app/factures/${prev}`} aria-label="Facture précédente">‹ {prev}</Link>
          <Link className="vq-btn" to={`/app/factures/${next}`} aria-label="Facture suivante">{next} ›</Link>
          {!paid && <button type="button" className="vq-btn" onClick={() => setHolding(true)}>Placer une mise en attente</button>}
          {!paid && <button type="button" className="vq-btn primary" onClick={() => setPaying(true)}>Enregistrer un paiement</button>}
        </>}
      />
      <Link to="/app/factures" className="vq-sub" style={{ textDecoration: 'none', fontWeight: 600 }}>← Factures</Link>

      <div className="vq-fd-tiles">
        <div className="vq-tile"><div className="vq-label">Montant · échéance</div><div className="big">{fcfa(inv.amount)} <span className="vq-sub">FCFA</span></div><div>{dateFr(inv.dueDate)} · <DueStatus invoice={inv} /></div></div>
        <div className="vq-tile"><div className="vq-label">Risque</div><RiskBadge value={inv.risk} /><span className="vq-code">risk_level</span></div>
        <div className="vq-tile"><div className="vq-label">Priorité · rang</div><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><PriorityPill value={inv.priority} /><RankTag rank={inv.rank} /></span><span className="vq-code">priority_level · rank_score</span></div>
        <div className="vq-tile"><div className="vq-label">Niveau de recouvrement</div><div><LevelChip value={inv.level} />{!inv.level && <span className="vq-muted">—</span>}</div><span className="vq-code">collection_level</span></div>
      </div>

      <section className="vq-card vq-fd-decision">
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div className="vq-label">Décision du Rule Engine</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <InvoiceOutcome invoice={inv} />
            {inv.actionState && <><strong style={{ color: 'var(--heading)' }}>{STATE_LABEL[inv.actionState]}</strong><span className="vq-code">{inv.actionState}</span></>}
          </div>
          <div style={{ fontSize: 14, color: 'var(--soft)' }}>{inv.action}</div>
        </div>
        {!paid && dec && <button type="button" className="vq-btn" onClick={() => drawer.open(inv.id)}>Pourquoi ?</button>}
      </section>

      <div className="vq-row">
        <section className="vq-card grow">
          <SectionHead eyebrow="Historique" title="Chronologie de la facture" sub="Du plus récent au plus ancien." />
          <ol className="vq-timeline">
            {history.map((e, i) => (
              <li key={i}><span className={`vq-dot tone-${e.tone}`} /><div><div className="t">{e.title}</div><div className="vq-sub">{e.detail}</div></div><time>{dateTimeShort(e.at)}</time></li>
            ))}
            <li><span className="vq-dot tone-low" /><div><div className="t">Facture importée</div><div className="vq-sub">Échéance {dateFr(inv.dueDate)} · {fcfa(inv.amount)} FCFA</div></div><time>[date d’import]</time></li>
          </ol>
        </section>
        <div className="vq-fd-side">
          <div className="vq-tile">
            <div className="vq-label">Promesses de paiement</div>
            {promises.length === 0 && <div className="vq-sub">Aucune promesse enregistrée.</div>}
            {promises.map((p) => (
              <div key={p.invoiceId} style={{ display: 'flex', justifyContent: 'space-between', gap: 10 }}>
                <div><strong style={{ color: 'var(--heading)' }}>{p.promisedFor ? dateFr(p.promisedFor) : '[date promise]'}</strong><div className="vq-sub">{p.note}</div></div>
                <span className={`vq-chip ${p.status === 'ROMPUE' ? 'bad' : 'ok'}`}>{p.status === 'ROMPUE' ? 'Rompue' : p.status === 'TENUE' ? 'Tenue' : 'En cours'}</span>
              </div>
            ))}
          </div>
          <div className="vq-tile">
            <div className="vq-label">Paiements</div>
            {payments.length === 0 && <div className="vq-sub">Aucun paiement reçu.</div>}
            {payments.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13.5 }}>
                <span>{dateFr(p.date)} · {p.method}</span><strong style={{ color: 'var(--accent)' }}>+ {fcfa(p.amount)}</strong>
              </div>
            ))}
            <div className="vq-sub">{paid ? 'Facture soldée.' : `Reste dû : ${fcfa(remaining(inv))} FCFA`}</div>
          </div>
          {holds.map((h) => (
            <div key={h.id ?? h.retryAt} className="vq-callout amber"><span className="title-amber">Mise en attente active</span> · {HOLD_TYPE_LABEL[h.type]} · portée {HOLD_SCOPE_LABEL[h.scope]} · réessai prévu le {dateFr(h.retryAt)}<div className="vq-sub">Cause : {h.cause}</div></div>
          ))}
          {dec?.override && <div className="vq-callout" style={{ borderColor: 'var(--heading)' }}><strong>Override · à revalider</strong> · l’autorisation sera revérifiée au moment de l’exécution.</div>}
          <div className="vq-tile">
            <div className="vq-label">Client</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div><strong style={{ color: 'var(--heading)' }}>{client.name}</strong><div className="vq-sub">Encours {fcfa(client.outstanding ?? 0)} FCFA{client.rank !== null && <> · rang client #{String(client.rank).padStart(2, '0')}</>}</div></div>
              <Link className="vq-link" to={`/app/clients?c=${client.id}`}>Voir le client →</Link>
            </div>
          </div>
          <form className="vq-tile" onSubmit={(e) => { e.preventDefault(); saveNote(); }}>
            <label className="vq-label" htmlFor="note">Notes internes</label>
            <textarea id="note" rows={3} className="vq-input" placeholder="Ajouter une note visible par votre équipe…" value={note} onChange={(e) => setNote(e.target.value)} />
            {noteError && <div role="alert" className="vq-sub" style={{ color: 'var(--red-text)' }}>{noteError}</div>}
            <div><button type="submit" className="vq-btn sm primary">Ajouter la note</button></div>
            {notes.map((n) => (
              <div key={n.id} style={{ borderTop: '1px solid var(--line)', paddingTop: 8 }}>
                <div style={{ fontSize: 13.5, whiteSpace: 'pre-wrap' }}>{n.text}</div>
                <div className="vq-sub">{dateTimeShort(n.at)} · Mon entreprise</div>
              </div>
            ))}
          </form>
        </div>
      </div>
      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
      <PaymentDialog open={paying} onClose={() => setPaying(false)} invoiceId={inv.id} />
      <HoldDialog open={holding} onClose={() => setHolding(false)} invoiceId={inv.id} />
    </>
  );
}
