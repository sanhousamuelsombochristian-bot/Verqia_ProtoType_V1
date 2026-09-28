import { Link, Navigate, useParams } from 'react-router-dom';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { dateFr, dateTimeShort, fcfa } from '@/domain/format';
import { STATE_LABEL } from '@/domain/lexique';
import { DecisionDrawer } from '@/components/decision';
import { DueStatus, InvoiceOutcome, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, SectionHead } from '@/components/ui';
import './FactureDetail.css';

/** Fiche facture : dimensions, décision, chronologie, promesses, client, notes. */
export default function FactureDetail() {
  const { id = '' } = useParams();
  const { data } = useData();
  const { open, byId } = useInvoices();
  const clients = useClients();
  const drawer = useDrawer();
  const inv = byId(id);
  if (!inv || inv.dueStatus === 'paid') return <Navigate to="/app/factures" replace />;

  const client = clients.byId(inv.clientId)!;
  const ids = open.map((i) => i.id);
  const pos = ids.indexOf(inv.id);
  const prev = ids[(pos + ids.length - 1) % ids.length];
  const next = ids[(pos + 1) % ids.length];
  const history = data.events.filter((e) => e.detail.includes(inv.id) || (e.cat === 'hold' && e.detail.includes(client.name)));
  const promises = data.promises.filter((p) => p.invoiceId === inv.id);
  const dec = data.decisions[inv.id];

  return (
    <>
      <PageHeader
        title={`${inv.id} · ${client.name}`}
        sub="Fiche facture : montant, décision du moteur, historique et promesses."
        actions={<>
          <Link className="vq-btn" to={`/app/factures/${prev}`} aria-label="Facture précédente">‹ {prev}</Link>
          <Link className="vq-btn" to={`/app/factures/${next}`} aria-label="Facture suivante">{next} ›</Link>
          <button type="button" className="vq-btn">Placer une mise en attente</button>
          <button type="button" className="vq-btn primary">Enregistrer un paiement</button>
        </>}
      />
      <Link to="/app/factures" className="vq-sub" style={{ textDecoration: 'none', fontWeight: 600 }}>← Factures</Link>

      <div className="vq-fd-tiles">
        <div className="vq-tile"><div className="vq-label">Montant · échéance</div><div className="big">{fcfa(inv.amount)} <span className="vq-sub">FCFA</span></div><div>{dateFr(inv.dueDate)} · <DueStatus invoice={inv} /></div></div>
        <div className="vq-tile"><div className="vq-label">Risque</div><RiskBadge value={inv.risk} /><span className="vq-code">risk_level</span></div>
        <div className="vq-tile"><div className="vq-label">Priorité · rang</div><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><PriorityPill value={inv.priority} /><RankTag rank={inv.rank} /></span><span className="vq-code">priority_level · rank_score</span></div>
        <div className="vq-tile"><div className="vq-label">Niveau de recouvrement</div><div><LevelChip value={inv.level} /></div><span className="vq-code">collection_level</span></div>
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
        <button type="button" className="vq-btn" onClick={() => drawer.open(inv.id)}>Pourquoi ?</button>
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
          <div className="vq-tile"><div className="vq-label">Paiements</div><div className="vq-sub">Aucun paiement reçu · reste dû {fcfa(inv.amount)} FCFA</div></div>
          {dec?.hold && <div className="vq-callout amber"><span className="title-amber">Mise en attente active</span> · Négociation · portée Client · réessai prévu le {dateFr(dec.hold.retryAt)}</div>}
          {dec?.override && <div className="vq-callout" style={{ borderColor: 'var(--heading)' }}><strong>Override · à revalider</strong> · l’autorisation sera revérifiée au moment de l’exécution.</div>}
          <div className="vq-tile">
            <div className="vq-label">Client</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
              <div><strong style={{ color: 'var(--heading)' }}>{client.name}</strong><div className="vq-sub">Encours {fcfa(client.outstanding ?? 0)} FCFA · rang client #{String(client.rank).padStart(2, '0')}</div></div>
              <Link className="vq-link" to={`/app/clients?c=${client.id}`}>Voir le client →</Link>
            </div>
          </div>
          <div className="vq-tile">
            <label className="vq-label" htmlFor="note">Notes internes</label>
            <textarea id="note" rows={3} className="vq-input" placeholder="Ajouter une note visible par votre équipe…" />
          </div>
        </div>
      </div>
      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
    </>
  );
}
