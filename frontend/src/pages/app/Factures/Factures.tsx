import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useInvoices, useClients } from '@/hooks/useDemo';
import { useDrawer } from '@/hooks/useDrawer';
import { useData } from '@/services/DataProvider';
import { fcfa, dateFr } from '@/domain/format';
import type { Invoice } from '@/domain/types';
import { DecisionDrawer } from '@/components/decision';
import { DimensionsLegend, DueStatus, InvoiceOutcome, KpiCard, LevelChip, PageHeader, PriorityPill, RankTag, RiskBadge, Tabs } from '@/components/ui';

type FilterKey = 'toutes' | 'ouvertes' | 'retard' | 'proche' | 'avenir' | 'payees' | 'attente' | 'supprimees';
const FILTERS: { key: FilterKey; label: string; test: (i: Invoice) => boolean }[] = [
  { key: 'toutes', label: 'Toutes', test: () => true },
  { key: 'ouvertes', label: 'Ouvertes', test: (i) => i.dueStatus !== 'paid' },
  { key: 'retard', label: 'En retard', test: (i) => i.dueStatus === 'late' },
  { key: 'proche', label: 'Proches', test: (i) => i.dueStatus === 'near' },
  { key: 'avenir', label: 'À venir', test: (i) => i.dueStatus === 'future' },
  { key: 'payees', label: 'Payées', test: (i) => i.dueStatus === 'paid' },
  { key: 'attente', label: 'Mises en attente', test: (i) => i.outcome === 'DEFER' },
  { key: 'supprimees', label: 'Supprimées', test: (i) => i.outcome === 'SUPPRESS' },
];

/** Factures : toutes les factures avec la décision du Rule Engine pour chacune. */
export default function Factures() {
  const { all } = useInvoices();
  const { byId } = useClients();
  const { data } = useData();
  const drawer = useDrawer();
  const [filter, setFilter] = useState<FilterKey>('toutes');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const f = FILTERS.find((x) => x.key === filter)!;
    const q = query.trim().toLowerCase();
    return all.filter(f.test).filter((i) => !q || i.id.toLowerCase().includes(q) || byId(i.clientId)?.name.toLowerCase().includes(q));
  }, [all, filter, query, byId]);

  const k = data.kpis;
  return (
    <>
      <PageHeader
        title="Factures"
        sub="Toutes vos factures, avec la décision du Rule Engine pour chacune."
        actions={<><Link to="/app/import" className="vq-btn">Importer</Link><button type="button" className="vq-btn primary">+ Nouvelle facture</button></>}
      />
      <div className="vq-grid cols-4">
        <KpiCard label="Créances ouvertes" value={fcfa(k.openReceivables.value)} unit="FCFA" hint="7 factures · à date" />
        <KpiCard label="En retard" value={fcfa(k.late.value)} unit="FCFA" hint="3 factures" tone="red" />
        <KpiCard label="À encaisser · 30 j" value={fcfa(k.expected30d.value)} unit="FCFA" hint="4 factures proches ou à venir" />
        <KpiCard label="Encaissé · ce mois" value={fcfa(k.collectedMonth.value)} unit="FCFA" hint="3 factures payées" />
      </div>

      <section className="vq-card" style={{ gap: 8 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Tabs label="Filtrer les factures" value={filter} onChange={setFilter} tabs={FILTERS.map((f) => ({ key: f.key, label: f.label, count: all.filter(f.test).length }))} />
          </div>
          <input className="vq-input" style={{ width: 260, height: 40 }} type="search" placeholder="Filtrer : numéro ou client" aria-label="Filtrer les factures par numéro ou client" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="vq-table-wrap">
          <table className="vq-table">
            <thead>
              <tr><th>Facture</th><th>Client</th><th className="num">Montant</th><th>Échéance</th><th>Risque</th><th>Priorité · rang</th><th>Niveau</th><th>Décision du moteur</th><th /></tr>
            </thead>
            <tbody>
              {rows.map((inv) => (
                <tr key={inv.id} className={drawer.selected === inv.id ? 'selected' : ''}>
                  <td className="vq-mono strong">{inv.dueStatus === 'paid' ? inv.id : <Link className="vq-link" to={`/app/factures/${inv.id}`}>{inv.id}</Link>}</td>
                  <td className="strong">{byId(inv.clientId)?.name}</td>
                  <td className="num">{fcfa(inv.amount)}</td>
                  <td>{dateFr(inv.dueDate)}<div><DueStatus invoice={inv} /></div></td>
                  <td><RiskBadge value={inv.risk} /></td>
                  <td><span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}><PriorityPill value={inv.priority} /><RankTag rank={inv.rank} /></span></td>
                  <td><LevelChip value={inv.level} /></td>
                  <td><InvoiceOutcome invoice={inv} /><div className="small">{inv.note}</div></td>
                  <td>{inv.dueStatus !== 'paid' && <button type="button" className="vq-btn sm" onClick={() => drawer.open(inv.id)}>Pourquoi ?</button>}</td>
                </tr>
              ))}
              {rows.length === 0 && <tr><td colSpan={9} className="vq-muted">Aucune facture ne correspond à ce filtre.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <p className="vq-sub" style={{ maxWidth: 620, lineHeight: 1.5 }}>Risque, priorité et niveau de recouvrement sont trois dimensions indépendantes, retournées séparément par le Rule Engine. Une facture à risque critique n’est pas forcément la première à traiter.</p>
        <DimensionsLegend />
      </div>
      <DecisionDrawer invoiceId={drawer.selected} onClose={drawer.close} />
    </>
  );
}
