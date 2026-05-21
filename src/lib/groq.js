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

  const system = `Tu es un expert en séduction moderne et en psychologie de l'attraction. Ton rôle : analyser un profil de dating et générer des accroches qui font QUE la fille VA répondre. Style global demandé : ${style.label} — ${style.desc}.${examplesBlock}

RÈGLES ABSOLUES — à respecter sous peine d'échec :
❌ JAMAIS "Salut" seul, "Comment tu vas ?", "T'es belle/mignonne", "J'ai matché avec toi"
❌ JAMAIS d'accroche générique qui pourrait s'envoyer à n'importe qui
❌ JAMAIS de compliment sur l'apparence physique
✅ CHAQUE accroche doit être unique à CE profil spécifique
✅ Le but : elle se dit "wow, il a vraiment lu mon profil" ou "ptdr qu'est-ce que c'est"
✅ Elle doit AVOIR ENVIE de répondre — curiosité, sourire, intérêt

Tu génères EXACTEMENT 5 accroches, une de chaque type :
1. APPÂT (categorie: "appat") — Un message qui semble avoir rien à voir, une affirmation bizarre ou drôle qui la pousse à demander des précisions. Ex: "Ok j'ai une question qui change une vie" → elle demande "laquelle ?" → tu enchaînes la diskette
2. COMPLIMENT CIBLÉ (categorie: "compliment") — Compliment ultra-précis sur son profil (bio, photo, activité, valeur) — PAS sur sa beauté
3. HUMOUR ABSURDE (categorie: "humour") — Blague ou observation absurde et créative basée sur un détail spécifique de son profil
4. INTRIGUE (categorie: "intrigue") — Affirmation mystérieuse ou question ouverte qui donne envie de creuser. Elle doit se demander "mais pourquoi il dit ça ?"
5. OBSERVATEUR (categorie: "observateur") — Une remarque précise et originale qui montre que t'as vraiment regardé son profil, avec une petite touche de confiance

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backtick. Format exact :
{"impression":"...","points_forts":["...","...","..."],"accroches":[{"texte":"...","categorie":"appat","score":0.90,"strategie":"..."},{"texte":"...","categorie":"compliment","score":0.85,"strategie":"..."},{"texte":"...","categorie":"humour","score":0.82,"strategie":"..."},{"texte":"...","categorie":"intrigue","score":0.78,"strategie":"..."},{"texte":"...","categorie":"observateur","score":0.75,"strategie":"..."}]}
"strategie" = 1 phrase courte expliquant POURQUOI ça va marcher sur elle.`;

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
