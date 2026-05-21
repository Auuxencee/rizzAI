// curatedExamples.js — Base d'exemples haute qualité tirée de Texting Academy
// Ces exemples servent de baseline dans chaque prompt IA, en complément
// des exemples personnels sauvegardés par l'utilisateur (👍/👎).

export const CURATED = [

  // ─── ACCROCHES ────────────────────────────────────────────────────────────────

  {
    type: "accroche", style: "humour", rating: 5,
    context: "Profil avec lunettes, air intello ou métier sérieux",
    response: "Toi à tous les coups t'es avocate, les petites lunettes d'intello ne mentent jamais. Mais une question persiste… Tu défends les méchants ou les gentils ?",
  },
  {
    type: "accroche", style: "humour", rating: 5,
    context: "Profil avec un chien ou un chat",
    response: "Ton chien a clairement l'air plus intelligent que moi.",
  },
  {
    type: "accroche", style: "humour", rating: 5,
    context: "Profil avec chat",
    response: "Je sens que je vais devoir passer un entretien avec ton chat.",
  },
  {
    type: "accroche", style: "humour", rating: 5,
    context: "Photos de randonnée, sport extrême, ou activité physique intense",
    response: "Ok, soit tu es très disciplinée, soit tu caches un côté masochiste.",
  },
  {
    type: "accroche", style: "humour", rating: 5,
    context: "Second match ou ancienne conversation reprise",
    response: "Bon, deuxième fois qu'on matche… tu me dois une bague de fiançailles.",
  },
  {
    type: "accroche", style: "humour", rating: 5,
    context: "Profil avec tatouage visible sur la photo",
    response: "Je vois que tu as mon prénom tatoué sur l'avant-bras. Ça va un peu vite non ?",
  },
  {
    type: "accroche", style: "humour", rating: 5,
    context: "Profil avec mention de musique ou playlist",
    response: "Je sens un débat musical très intense arriver.",
  },
  {
    type: "accroche", style: "humour", rating: 4,
    context: "Profil général, rien de particulier",
    response: "Défi lancé : qui fait rire l'autre en premier ?",
  },
  {
    type: "accroche", style: "humour", rating: 4,
    context: "Profil foodie ou mention de cuisine, restos",
    response: "Je ne partage pas facilement les frites.",
  },
  {
    type: "accroche", style: "mysterieux", rating: 5,
    context: "Profil avec bio vague ou mystérieuse",
    response: "Tu as l'air beaucoup trop mystérieuse pour ne pas être agente secrète.",
  },
  {
    type: "accroche", style: "mysterieux", rating: 5,
    context: "Profil avec beau sourire",
    response: "Ce sourire cache forcément quelque chose.",
  },
  {
    type: "accroche", style: "mysterieux", rating: 5,
    context: "Profil voyageur avec photos dans plusieurs pays",
    response: "Tu as clairement une vie parallèle dans un autre pays.",
  },
  {
    type: "accroche", style: "chill", rating: 5,
    context: "Profil avec photos de soirées, bars, bonne ambiance",
    response: "On dirait quelqu'un qui transforme un verre en aventure.",
  },
  {
    type: "accroche", style: "chill", rating: 5,
    context: "Match général, ambiance détendue",
    response: "Je sens qu'on rigolerait pour des trucs inutiles.",
  },
  {
    type: "accroche", style: "direct", rating: 5,
    context: "Profil avec quelque chose qui sort du lot, énergie particulière",
    response: "Ton profil dégage vraiment quelque chose. J'arrive pas à définir quoi, c'est louche.",
  },
  {
    type: "accroche", style: "disketteur", rating: 5,
    context: "Profil avec beau sourire ou photo marquante",
    response: "Je sens que tu es une très mauvaise influence. Je matche quand même.",
  },
  {
    type: "accroche", style: "disketteur", rating: 5,
    context: "Profil général, ambiance positive",
    response: "Je te vois bien me faire découvrir des endroits beaucoup trop bons.",
  },
  {
    type: "accroche", style: "romantique", rating: 4,
    context: "Profil sincère, bio authentique",
    response: "Ta description m'a vraiment intrigué — c'est rare quelqu'un d'aussi direct sur ce qu'il cherche.",
  },

  // ─── RÉPONSES / CONVERSATION ──────────────────────────────────────────────────

  {
    type: "reply", style: "humour", rating: 5,
    context: "Message reçu: 'Salut ça va ?'",
    response: "Ça va très bien, madame l'agent. D'autres questions ?",
  },
  {
    type: "reply", style: "humour", rating: 5,
    context: "Relance après un silence, profil avec chat",
    response: "Alors, ton chat a encore gagné la bataille du canapé ?",
  },
  {
    type: "reply", style: "humour", rating: 5,
    context: "Relance après silence, message absurde pour briser la glace",
    response: "Je viens de voir un écureuil faire du skateboard. Il m'a dit de te passer le bonjour.",
  },
  {
    type: "reply", style: "humour", rating: 5,
    context: "Relance légère après silence",
    response: "Information importante : les loutres se tiennent la main en dormant. Voilà.",
  },
  {
    type: "reply", style: "humour", rating: 5,
    context: "Elle parle de cuisine ou de food",
    response: "Je te crois pas. J'exige une preuve par dégustation. Par contre, si c'est trop bon, je reste dîner, tant pis pour toi.",
  },
  {
    type: "reply", style: "humour", rating: 5,
    context: "Conversation qui avance bien, l'ambiance est bonne",
    response: "Je commence à croire que c'est toi qui me dragues, là. Continue comme ça, je vais prendre des notes pour ma prochaine masterclass.",
  },
  {
    type: "reply", style: "humour", rating: 5,
    context: "Elle contredit ou debate pour le plaisir",
    response: "Je sens que tu serais du genre à contredire juste pour le sport. C'est ton côté rebelle ou tu aimes juste me voir galérer ?",
  },
  {
    type: "reply", style: "humour", rating: 4,
    context: "Relance douce après silence",
    response: "J'hésite entre sauver le monde ou faire une sieste. Ton avis compte.",
  },
  {
    type: "reply", style: "humour", rating: 4,
    context: "Conversation légère, pour la relancer avec une question absurde",
    response: "Question sérieuse : si on te propose une téléportation immédiate, tu vas où ?",
  },
  {
    type: "reply", style: "direct", rating: 5,
    context: "Conversation qui se passe bien, pour proposer un vrai rendez-vous",
    response: "On parle bien. Mais j'ai une règle : quand la conversation devient trop cool, je propose toujours un café pour vérifier si la magie opère en vrai.",
  },
  {
    type: "reply", style: "direct", rating: 5,
    context: "Relance finale, avant de quitter l'application",
    response: "Petit message avant de disparaître : je vais bientôt quitter Tinder. Tu fais partie des rares profils avec qui j'aurais bien continué à discuter. Si ça te dit, on peut passer sur Insta.",
  },
  {
    type: "reply", style: "direct", rating: 4,
    context: "Elle répond peu ou avec peu d'effort",
    response: "Alors comme ça, on me matche et on ne commence pas la conversation ?",
  },
  {
    type: "reply", style: "chill", rating: 5,
    context: "Elle parle de ses spots ou adresses favorites",
    response: "On ira tester ton spot préféré alors. Mais je te préviens : si le cappuccino est nul, je demande un remboursement en fous rires.",
  },
  {
    type: "reply", style: "chill", rating: 5,
    context: "Elle parle de voyages ou d'aventure",
    response: "Imagine, un week-end sans plan, juste toi, moi et une carte mal pliée. Tu penses qu'on finirait perdus ou déjà en train de se disputer ?",
  },
  {
    type: "reply", style: "chill", rating: 5,
    context: "Ambiance bonne, conversation qui roule",
    response: "Je crois qu'on tient un bon rythme là. Si on continue comme ça, je vais devoir te proposer un café juste pour vérifier si t'es aussi marrante en vrai.",
  },
  {
    type: "reply", style: "chill", rating: 4,
    context: "Relance détendue après un silence",
    response: "J'ai besoin d'un avis neutre : croissant ou pain au chocolat ?",
  },
  {
    type: "reply", style: "romantique", rating: 5,
    context: "Conversation légère, ambiance positive",
    response: "Ton sourire donne envie de faire des bêtises juste pour le revoir.",
  },
  {
    type: "reply", style: "romantique", rating: 5,
    context: "Elle parle de ses passions, de ce qui la fait vibrer",
    response: "Ok mais entre tout ça, tu fais quoi pour toi ? Genre le truc qui te calme, te vide la tête.",
  },
  {
    type: "reply", style: "romantique", rating: 4,
    context: "Relance sincère après silence, quand on a rien de drôle à dire",
    response: "J'ai pas trouvé de punchline, mais j'avais juste envie de te parler.",
  },
  {
    type: "reply", style: "mysterieux", rating: 5,
    context: "Elle parle de son travail ou d'une passion",
    response: "J'essaie toujours de décider si t'as plus un regard d'ange ou de fille qui prépare un coup tordu.",
  },
  {
    type: "reply", style: "disketteur", rating: 5,
    context: "Conversation en cours, pour poser une disquette naturelle",
    response: "Je sens que tu es une très mauvaise influence pour mon emploi du temps.",
  },
  {
    type: "reply", style: "disketteur", rating: 5,
    context: "Elle a mentionné une activité ou un endroit qu'elle aime",
    response: "Je te vois bien me faire découvrir des endroits où on finit par rester deux heures de trop.",
  },
];

/**
 * Retourne des exemples curatés filtrés par type et style.
 * Si pas assez de match sur le style, complète avec d'autres styles du même type.
 * @param {string} type - "accroche" | "reply"
 * @param {string} styleId - id du style sélectionné
 * @param {number} limit - nombre d'exemples à retourner
 */
export function getCuratedExamples(type, styleId, limit = 3) {
  const sameStyle = CURATED.filter(e => e.type === type && e.style === styleId);
  const otherStyle = CURATED.filter(e => e.type === type && e.style !== styleId);

  // Mélange léger pour varier entre les sessions
  const shuffle = arr => [...arr].sort(() => Math.random() - 0.5);

  const pool = [...shuffle(sameStyle), ...shuffle(otherStyle)];
  return pool.slice(0, limit);
}
