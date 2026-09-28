import { useState } from 'react';
import { useData } from '@/services/DataProvider';
import { PaymentDialog } from '@/components/forms';
import { useClients } from '@/hooks/useDemo';
import { dateFr, fcfa } from '@/domain/format';
import { KpiCard, PageHeader, SectionHead } from '@/components/ui';

/** Paiements : encaissements reçus, promesses de paiement, rapprochement. */
export default function Paiements() {
  const { data } = useData();
  const [paying, setPaying] = useState(false);
  const { byId } = useClients();
  const payments = [...data.payments].sort((a, b) => b.date.localeCompare(a.date));
  const inv = (id: string) => data.invoices.find((i) => i.id === id);

  return (
    <>
      <PageHeader title="Paiements" sub="Paiements reçus, promesses de paiement et rapprochement avec les factures." actions={<button type="button" className="vq-btn primary" onClick={() => setPaying(true)}>+ Enregistrer un paiement</button>} />
      <div className="vq-callout lime dashed"><strong>Rapprochement automatique : intégration à venir.</strong> Dans ce prototype, les paiements sont enregistrés manuellement puis rapprochés de leur facture.</div>
      <div className="vq-grid cols-4">
        <KpiCard label="Encaissé · ce mois" value={fcfa(data.kpis.collectedMonth.value)} unit="FCFA" hint={`${data.kpis.collectedMonth.count} paiements`} />
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
              {payments.map((p) => {
                const i = inv(p.invoiceId);
                return (
                  <tr key={p.id}>
                    <td>{dateFr(p.date)}</td><td className="strong">{byId(i?.clientId ?? '')?.name}</td><td className="vq-mono">{p.invoiceId}</td>
                    <td className="num" style={{ color: 'var(--accent)' }}>+ {fcfa(p.amount)}</td><td className="vq-muted">{p.method}</td>
                    <td><span className="vq-chip ok">{i?.dueStatus === 'paid' ? 'Rapproché · facture payée' : 'Rapproché · paiement partiel'}</span></td>
                  </tr>
                );
              })}
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
      <PaymentDialog open={paying} onClose={() => setPaying(false)} />
    </>
  );
}
