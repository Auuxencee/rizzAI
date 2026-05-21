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
      max_tokens: 1000,
      temperature: 0.85,
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

  const system = `Tu es un expert en séduction moderne, drôle et bienveillant. Tu analyses des profils de dating pour générer des accroches percutantes et personnalisées. Style demandé : ${style.label} (${style.desc}).${examplesBlock}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks. Format exact :
{"impression":"...","points_forts":["...","...","..."],"accroches":[{"texte":"...","categorie":"humour","score":0.85},{"texte":"...","categorie":"romantique","score":0.72}]}
Scores entre 0 et 1. 3 à 4 accroches variées, originales, jamais génériques. Adapte-toi précisément aux infos du profil.`;

  const user = `Plateforme : ${platform}\nProfil : ${profileDesc}\n\nGénère des accroches percutantes et personnalisées.`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}

// ─── Génération de réponses ───────────────────────────────────────────────────

export async function generateReplies({ receivedMsg, context, style }) {
  const examplesBlock = await buildExamplesBlock("reply", style.id);

  const system = `Tu es un coach en séduction moderne, expert en communication romantique et naturelle. Style demandé : ${style.label} (${style.desc}).${examplesBlock}

Réponds UNIQUEMENT en JSON valide, sans markdown, sans backticks. Format exact :
{"suggestions":[{"texte":"...","categorie":"humour","score":0.88,"explication":"..."},{"texte":"...","categorie":"romantique","score":0.75,"explication":"..."},{"texte":"...","categorie":"direct","score":0.70,"explication":"..."},{"texte":"...","categorie":"mysterieux","score":0.65,"explication":"..."},{"texte":"...","categorie":"chill","score":0.60,"explication":"..."}]}
Scores entre 0 et 1. Catégories : humour, romantique, direct, mysterieux, chill, compliment, question. Explication max 10 mots. Textes naturels, pas trop longs, jamais clichés.`;

  const user = `Message reçu : "${receivedMsg}"${context ? `\nContexte : ${context}` : ""}`;

  const text = await callGroq(system, user);
  return parseJSON(text);
}
