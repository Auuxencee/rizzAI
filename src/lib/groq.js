import { getExamplesForPrompt } from "./examples.js";

const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

function getApiKey() {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key || key === "gsk_COLLE_TA_CLE_ICI") {
    throw new Error("Clé API Groq manquante. Ajoute VITE_GROQ_API_KEY dans ton .env");
  }
  return key;
}

async function callGroq(systemPrompt, userPrompt) {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${getApiKey()}`,
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1200,
      temperature: 0.92,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user",   content: userPrompt },
      ],
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.choices?.[0]?.message?.content || "";
}

function parseJSON(text) {
  const clean = text.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

async function buildExamplesBlock(type, style) {
  const examples = await getExamplesForPrompt(type, style, 4);
  if (examples.length === 0) return "";
  const lines = examples.map(e =>
    `- Contexte: "${e.context}"\n  Réponse gagnante (${e.rating}⭐): "${e.response}"`
  );
  return `\n\nEXEMPLES QUI ONT BIEN MARCHÉ (inspire-toi de ce style) :\n${lines.join("\n")}`;
}

// Description de style enrichie pour le prompt
function styleInstruction(style) {
  if (style.id === "disketteur") {
    return `Style DISKETTEUR : tu es un maître de la disquette. Chaque message est une disquette fluide, charmante et assurée. Une disquette c'est un message de drague élégant, jamais lourd, jamais désespéré — ça doit sembler naturel et confiant. Le disketteur sait exactement quoi dire pour faire sourire et intriguer. Pas de blague forcée, pas de compliment bateau — juste du charme bien dosé avec une petite pointe d'audace.`;
  }
  if (style.id === "varie") {
    return `Style VARIÉ : génère 5 réponses dans 5 tons totalement différents — une drôle, une directe et confiante, une mystérieuse, une chaleureuse et sincère, une décontractée. L'objectif est de couvrir tout le spectre pour que l'utilisateur choisisse ce qui lui correspond. Ne reste surtout pas sur un seul registre.`;
  }
  return `Style demandé : ${style.label} — ${style.desc}. Applique ce style à toutes les réponses générées.`;
}

// ─── Analyse de profil ────────────────────────────────────────────────────────

export async function analyseProfile({ profileDesc, platform, style }) {
  const examplesBlock = await buildExamplesBlock("accroche", style.id);
  const styleInstr = styleInstruction(style);

  const disketteurBonus = style.id === "disketteur"
    ? "\nPour le style Disketteur : chaque accroche doit être une disquette bien envoyée — fluide, charmante, avec de l'assurance. Pas de compliment bateau, pas de blague forcée. Pense à ce qu'un mec naturellement séduisant dirait sans réfléchir 30 secondes."
    : "";

  const system = `Tu es un expert en séduction moderne et en psychologie de l'attraction. Ton rôle : analyser un profil de dating et générer des accroches naturelles, comme de vrais messages qu'un mec stylé enverrait. ${styleInstr}${disketteurBonus}${examplesBlock}

RÈGLES ABSOLUES :
❌ JAMAIS "Salut" seul, "Comment tu vas ?", compliments sur la beauté, "j'ai matché avec toi"
❌ JAMAIS de listes de mots sans verbe — des phrases complètes, naturelles, vivantes
❌ JAMAIS générique — chaque accroche doit coller uniquement à CE profil
✅ Phrases complètes avec verbes, comme un vrai SMS
✅ Le ton respecte le style demandé ci-dessus
✅ Le but : elle répond "comment ça ?", "ptdr", "laquelle ?", ou elle est intriguée

Tu génères EXACTEMENT 6 accroches, une de chaque type :

1. APPÂT (categorie: "appat") — Un message qui semble avoir rien à voir avec son profil. Elle ne comprend pas où tu veux en venir et répond pour avoir la suite.

2. PIÈGE (categorie: "piege") — Un premier message ambigu ou légèrement provocateur lié à son profil. Elle ne sait pas si c'est un compliment ou une taquinerie, et elle répond pour clarifier.

3. BOMBE À RETARDEMENT (categorie: "bombe") — Deux temps : "texte" = premier message (mystérieux, donne envie de répondre). "suite" = la révélation/punchline envoyée APRÈS sa réponse. Les deux liés à son profil.

4. COMPLIMENT CIBLÉ (categorie: "compliment") — Un compliment précis sur quelque chose de spécifique dans son profil (bio, activité, valeur, photo) — jamais sur la beauté. Formulé avec confiance.

5. HUMOUR ABSURDE (categorie: "humour") — Une observation drôle et inattendue basée sur un détail précis de son profil.

6. OBSERVATEUR (categorie: "observateur") — Une remarque originale qui montre que t'as vraiment regardé son profil, avec un peu de confiance.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backtick. Format exact :
{"impression":"...","points_forts":["...","..."],"accroches":[{"texte":"...","suite":null,"categorie":"appat","score":0.90,"strategie":"..."},{"texte":"...","suite":null,"categorie":"piege","score":0.87,"strategie":"..."},{"texte":"...","suite":"...","categorie":"bombe","score":0.85,"strategie":"..."},{"texte":"...","suite":null,"categorie":"compliment","score":0.82,"strategie":"..."},{"texte":"...","suite":null,"categorie":"humour","score":0.79,"strategie":"..."},{"texte":"...","suite":null,"categorie":"observateur","score":0.75,"strategie":"..."}]}
"suite" est non-null UNIQUEMENT pour la bombe. "strategie" = 1 phrase courte expliquant pourquoi ça va la faire répondre.`;

  const user = `Plateforme : ${platform}\nProfil : ${profileDesc}\n\nGénère 6 accroches stratégiques, une de chaque type.`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}

// ─── Génération de réponses ───────────────────────────────────────────────────

export async function generateReplies({ receivedMsg, context, style, history = [] }) {
  const examplesBlock = await buildExamplesBlock("reply", style.id);
  const styleInstr = styleInstruction(style);

  const historyBlock = history.length > 0
    ? `\n\nHISTORIQUE DE LA CONVERSATION (utilise-le pour rebondir, faire des références, de l'humour contextuel) :\n${
        history.map(m => `${m.role === "received" ? "👩 Elle" : "🧑 Toi"}: "${m.text}"`).join("\n")
      }`
    : "";

  // Instructions spécifiques selon le style
  const styleSpecific = style.id === "disketteur"
    ? `\nPour chaque réponse : c'est une disquette. Fluide, charmante, assurée. Jamais lourd, jamais désespéré. Le genre de message qui fait sourire et donne envie de répondre. La disquette peut être un compliment bien tourné, une punchline, une affirmation confiante — mais toujours avec de la classe.`
    : style.id === "varie"
    ? `\nGénère 5 réponses dans 5 registres TOTALEMENT différents : 1 drôle/absurde, 1 direct et confiant, 1 mystérieux/intriguant, 1 chaleureux/sincère, 1 décontracté/chill. Chacune doit avoir une vraie personnalité différente.`
    : "";

  const system = `Tu es un coach en séduction moderne, expert en communication romantique et naturelle. ${styleInstr}${styleSpecific}${examplesBlock}${historyBlock}

${historyBlock ? "IMPORTANT : utilise l'historique pour rendre les réponses plus personnelles — référence des choses dites avant, crée une continuité, utilise l'humour contextuel.\n" : ""}
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks. Format exact :
{"suggestions":[{"texte":"...","categorie":"humour","score":0.88,"explication":"..."},{"texte":"...","categorie":"direct","score":0.80,"explication":"..."},{"texte":"...","categorie":"mysterieux","score":0.75,"explication":"..."},{"texte":"...","categorie":"chill","score":0.70,"explication":"..."},{"texte":"...","categorie":"compliment","score":0.65,"explication":"..."}]}
Scores entre 0 et 1. Catégories : humour, romantique, direct, mysterieux, chill, compliment, question. Explication max 10 mots. Textes naturels, pas trop longs, jamais clichés.`;

  const user = `Message reçu : "${receivedMsg}"${context ? `\nContexte : ${context}` : ""}`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}

