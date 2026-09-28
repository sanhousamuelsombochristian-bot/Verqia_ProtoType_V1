import { useData } from '@/services/DataProvider';
import { useClients, useInvoices } from '@/hooks/useDemo';
import { dateFr, fcfa } from '@/domain/format';
import { KpiCard, PageHeader, SectionHead } from '@/components/ui';

/** Paiements : encaissements reçus, promesses de paiement, rapprochement. */
export default function Paiements() {
  const { data } = useData();
  const { all } = useInvoices();
  const { byId } = useClients();
  const paid = all.filter((i) => i.dueStatus === 'paid');

  return (
    <>
      <PageHeader title="Paiements" sub="Paiements reçus, promesses de paiement et rapprochement avec les factures." actions={<button type="button" className="vq-btn primary">+ Enregistrer un paiement</button>} />
      <div className="vq-callout lime dashed"><strong>Rapprochement automatique : intégration à venir.</strong> Dans ce prototype, les paiements sont enregistrés manuellement puis rapprochés de leur facture.</div>
      <div className="vq-grid cols-4">
        <KpiCard label="Encaissé · ce mois" value={fcfa(data.kpis.collectedMonth.value)} unit="FCFA" hint="3 paiements" />
        <KpiCard label="Promesses en cours" value="1" unit="promesse" hint="2 100 000 FCFA · 29/09" />
        <KpiCard label="Promesses rompues" value="1" unit="promesse" hint="780 000 FCFA · 27/09" tone="red" />
        <KpiCard label="À rapprocher" value="0" unit="paiement" hint="Tout est rapproché" />
      </div>
      <section className="vq-card">
        <SectionHead eyebrow="Encaissements" title="Paiements reçus" />
        <div className="vq-table-wrap">
          <table className="vq-table">
            <thead><tr><th>Date</th><th>Client</th><th>Facture</th><th className="num">Montant</th><th>Moyen</th><th>Rapprochement</th></tr></thead>
            <tbody>
              {paid.map((i) => (
                <tr key={i.id}>
                  <td>{dateFr(i.paidOn)}</td><td className="strong">{byId(i.clientId)?.name}</td><td className="vq-mono">{i.id}</td>
                  <td className="num" style={{ color: 'var(--accent)' }}>+ {fcfa(i.amount)}</td><td className="vq-muted">[à préciser]</td>
                  <td><span className="vq-chip ok">Rapproché · facture payée</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="vq-card">
        <SectionHead eyebrow="Promesses de paiement" title="Engagements annoncés par vos clients" />
        <div className="vq-table-wrap">
          <table className="vq-table">
            <thead><tr><th>Client</th><th>Facture</th><th className="num">Montant</th><th>Date promise</th><th>Statut</th></tr></thead>
            <tbody>
              {data.promises.map((p) => (
                <tr key={p.invoiceId}>
                  <td className="strong">{byId(p.clientId)?.name}</td><td className="vq-mono">{p.invoiceId}</td><td className="num">{fcfa(p.amount)}</td>
                  <td>{p.promisedFor ? dateFr(p.promisedFor) : '[date promise]'}</td>
                  <td><span className={`vq-chip ${p.status === 'ROMPUE' ? 'bad' : 'ok'}`}>{p.status === 'ROMPUE' ? 'Rompue' : 'En cours'}</span> <span className="vq-sub">{p.note}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
