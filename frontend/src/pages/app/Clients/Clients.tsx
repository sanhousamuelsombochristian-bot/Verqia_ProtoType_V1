import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { dateFr, fcfa } from '@/domain/format';
import { HOLD_SCOPE_LABEL, HOLD_TYPE_LABEL } from '@/domain/lexique';
import { DecisionDrawer } from '@/components/decision';
import { NewClientDialog, NewInvoiceDialog } from '@/components/forms';
import { DueStatus, EventList, InvoiceOutcome, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, SectionHead } from '@/components/ui';

/** Clients : portefeuille classé par priorité calculée + fiche du client sélectionné. */
export default function Clients() {
  const { clients, byId } = useClients();
  const { all } = useInvoices();
  const { data } = useData();
  const drawer = useDrawer();
  const [params, setParams] = useSearchParams();
  const [creating, setCreating] = useState(false);
  const [newInvoice, setNewInvoice] = useState(false);
  const [justCreated, setJustCreated] = useState<string | null>(null);
  // Sélectionne automatiquement le client qui vient d'être créé.
  useEffect(() => {
    if (!justCreated) return;
    const c = clients.find((x) => x.name.toLowerCase() === justCreated.trim().toLowerCase());
    if (c) { setParams({ c: c.id }); setJustCreated(null); }
  }, [justCreated, clients, setParams]);
  const selected = byId(params.get('c') ?? 'A') ?? clients[0];
  const invoices = all.filter((i) => i.clientId === selected.id);
  const events = data.events.filter((e) => e.detail.includes(selected.name)).slice(0, 5);
  const hold = data.holds.find((h) => (h.scope === 'CUSTOMER' && h.targetId === selected.id) || (h.scope === 'INVOICE' && invoices.some((i) => i.id === h.targetId)) || h.scope === 'ORGANIZATION');

  return (
    <>
      <PageHeader title="Clients" sub="Chaque client avec son encours, ses factures et la décision du moteur." actions={<button type="button" className="vq-btn primary" onClick={() => setCreating(true)}>+ Nouveau client</button>} />
      <div className="vq-row">
        <section className="vq-card grow">
          <SectionHead eyebrow="Portefeuille" title="Clients classés par priorité calculée" sub="L’encours est une information secondaire : il ne fixe pas l’ordre." />
          <div className="vq-table-wrap">
            <table className="vq-table">
              <thead><tr><th>Rang</th><th>Client</th><th className="num">Encours</th><th>Priorité</th><th>Risque</th><th>Niv.</th></tr></thead>
              <tbody>
                {clients.map((c) => (
                  <tr key={c.id} className={c.id === selected.id ? 'selected' : ''}>
                    <td><RankTag rank={c.rank} /></td>
                    <td>
                      <button type="button" onClick={() => setParams({ c: c.id })} aria-pressed={c.id === selected.id} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}>
                        <div className="strong">{c.name}</div><div className="small">{c.openInvoices} facture(s) ouverte(s){c.rank === null ? ' · non évalué par le moteur' : ''}</div>
                      </button>
                    </td>
                    <td className="num">{fcfa(c.outstanding ?? 0)}</td>
                    <td><PriorityPill value={c.priority} /></td>
                    <td><RiskBadge value={c.risk} /></td>
                    <td><LevelChip value={c.level} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <section className="vq-card" style={{ width: 400, flexShrink: 0 }} aria-live="polite">
          <SectionHead eyebrow="Fiche client" title={<span style={{ fontSize: 22 }}>{selected.name}</span>} sub={<>{selected.rank === null ? 'Pas encore évalué par le Rule Engine' : <>Rang client <RankTag rank={selected.rank} /></>} · contact : {[selected.email, selected.phone].filter(Boolean).join(' · ') || '[à compléter]'}</>} />
          <div className="vq-grid cols-3">
            <div className="vq-tile"><div className="vq-label">Risque</div><RiskBadge value={selected.risk} /></div>
            <div className="vq-tile"><div className="vq-label">Priorité</div><PriorityPill value={selected.priority} /></div>
            <div className="vq-tile"><div className="vq-label">Niveau</div><LevelChip value={selected.level} /></div>
          </div>
          <div><div className="vq-sub">Encours</div><div style={{ fontSize: 26, fontWeight: 800, color: 'var(--heading)' }}>{fcfa(selected.outstanding ?? 0)} <span className="vq-sub">FCFA</span></div></div>
          {hold && <div className="vq-callout amber"><span className="title-amber">Mise en attente active</span> · {HOLD_TYPE_LABEL[hold.type]} · portée {HOLD_SCOPE_LABEL[hold.scope]} · réessai prévu le {dateFr(hold.retryAt)}</div>}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div className="vq-label">Factures</div><button type="button" className="vq-btn sm" onClick={() => setNewInvoice(true)}>+ Nouvelle facture</button></div>
          {invoices.length === 0 && <div className="vq-sub">Aucune facture pour ce client.</div>}
          {invoices.map((i) => (
            <div key={i.id} className="vq-event" style={{ alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div className="title"><Link className="vq-link" to={`/app/factures/${i.id}`}>{i.id}</Link> · {fcfa(i.amount)}</div>
                <DueStatus invoice={i} />
              </div>
              <InvoiceOutcome invoice={i} />
              {i.dueStatus !== 'paid' && <button type="button" className="vq-btn sm" onClick={() => drawer.open(i.id)}>Pourquoi ?</button>}
            </div>
          ))}
          <div className="vq-label">Historique</div>
          <EventList events={events} />
        </section>
      </div>
      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
      <NewClientDialog open={creating} onClose={() => setCreating(false)} onCreated={setJustCreated} />
      <NewInvoiceDialog open={newInvoice} onClose={() => setNewInvoice(false)} clientId={selected.id} />
    </>
  );
}
