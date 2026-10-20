import type { ReactNode } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import './PagesPubliques.css';

type Item = { title: string; text: string; status?: string };

function Intro({ eyebrow, title, lead }: { eyebrow: string; title: ReactNode; lead: string }) {
  return <header className="vq-public-intro"><span className="vq-eyebrow">{eyebrow}</span><h1>{title}</h1><p className="lead">{lead}</p></header>;
}

function Items({ items }: { items: Item[] }) {
  return <div className="vq-public-items">{items.map((item) => <article className="vq-public-item" key={item.title}>
    <div className="vq-public-item-top"><h2>{item.title}</h2>{item.status && <span className="vq-public-status">{item.status}</span>}</div>
    <p>{item.text}</p>
  </article>)}</div>;
}

export function Fonctionnalites() {
  return <div className="vq-public-page">
    <section className="vq-section"><Intro eyebrow="La plateforme" title={<>Du suivi à l’action, <em>sans perdre le fil.</em></>} lead="Verqia Pilot organise les informations qui relient une facture à son encaissement. Les capacités affichées ici évoluent avec le produit." />
      <Items items={[
        {title:'Factures et clients',text:'Centralisez les informations utiles, les échéances et l’historique de suivi.',status:'Socle du produit'},
        {title:'Créances et échéancier',text:'Repérez les montants attendus, les dates importantes et les retards à examiner.',status:'Socle du produit'},
        {title:'Relances organisées',text:'Préparez les actions de suivi et gardez la main sur leur validation. Une relance n’est pas annoncée comme envoyée sans transmission effective.',status:'Validation humaine'},
        {title:'Prévisions de trésorerie',text:'Examinez les encaissements attendus à partir des données disponibles et d’hypothèses explicites.',status:'Selon les données'},
        {title:'Import de données',text:'Préparez la reprise de données à partir des formats réellement pris en charge par votre espace.',status:'Formats à vérifier'},
        {title:'Plusieurs environnements',text:'Organisez plusieurs boutiques ou activités sous une même organisation lorsque le compte et son forfait le permettent.',status:'Selon configuration'}
      ]}/>
      <div className="vq-public-cta"><h2>Commencez par votre suivi actuel.</h2><p>Découvrez le parcours de démonstration et les capacités disponibles dans le prototype.</p><RouterLink className="vq-btn primary" to="/inscription">Découvrir le parcours →</RouterLink></div>
    </section>
  </div>;
}

export function Solutions() {
  return <div className="vq-public-page"><section className="vq-section">
    <Intro eyebrow="Solutions" title={<>Un pilotage pensé pour la réalité des PME B2B.</>} lead="Verqia Pilot s’adresse aux entreprises qui vendent avec des délais de paiement et doivent garder une vue claire sur les sommes attendues." />
    <Items items={[
      {title:'TPE et petites équipes',text:'Commencez avec une vue structurée des clients, des factures et des échéances, sans ajouter une couche de complexité inutile.'},
      {title:'PME en croissance',text:'Organisez les responsabilités de suivi et rendez les priorités plus visibles à mesure que le volume de créances augmente.'},
      {title:'Distributeurs et grossistes',text:'Suivez les factures clients et les engagements de paiement dans un cycle de vente à crédit.'},
      {title:'Prestataires B2B',text:'Gardez une vue d’ensemble des factures de prestations, des échéances et des actions de suivi.'},
      {title:'Entreprises multi-sites',text:'Préparez une organisation par environnement, sous réserve des fonctions et quotas effectivement activés.'}
    ]}/>
    <div className="vq-public-cta"><h2>Chaque entreprise a son rythme.</h2><p>Le programme pilote permet de confronter le produit aux pratiques réelles avant de figer les promesses commerciales.</p><RouterLink className="vq-btn primary" to="/inscription">Rejoindre le programme pilote</RouterLink></div>
  </section></div>;
}

export function Securite() {
  return <div className="vq-public-page"><section className="vq-section">
    <Intro eyebrow="Confiance et données" title={<>La confiance se construit par des contrôles <em>vérifiables.</em></>} lead="Les informations financières exigent des règles d’accès strictes, des opérations traçables et une communication transparente sur les limites du produit." />
    <Items items={[
      {title:'Séparation des espaces',text:'L’architecture doit contrôler côté serveur l’organisation et l’environnement associés à chaque requête. Un identifiant fourni par le navigateur ne suffit pas à autoriser un accès.'},
      {title:'Accès et permissions',text:'Les actions sensibles doivent être limitées aux utilisateurs autorisés et les erreurs ne doivent pas divulguer de données d’autres espaces.'},
      {title:'Traçabilité',text:'Les opérations importantes doivent conserver un historique cohérent lorsque cette capacité est activée dans le produit.'},
      {title:'Transparence des intégrations',text:'Une relance, un paiement ou un export externe n’est présenté comme réalisé que si le service correspondant est effectivement connecté et que le résultat a été vérifié.'}
    ]}/>
    <p className="vq-public-note">Cette page décrit les principes de conception visés. Elle ne constitue pas une certification, un audit de sécurité ni une déclaration de conformité réglementaire.</p>
  </section></div>;
}