// ─── Proposition de rencard ───────────────────────────────────────────────────

export async function generateDateProposal({ history = [], style }) {
  const styleInstr = styleInstruction(style);

  const historyBlock = history.length > 0
    ? `\n\nHISTORIQUE DE LA CONVERSATION :\n${
        history.map(m => `${m.role === "received" ? "👩 Elle" : "🧑 Toi"}: "${m.text}"`).join("\n")
      }`
    : "";

  const system = `Tu es un expert en séduction moderne. ${styleInstr}${historyBlock}

Génère 3 façons de proposer un rencard/date en personne. L'objectif : se voir IRL, de façon charmante et confiante.

RÈGLES ABSOLUES :
❌ Jamais suppliant, jamais "est-ce que tu voudrais bien...", jamais générique, jamais trop long
❌ Jamais de point d'interrogation incertain — ça doit sonner comme une évidence, pas une demande
✅ Court, naturel, comme un vrai SMS — max 2 phrases
✅ Confiant sans être arrogant : il propose, pas il mendie
✅ Si la conversation donne des indices (centres d'intérêt, lieu mentionné, blague partagée) → utilise-les pour une proposition contextualisée
✅ L'idée de lieu/activité peut être précise ou ouverte selon le style

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks. Format :
{"propositions":[{"texte":"...","style":"direct","explication":"..."},{"texte":"...","style":"subtil","explication":"..."},{"texte":"...","style":"humour","explication":"..."}]}
Explication = max 8 mots sur pourquoi ça marche.`;

  const user = `Génère 3 propositions de rencard naturelles pour cette conversation.`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}
