import type { ServiceKey } from './site';

export type ServiceSection = { heading: string; body: string };

export type ServiceCopy = {
  h1: string;
  lead: string;
  sections: ServiceSection[];
  /** Phrase d’accroche au-dessus des liens vers les autres services. */
  relatedHeading: string;
};

type Localized = { fr: ServiceCopy; en: ServiceCopy };

export const SERVICE_COPY: Record<ServiceKey, Localized> = {
  floor: {
    fr: {
      h1: 'Sablage de plancher de bois franc à Montréal',
      lead: "Avec les années, un plancher de bois franc encaisse tout : les égratignures des pattes de chaises, l’usure des corridors, les taches près des entrées, le vernis qui ternit et qui pèle. Le sablage est ce qui permet de repartir à zéro — on retire la couche de finition usée ainsi qu’une fine épaisseur de bois, ce qui fait disparaître rayures et imperfections et redonne au plancher sa surface d’origine. TALON PLANCHER offre ce service à Montréal, sur la Rive-Sud et sur la Rive-Nord.",
      sections: [
        {
          heading: 'Ce que comprend un sablage complet',
          body: "Le travail se fait en plusieurs passages successifs, du grain le plus grossier au plus fin, jusqu’à obtenir une surface parfaitement lisse. Les coins et les bordures — les endroits où un sablage bâclé se voit le plus — sont travaillés séparément pour que le résultat soit uniforme d’un mur à l’autre. Avant de commencer, nous protégeons les murs et les zones adjacentes; de votre côté, il suffit de retirer les meubles et les objets de la pièce.",
        },
        {
          heading: 'Teinture et finition',
          body: "Une fois le bois mis à nu, vous avez le choix de conserver sa couleur naturelle ou d’appliquer une teinture. C’est le meilleur moment pour changer la couleur de votre plancher : chêne, érable, merisier ou parqueterie réagissent chacun différemment à la teinture, et nous en discutons avec vous avant l’application. Vient ensuite le vernis protecteur, qui détermine la durabilité du plancher au quotidien. Nos produits sont à faible émission de COV; une légère odeur peut persister quelques jours et une bonne ventilation suffit à l’évacuer.",
        },
        {
          heading: 'Combien de temps ça prend',
          body: "Comptez généralement de 2 à 4 jours, selon la superficie et l’état du plancher. Ce délai inclut le séchage entre les couches de vernis, qui ne peut pas être précipité sans compromettre le résultat. Vous pouvez marcher délicatement sur le plancher environ 24 heures après la dernière couche, mais le vernis atteint sa dureté finale après environ 7 jours — c’est à ce moment qu’on replace les tapis et les meubles lourds. Le sablage se fait à longueur d’année, même si le printemps et l’automne restent les périodes idéales à Montréal puisque le taux d’humidité y est plus modéré.",
        },
        {
          heading: 'Une soumission avant de vous engager',
          body: "Tout commence par une évaluation gratuite : nous venons constater l’état réel de vos planchers et établissons un plan de travail adapté à votre pièce. Vous recevez ensuite une soumission détaillée, sans engagement. Vous pouvez accélérer les choses en remplissant le formulaire ci-dessous avec la superficie approximative et quelques photos de votre plancher.",
        },
      ],
      relatedHeading: 'Nos autres services',
    },
    en: {
      h1: 'Hardwood Floor Sanding in Montreal',
      lead: 'Over the years, a hardwood floor takes a beating: scratches from chair legs, worn traffic paths in hallways, stains near entryways, varnish that dulls and peels. Sanding is what lets you start over — we remove the worn finish along with a thin layer of wood, which makes scratches and imperfections disappear and returns the floor to its original surface. TALON PLANCHER offers this service in Montreal, on the South Shore and on the North Shore.',
      sections: [
        {
          heading: 'What a complete sanding includes',
          body: 'The work is done in several successive passes, from the coarsest grit to the finest, until the surface is perfectly smooth. Corners and edges — where a rushed job shows the most — are worked separately so the result is uniform from wall to wall. Before we start, we protect the walls and adjacent areas; on your end, you simply need to clear the furniture and objects out of the room.',
        },
        {
          heading: 'Stain and finish',
          body: 'Once the wood is bare, you can keep its natural colour or apply a stain. This is the best moment to change your floor colour: oak, maple, birch and parquet each react differently to stain, and we discuss it with you before application. Then comes the protective varnish, which determines how the floor holds up day to day. Our products are low-VOC; a slight odour can linger for a few days and good ventilation is enough to clear it.',
        },
        {
          heading: 'How long it takes',
          body: 'Generally count on 2 to 4 days, depending on the area and the condition of the floor. That includes drying time between varnish coats, which cannot be rushed without compromising the result. You can walk gently on the floor about 24 hours after the last coat, but the varnish reaches full hardness after roughly 7 days — that is when rugs and heavy furniture go back. Sanding can be done year-round, though spring and fall remain ideal in Montreal since humidity is more moderate.',
        },
        {
          heading: 'A quote before you commit',
          body: 'It all starts with a free assessment: we come see the actual condition of your floors and put together a work plan suited to your room. You then receive a detailed quote, with no obligation. You can speed things up by filling out the form below with the approximate square footage and a few photos of your floor.',
        },
      ],
      relatedHeading: 'Our other services',
    },
  },

  stairs: {
    fr: {
      h1: "Sablage d’escalier en bois à Montréal",
      lead: "Un escalier de bois est la surface la plus sollicitée d’une maison : chaque marche reçoit le poids de tous les allers-retours de la journée, et le nez des marches s’use bien avant le reste. Le sablage d’escalier redonne au bois son apparence d’origine, mais c’est un travail très différent de celui d’un plancher — il se fait en grande partie à la main, pièce par pièce.",
      sections: [
        {
          heading: "Pourquoi un escalier demande plus de travail qu’un plancher",
          body: "Sur un plancher, la ponceuse couvre de grandes surfaces d’un seul passage. Un escalier, lui, est un assemblage de pièces qui doivent toutes être traitées séparément : les marches, les contremarches, les limons et faux limons, les poteaux, les barreaux et la main courante. Chacune a sa forme, ses angles et ses arêtes, et aucune ne se sable de la même façon. C’est pourquoi notre soumission pour un escalier se base sur le décompte de ces éléments plutôt que sur une superficie — vous les retrouverez dans le formulaire ci-dessous.",
        },
        {
          heading: 'Harmoniser votre escalier avec vos planchers',
          body: "La plupart du temps, un escalier n’est pas sablé seul : il donne sur un plancher de bois franc à l’étage, au rez-de-chaussée, ou les deux. Nous ajustons la teinture et la finition pour que la transition entre les deux ne saute pas aux yeux. Si vous faites sabler vos planchers et votre escalier en même temps, c’est le moment le plus simple pour obtenir une teinte parfaitement identique.",
        },
        {
          heading: 'Finition antidérapante',
          body: "Un escalier fraîchement verni peut être glissant, surtout en bas de laine. Une finition antidérapante est disponible sur demande : elle ajoute de l’adhérence à la surface des marches sans changer l’apparence du bois. C’est une option à considérer si vous avez de jeunes enfants, des personnes âgées à la maison ou un animal.",
        },
        {
          heading: 'À quoi vous attendre',
          body: "Comme pour un plancher, tout commence par une évaluation gratuite sur place. Nous protégeons les zones adjacentes avant de commencer et nous vous indiquons pendant combien de temps l’escalier sera inutilisable — un point à planifier d’avance quand c’est le seul accès à l’étage. Les produits que nous appliquons sont à faible émission de COV, et le vernis atteint sa dureté finale après environ 7 jours.",
        },
      ],
      relatedHeading: 'Nos autres services',
    },
    en: {
      h1: 'Wood Stair Sanding in Montreal',
      lead: 'A wooden staircase is the hardest-working surface in a house: every step carries the weight of the whole day’s back-and-forth, and the stair nosings wear out long before the rest. Stair sanding brings the wood back to its original appearance, but it is very different work from a floor — it is largely done by hand, piece by piece.',
      sections: [
        {
          heading: 'Why stairs take more work than a floor',
          body: 'On a floor, the sander covers large areas in a single pass. A staircase is an assembly of parts that each have to be treated separately: treads, risers, stringers and false stringers, newel posts, balusters and the handrail. Each has its own shape, angles and edges, and none of them sand the same way. That is why our quote for a staircase is based on a count of these elements rather than a square footage — you will find them in the form below.',
        },
        {
          heading: 'Matching your staircase to your floors',
          body: 'Most of the time a staircase is not sanded on its own: it opens onto a hardwood floor upstairs, downstairs, or both. We adjust the stain and finish so the transition between the two does not stand out. If you have your floors and your staircase sanded at the same time, that is the easiest way to get a perfectly identical tone.',
        },
        {
          heading: 'Non-slip finish',
          body: 'A freshly varnished staircase can be slippery, especially in socks. A non-slip finish is available on request: it adds grip to the tread surface without changing the look of the wood. Worth considering if you have young children, older adults at home, or a pet.',
        },
        {
          heading: 'What to expect',
          body: 'As with a floor, it starts with a free on-site assessment. We protect adjacent areas before starting and tell you how long the staircase will be out of service — something to plan ahead for when it is the only access to the upper floor. The products we apply are low-VOC, and the varnish reaches full hardness after roughly 7 days.',
        },
      ],
      relatedHeading: 'Our other services',
    },
  },

  repair: {
    fr: {
      h1: 'Réparation de plancher de bois franc à Montréal',
      lead: "Le sablage règle l’usure de surface, mais il ne répare pas un plancher abîmé en profondeur. Une latte fendue, une planche gondolée par un dégât d’eau ou un joint qui s’est ouvert restera visible — et parfois empirera — si on se contente de sabler par-dessus. C’est pourquoi la réparation vient toujours avant le sablage.",
      sections: [
        {
          heading: 'Ce que nous réparons',
          body: "Nous remplaçons les lattes endommagées, corrigeons les planches gondolées et réparons les joints et les fissures. Le principe reste le même dans tous les cas : retirer la section problématique sans abîmer les planches voisines, insérer du bois de même essence et de même épaisseur, puis intégrer la réparation au reste du plancher. Une fois le sablage et la finition faits par-dessus, une réparation bien exécutée devient difficile à repérer.",
        },
        {
          heading: 'Trouver du bois qui s’agence',
          body: "La partie délicate d’une réparation n’est pas de retirer la vieille planche, c’est de trouver la bonne pour la remplacer. L’essence, la largeur des lattes et le sens du grain doivent correspondre. Sur un plancher plus ancien, il arrive que le format d’origine ne se fabrique plus; nous en discutons alors avec vous et évaluons les options avant d’aller de l’avant. Des photos de la zone abîmée nous aident énormément à évaluer ça rapidement — vous pouvez les joindre directement à votre demande de soumission.",
        },
        {
          heading: 'Réparer ou remplacer?',
          body: "Tous les planchers ne peuvent pas être sauvés, et tous n’ont pas besoin de l’être. Un plancher de bois franc ne peut être sablé qu’un nombre limité de fois avant que l’épaisseur restante ne le permette plus, et un dégât d’eau étendu peut avoir déformé le sous-plancher, pas seulement la surface. L’évaluation gratuite sert exactement à ça : vous dire ce qui vaut la peine d’être réparé et ce qui ne l’est pas, avant que vous ayez dépensé quoi que ce soit.",
        },
        {
          heading: 'Comment obtenir une soumission',
          body: "Remplissez le formulaire ci-dessous en décrivant les dommages et en joignant des photos. Plus votre description est précise — nombre de lattes touchées, cause du dommage si vous la connaissez, âge approximatif du plancher — plus notre estimation sera juste. La soumission est gratuite et sans engagement.",
        },
      ],
      relatedHeading: 'Nos autres services',
    },
    en: {
      h1: 'Hardwood Floor Repair in Montreal',
      lead: 'Sanding fixes surface wear, but it does not repair a floor that is damaged deeper down. A split board, a plank warped by water damage, or a joint that has opened up will still be visible — and sometimes worse — if you simply sand over it. That is why repairs always come before sanding.',
      sections: [
        {
          heading: 'What we repair',
          body: 'We replace damaged boards, correct warped planks, and repair joints and cracks. The principle is the same in every case: remove the problem section without damaging the neighbouring boards, fit in wood of the same species and thickness, then blend the repair into the rest of the floor. Once sanded and finished over, a well-executed repair becomes hard to spot.',
        },
        {
          heading: 'Finding wood that matches',
          body: 'The tricky part of a repair is not pulling out the old board, it is finding the right one to replace it. The species, board width and grain direction all have to match. On an older floor, the original format is sometimes no longer manufactured; we discuss that with you and weigh the options before moving ahead. Photos of the damaged area help us assess this quickly — you can attach them directly to your quote request.',
        },
        {
          heading: 'Repair or replace?',
          body: 'Not every floor can be saved, and not every floor needs to be. A hardwood floor can only be sanded a limited number of times before the remaining thickness no longer allows it, and extensive water damage may have deformed the subfloor, not just the surface. That is exactly what the free assessment is for: telling you what is worth repairing and what is not, before you have spent anything.',
        },
        {
          heading: 'How to get a quote',
          body: 'Fill out the form below describing the damage and attaching photos. The more precise your description — how many boards are affected, the cause of the damage if you know it, the approximate age of the floor — the more accurate our estimate will be. The quote is free and carries no obligation.',
        },
      ],
      relatedHeading: 'Our other services',
    },
  },
};
