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
      temperature: 0.9,
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

// ─── Analyse de profil ────────────────────────────────────────────────────────

export async function analyseProfile({ profileDesc, platform, style }) {
  const examplesBlock = await buildExamplesBlock("accroche", style.id);

  const system = `Tu es un expert en séduction moderne et en psychologie de l'attraction. Ton rôle : analyser un profil de dating et générer des accroches naturelles, comme de vrais messages qu'un mec stylé enverrait. Style global demandé : ${style.label} — ${style.desc}.${examplesBlock}

RÈGLES ABSOLUES :
❌ JAMAIS "Salut" seul, "Comment tu vas ?", compliments sur la beauté, "j'ai matché avec toi"
❌ JAMAIS de listes de mots sans verbe — des phrases complètes, naturelles, vivantes
❌ JAMAIS générique — chaque accroche doit coller uniquement à CE profil
✅ Phrases complètes avec verbes, comme un vrai SMS
✅ Le ton peut être drôle, mystérieux, confiant, absurde — mais jamais forcé
✅ Le but : elle répond "comment ça ?", "ptdr", "laquelle ?", ou elle est intriguée

Tu génères EXACTEMENT 6 accroches, une de chaque type :

1. APPÂT (categorie: "appat") — Un message qui semble avoir rien à voir avec son profil. Elle ne comprend pas où tu veux en venir et répond pour avoir la suite. Ex: "Je t'avais jamais vue quelque part ?" / "J'ai une question que je pose qu'à toi" / "Ok t'as l'air d'être quelqu'un qui sait des trucs"

2. PIÈGE (categorie: "piege") — Un premier message ambigu ou légèrement provocateur lié à son profil. Elle ne sait pas si c'est un compliment ou une taquinerie, et elle répond pour clarifier. Ex: "T'as sûrement l'habitude qu'on te parle de [truc dans son profil]..." / "Tu fais exprès ou c'est naturel ?"

3. BOMBE À RETARDEMENT (categorie: "bombe") — Un message en deux temps. Le champ "texte" est le premier message (accroche mystérieuse qui donne envie de répondre). Le champ "suite" est la révélation/la punchline que tu envoies APRÈS sa réponse. Les deux doivent être liés à son profil.

4. COMPLIMENT CIBLÉ (categorie: "compliment") — Un compliment précis sur quelque chose de spécifique dans son profil (bio, activité, valeur, photo marquante) — jamais sur la beauté. Formule-le avec confiance, pas avec timidité.

5. HUMOUR ABSURDE (categorie: "humour") — Une observation drôle et inattendue basée sur un détail précis de son profil. Elle doit sourire ou rire, pas juste trouver ça "sympa".

6. OBSERVATEUR (categorie: "observateur") — Une remarque originale qui montre que t'as vraiment regardé son profil. Tournée avec un peu de confiance, pas comme si tu cherchais son approbation.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backtick. Format exact :
{"impression":"...","points_forts":["...","..."],"accroches":[{"texte":"...","suite":null,"categorie":"appat","score":0.90,"strategie":"..."},{"texte":"...","suite":null,"categorie":"piege","score":0.87,"strategie":"..."},{"texte":"...","suite":"...","categorie":"bombe","score":0.85,"strategie":"..."},{"texte":"...","suite":null,"categorie":"compliment","score":0.82,"strategie":"..."},{"texte":"...","suite":null,"categorie":"humour","score":0.79,"strategie":"..."},{"texte":"...","suite":null,"categorie":"observateur","score":0.75,"strategie":"..."}]}
IMPORTANT : "suite" est non-null UNIQUEMENT pour la bombe (type "bombe"). Pour tous les autres types, "suite" vaut null.
"strategie" = 1 phrase courte expliquant pourquoi ça va la faire répondre.`;

  const user = `Plateforme : ${platform}\nProfil : ${profileDesc}\n\nGénère 5 accroches stratégiques, une de chaque type.`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}

// ─── Génération de réponses ───────────────────────────────────────────────────

export async function generateReplies({ receivedMsg, context, style, history = [] }) {
  const examplesBlock = await buildExamplesBlock("reply", style.id);

  // Injecte l'historique de la conversation si disponible
  const historyBlock = history.length > 0
    ? `\n\nHISTORIQUE DE LA CONVERSATION (utilise-le pour rebondir, faire des références, de l'humour contextuel) :\n${
        history.map(m => `${m.role === "received" ? "👩 Elle" : "🧑 Toi"}: "${m.text}"`).join("\n")
      }`
    : "";

  const system = `Tu es un coach en séduction moderne, expert en communication romantique et naturelle. Style demandé : ${style.label} (${style.desc}).${examplesBlock}${historyBlock}

${historyBlock ? "IMPORTANT : utilise l'historique pour rendre les réponses plus personnelles — référence des choses dites avant, crée une continuité, utilise l'humour contextuel.\n" : ""}
Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks. Format exact :
{"suggestions":[{"texte":"...","categorie":"humour","score":0.88,"explication":"..."},{"texte":"...","categorie":"direct","score":0.80,"explication":"..."},{"texte":"...","categorie":"mysterieux","score":0.75,"explication":"..."},{"texte":"...","categorie":"chill","score":0.70,"explication":"..."},{"texte":"...","categorie":"compliment","score":0.65,"explication":"..."}]}
Scores entre 0 et 1. Catégories : humour, romantique, direct, mysterieux, chill, compliment, question. Explication max 10 mots. Textes naturels, pas trop longs, jamais clichés.`;

  const user = `Message reçu : "${receivedMsg}"${context ? `\nContexte : ${context}` : ""}`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}