export function Ressources() {
  return <div className="vq-public-page"><section className="vq-section">
    <Intro eyebrow="Ressources" title={<>Mieux organiser ses encaissements commence par de bonnes habitudes.</>} lead="Des contenus pédagogiques sur le suivi des créances, les échéances et la visibilité de trésorerie seront publiés au fil de la validation du produit." />
    <Items items={[
      {title:'Construire un échéancier fiable',text:'Les informations à réunir pour savoir ce qui est attendu et à quelle date.',status:'À préparer'},
      {title:'Structurer les relances clients',text:'Définir une cadence de suivi claire sans perdre l’historique des échanges.',status:'À préparer'},
      {title:'Lire les retards de paiement',text:'Distinguer un retard ponctuel d’un problème de suivi récurrent.',status:'À préparer'},
      {title:'Préparer ses données avant import',text:'Vérifier les clients, les factures, les dates et les montants avant la reprise.',status:'À préparer'}
    ]}/>
    <p className="vq-public-note">Les ressources détaillées sont en préparation. Aucun article fictif n’est présenté comme déjà publié.</p>
  </section></div>;
}

export function Contact() {
  return <div className="vq-public-page"><section className="vq-section">
    <Intro eyebrow="Contact" title={<>Parlons de votre cycle d’encaissement.</>} lead="Verqia Pilot est en phase de validation. Le moyen de contact officiel doit être configuré avant de publier un formulaire qui prétend transmettre vos informations." />
    <div className="vq-public-cta"><h2>Vous souhaitez participer au programme pilote ?</h2><p>Présentez votre entreprise via le parcours d’inscription du prototype. Celui-ci ne crée pas encore de compte authentifié ni n’envoie de demande à une équipe.</p><RouterLink className="vq-btn primary" to="/inscription">Ouvrir le formulaire de candidature</RouterLink></div>
  </section></div>;
}

export function Confidentialite() {
  return <div className="vq-public-page"><section className="vq-section">
    <Intro eyebrow="Document de travail" title={<>Politique de confidentialité</>} lead="Projet de texte à compléter et à faire vérifier avant toute mise en production." />
    <div className="vq-public-legal"><h2>1. Responsable du traitement</h2><p>Le nom légal, les coordonnées et le rôle du responsable du traitement doivent être renseignés avant publication.</p><h2>2. Données concernées</h2><p>Le produit peut nécessiter des informations de compte, d’organisation, de clients, de factures et de suivi. Seules les données nécessaires aux fonctions activées doivent être collectées.</p><h2>3. Finalités et accès</h2><p>Les finalités, bases légales, destinataires, durées de conservation et modalités d’exercice des droits doivent être définis et validés selon le contexte applicable.</p><h2>4. Sécurité et hébergement</h2><p>Les mesures réellement déployées, les prestataires utilisés, les lieux d’hébergement et les procédures d’incident doivent être documentés avant lancement.</p><h2>5. Contact et mise à jour</h2><p>Cette version est un brouillon et ne doit pas être considérée comme une politique juridiquement validée.</p></div>
  </section></div>;
}

export function Conditions() {
  return <div className="vq-public-page"><section className="vq-section">
    <Intro eyebrow="Document de travail" title={<>Conditions d’utilisation</>} lead="Projet de texte à compléter et à faire vérifier avant toute ouverture commerciale." />
    <div className="vq-public-legal"><h2>1. Objet du service</h2><p>Verqia Pilot vise à aider les entreprises à organiser le suivi des factures, des créances, des échéances et des actions associées. Il ne remplace pas un conseil comptable, juridique ou fiscal.</p><h2>2. Exactitude des données</h2><p>L’entreprise reste responsable de la qualité des informations saisies et doit vérifier les montants, les échéances et les opérations avant toute décision.</p><h2>3. Disponibilité et intégrations</h2><p>Les fonctions disponibles, les limites techniques, les services externes et les engagements de disponibilité doivent être définis dans une version contractuelle complète.</p><h2>4. Abonnement et résiliation</h2><p>Les prix, taxes éventuelles, renouvellements, modalités de paiement, changements de forfait et conditions de résiliation ne sont pas définitifs dans ce prototype.</p><h2>5. Version juridique</h2><p>Ce document est un brouillon de travail, non un contrat final. Il doit être adapté au service réellement fourni et vérifié par un professionnel compétent.</p></div>
  </section></div>;
}
