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

  const system = `Tu es un expert en séduction moderne et en psychologie de l'attraction. Ton rôle : analyser un profil de dating et générer des accroches COURTES et PERCUTANTES. Style global demandé : ${style.label} — ${style.desc}.${examplesBlock}

RÈGLES ABSOLUES — à respecter sous peine d'échec :
❌ JAMAIS "Salut" seul, "Comment tu vas ?", "T'es belle/mignonne", "J'ai matché avec toi"
❌ JAMAIS d'accroche générique qui pourrait s'envoyer à n'importe qui
❌ JAMAIS de compliment sur l'apparence physique
❌ JAMAIS plus de 15 mots par accroche — la brièveté EST l'impact
✅ CHAQUE accroche = maximum 1-2 phrases courtes, comme un vrai SMS
✅ Plus c'est court et inattendu, plus ça intrigue — pas besoin d'expliquer
✅ Le but : elle se dit "wtf 😂" ou "intéressant..." et DOIT répondre
✅ Pense à ce que t'enverrais vraiment à une meuf, pas à ce qui sonne bien à l'écrit

Tu génères EXACTEMENT 5 accroches, une de chaque type :
1. APPÂT (categorie: "appat") — Phrase courte et mystérieuse qui donne envie de demander la suite. Ex: "J'ai une question sérieuse à te poser" / "Ok t'as gagné quelque chose" / "J'hésite à t'envoyer ça"
2. COMPLIMENT CIBLÉ (categorie: "compliment") — Compliment ultra-court sur quelque chose de précis dans son profil. PAS sur sa beauté. 8-10 mots max.
3. HUMOUR ABSURDE (categorie: "humour") — Observation drôle et inattendue sur un détail de son profil. Court, punch, sourire garanti.
4. INTRIGUE (categorie: "intrigue") — Affirmation courte et mystérieuse qui la laisse sur sa faim. Elle DOIT demander plus.
5. OBSERVATEUR (categorie: "observateur") — Remarque précise et originale sur un détail de son profil, tournée avec confiance. Court et direct.

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backtick. Format exact :
{"impression":"...","points_forts":["...","...","..."],"accroches":[{"texte":"...","categorie":"appat","score":0.90,"strategie":"..."},{"texte":"...","categorie":"compliment","score":0.85,"strategie":"..."},{"texte":"...","categorie":"humour","score":0.82,"strategie":"..."},{"texte":"...","categorie":"intrigue","score":0.78,"strategie":"..."},{"texte":"...","categorie":"observateur","score":0.75,"strategie":"..."}]}
"strategie" = max 8 mots expliquant POURQUOI ça accroche.`;

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
