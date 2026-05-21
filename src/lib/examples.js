/**
 * examples.js — La "mémoire" de RizzAI
 *
 * Les exemples sont stockés dans data/examples.json (via le serveur Express).
 * Ils sont injectés dans chaque prompt (few-shot learning) pour que le
 * modèle s'adapte à TON style.
 *
 * Format d'un exemple :
 * {
 *   id: string,           // identifiant unique
 *   type: "accroche" | "reply",
 *   context: string,      // description du profil ou message reçu
 *   response: string,     // la réponse qui a bien marché
 *   style: string,        // style utilisé (humour, direct...)
 *   rating: number,       // 1-5 étoiles
 *   note: string,         // optionnel
 *   createdAt: string,    // date ISO
 * }
 */

// ── Lecture (async) ──────────────────────────────────────────────────────────

export async function getExamples() {
  try {
    const res = await fetch("/api/examples");
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

// ── Écriture (async) ─────────────────────────────────────────────────────────

export async function saveExample(example) {
  try {
    const res = await fetch("/api/examples", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(example),
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

export async function deleteExample(id) {
  try {
    const res = await fetch(`/api/examples/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch {
    return [];
  }
}

// ── Sélection pour le prompt ─────────────────────────────────────────────────

export async function getExamplesForPrompt(type, style, limit = 4) {
  const all = await getExamples();
  return all
    .filter(e => e.type === type)
    .sort((a, b) => {
      const styleBonus = x => (x.style === style ? 10 : 0);
      return b.rating + styleBonus(b) - (a.rating + styleBonus(a));
    })
    .slice(0, limit);
}
