import type { ReactNode } from 'react';
import { Page, SectionTitle } from '../components/SiteChrome';
import { anVotes, bords, cards, groups } from '../lib/content';
import { THRESHOLDS } from '../lib/scoring';
import { formatDate } from '../lib/themes';
import { Link } from '../lib/router';
import { useDocumentTitle } from '../lib/hooks';

function Block({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <section className="grid gap-3 border-t border-rule py-8 sm:grid-cols-[4rem_1fr]">
      <span className="serif-num text-3xl text-violet">{n}</span>
      <div>
        <h2 className="font-serif text-2xl leading-snug">{title}</h2>
        <div className="prose-cst mt-3 text-[1.02rem] leading-relaxed text-ink-2">{children}</div>
      </div>
    </section>
  );
}

function Formula({ children }: { children: ReactNode }) {
  return (
    <p className="my-4 rounded-xl border border-rule bg-card px-5 py-4 font-serif text-lg text-ink" role="math">
      {children}
    </p>
  );
}

export default function Methode() {
  useDocumentTitle('Méthode');
  return (
    <Page narrow>
      <header className="pt-10 pb-6">
        <p className="kicker text-violet">Méthode</p>
        <h1 className="mt-3 font-serif text-[clamp(2.2rem,7vw,3.6rem)] leading-tight font-medium">Comment les cartes sont faites, et comment on compte</h1>
        <p className="mt-4 text-lg text-ink-2">
          Tout ce qui est calculé ici repose sur des votes publics. Voici les règles, y compris celles qui ont un défaut connu.
        </p>
      </header>

      <SectionTitle kicker="Les cartes" title="Un vrai scrutin derrière chaque question" />

      <Block n="01" title="D’où viennent les questions">
        <p>
          Chaque carte correspond à un scrutin public de l’Assemblée nationale (17ᵉ législature) : vote sur un texte entier, un article ou
          un amendement. Le paquet compte {cards.length} cartes, qui couvrent l’économie, le social, l’immigration, l’écologie, les
          institutions, l’international et la sécurité.
        </p>
        <p>
          Les votes viennent des données ouvertes de l’Assemblée (scrutins du {formatDate(anVotes.source.premierScrutin)} au{' '}
          {formatDate(anVotes.source.dernierScrutin)}), sans intermédiaire.
        </p>
      </Block>

      <Block n="02" title="Ce qui est écarté">
        <p>
          <b>Les votes libres</b>, où les groupes se divisent en interne (par exemple l’aide à mourir) : ils ne disent rien de la position
          d’un groupe. <b>Les votes quasi unanimes</b> : un scrutin où tout le monde vote pareil ne départage personne. <b>Les amendements
          d’appel</b>, déposés pour lancer un débat sans chercher à être adoptés. <b>Les motions de censure et votes de confiance</b>, qui
          portent sur un gouvernement plutôt que sur une mesure.
        </p>
        <p>
          Quand un texte est consensuel mais qu’une de ses dispositions divise, c’est cette disposition qui fait la carte.
        </p>
      </Block>

      <Block n="03" title="Trois écrans, deux camps obligatoires">
        <p>
          La question, puis les arguments pour et contre, puis les détails et les sources. On ne peut pas voter sans avoir ouvert les
          deux camps : les arguments rééquilibrent une question qui serait mal posée. Ils sont en nombre égal, de longueur comparable, et
          reprennent ce qui a été dit pendant les débats, sans nommer qui l’a dit. Sur téléphone, l’onglet qui s’ouvre en premier (pour ou
          contre) est tiré au hasard à chaque partie.
        </p>
        <p>
          Aucune carte ne mentionne de parti, de groupe ou de personnalité. Les liens qui montrent comment les groupes ont voté ne sont
          affichés qu’à la fin.
        </p>
      </Block>

      <Block n="04" title="La suite du texte">
        <p>
          Un vote n’est pas une loi. Plusieurs mesures votées ont ensuite été rejetées par le Sénat ou censurées par le Conseil
          constitutionnel : chaque carte indique ce qu’est devenu le texte.
        </p>
      </Block>

      <div className="mt-10" />
      <SectionTitle kicker="Le calcul" title="Une proximité, pas une étiquette" />

      <Block n="05" title="Vos réponses">
        <p>
          <b>Pour</b> vaut +1, <b>contre</b> −1, <b>neutre</b> 0. <b>Ne se prononce pas</b> est exclu du calcul : ce n’est pas une opinion
          moyenne, c’est une absence d’opinion. Une carte marquée « important pour moi » compte double.
        </p>
      </Block>

      <Block n="06" title="La position d’un groupe">
        <Formula>
          position = (pour − contre) ÷ (pour + contre + abstentions)
        </Formula>
        <p>
          Elle va de −1 (tout le groupe contre) à +1 (tout le groupe pour). <b>Les absents ne sont jamais comptés</b> : un député absent
          n’est pas un député neutre. Avec moins de deux votants, la position est considérée comme inconnue et la carte est ignorée pour ce
          groupe. Si le scrutin portait sur la suppression d’une mesure, la position est inversée pour correspondre à la question.
        </p>
        <p>
          Chaque position est datée : un groupe peut changer d’avis d’un vote à l’autre. Le calcul utilise un scrutin principal par carte ;
          les autres votes sur la même mesure sont montrés à l’écran de résultats.
        </p>
      </Block>

      <Block n="07" title="L’accord et la proximité">
        <Formula>accord = 1 − |votre réponse − position du groupe| ÷ 2</Formula>
        <p>
          L’accord va de 0 (positions opposées) à 1 (positions identiques). La proximité est la moyenne des accords sur toutes les cartes
          comparables, en pondérant par deux les cartes importantes pour vous.
        </p>
      </Block>

      <Block n="08" title="Trois niveaux, qui se débloquent">
        <p>
          Dès {THRESHOLDS.bords} réponses comptées, les <b>bords politiques</b> : les {groups.length} groupes réunis en {bords.length} bords
          selon les alliances des législatives de 2024. La position d’un bord additionne les voix de tous ses députés : le plus grand groupe
          y pèse donc le plus. Le bord « Droite républicaine » ne compte qu’un groupe ; le groupe LIOT, transpartisan, et les non-inscrits ne
          sont rattachés à aucun bord. À {THRESHOLDS.groupes} réponses, les <b>groupes parlementaires</b> et l’hémicycle. À{' '}
          {THRESHOLDS.candidats}, les <b>candidats</b>.
        </p>
        <p>
          Des scores égaux (au pourcent près) partagent le même rang, marqué « ex æquo » ; ils sont alors présentés par ordre alphabétique.
        </p>
        <p>
          Fiabilité : faible avant 18 réponses, moyenne jusqu’à 24, bonne à partir de 25. Les outils comparables utilisent de 20 à 75
          questions.
        </p>
      </Block>

      <Block n="09" title="Les candidats">
        <p>
          Un candidat qui siège à l’Assemblée est jugé sur <b>ses propres votes</b> quand il a voté, ou sur l’intention qu’il a déclarée
          officiellement après coup (« mise au point »). Sinon, et pour les candidats qui ne sont pas députés, on prend le <b>vote
          majoritaire du groupe</b> de son parti (pour, contre ou abstention), comme s’il avait voté avec lui : les deux cas sont ainsi
          comparés sur la même base, celle d’un vote individuel. C’est une approximation, signalée à côté de chaque nom ; les candidats
          estimés exactement de la même façon sont réunis sur une seule ligne. Un candidat dont le parti n’a pas de groupe à l’Assemblée
          apparaît comme « non calculable ».
        </p>
      </Block>

      <Block n="10" title="L’ordre des cartes">
        <p>
          Les premières cartes sont choisies parmi les plus clivantes, dans des thèmes variés, avec une part de hasard propre à chaque
          partie : tout le monde ne commence pas par les mêmes. Ensuite, la carte suivante est celle qui départage le mieux les groupes dont
          vous êtes le plus proche : les cartes qui ne séparent que deux voisins arrivent en fin de partie.
        </p>
      </Block>

      <Block n="11" title="Votre hémicycle">
        <p>
          Chaque député en exercice est comparé à vos réponses, sur son vote ou sa mise au point officielle. Quand il n’a pas voté (absence,
          présidence de séance…), on prend la position du groupe auquel il appartenait ce jour-là, jamais une position neutre ; les votes
          antérieurs à son mandat sont ignorés. L’hémicycle s’affiche à partir de {THRESHOLDS.groupes} réponses. Les groupes sont placés
          d’après les numéros de sièges officiels.
        </p>
      </Block>

      <Block n="12" title="Limites connues">
        <p>
          Un même vote peut avoir des motivations opposées : deux groupes qui votent pareil ne pensent pas forcément pareil. Un vote de
          groupe ne dit pas tout d’un programme présidentiel. Le choix des cartes, même encadré par ces règles, reste un choix éditorial :{' '}
          <Link to="cartes" className="link text-violet">
            toutes les cartes et leurs sources sont consultables
          </Link>
          .
        </p>
      </Block>
    </Page>
  );
}
