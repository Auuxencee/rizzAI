/**
 * examples.js — La "mémoire" de RizzAI
 *
 * C'est ici que tu stockes les échanges qui ont bien marché.
 * Ces exemples sont injectés dans chaque prompt (few-shot learning)
 * pour que le modèle s'adapte à TON style.
 *
 * Comment ajouter un exemple qui a marché ?
 *   1. Va dans l'onglet "Entraîner" de l'app
 *   2. Remplis le formulaire → clique "Sauvegarder"
 *   3. L'exemple est ajouté ici automatiquement (localStorage)
 *
 * Format d'un exemple :
 * {
 *   id: string,           // identifiant unique
 *   type: "accroche" | "reply",
 *   context: string,      // description du profil ou message reçu
 *   response: string,     // la réponse qui a bien marché
 *   style: string,        // style utilisé (humour, direct...)
 *   rating: number,       // 1-5 étoiles (à quel point ça a marché)
 *   note: string,         // optionnel : ce qui a bien marché
 *   createdAt: string,    // date ISO
 * }
 */

const STORAGE_KEY = "rizzai_examples";

export function getExamples() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : getDefaultExamples();
  } catch {
    return getDefaultExamples();
  }
}

export function saveExample(example) {
  const examples = getExamples();
  const newExample = {
    ...example,
    id: `ex_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [newExample, ...examples];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deleteExample(id) {
  const examples = getExamples().filter(e => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
  return examples;
}

export function getExamplesForPrompt(type, style, limit = 4) {
  const all = getExamples();
  return all
    .filter(e => e.type === type)
    .sort((a, b) => {
      // Priorité : même style > meilleure note > plus récent
      const styleBonus = (x) => x.style === style ? 10 : 0;
      return (b.rating + styleBonus(b)) - (a.rating + styleBonus(a));
    })
    .slice(0, limit);
}

// Quelques exemples par défaut pour démarrer
function getDefaultExamples() {
  return [
    {
      id: "default_1",
      type: "accroche",
      context: "Léa, 24 ans. Bio: accro au café et aux randos. Photos en montagne avec son chien.",
      response: "T'as l'air du genre à gravir des sommets juste pour avoir une meilleure vue sur le prochain café 😄 C'est quoi ta montagne préférée ?",
      style: "humour",
      rating: 5,
      note: "Elle a répondu direct et on a parlé 2h",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "default_2",
      type: "reply",
      context: "Message reçu: 'Salut, tu fais quoi dans la vie ?'",
      response: "Je suis en cybersécurité — donc officiellement je protège les gens, officieusement je suis le gars qu'on appelle quand quelqu'un a cliqué sur 'vous avez gagné un iPhone' 😅 Et toi ?",
      style: "humour",
      rating: 4,
      note: "Brise-glace efficace, elle a ri",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "default_3",
      type: "reply",
      context: "Message reçu: 'C'est quoi ton film préféré ?'",
      response: "Difficile de choisir entre Interstellar et Parasite... Un dans les étoiles, l'autre dans les tréfonds — t'aurais cru que j'avais ce genre de contradictions ? 🌌 Et toi ?",
      style: "mysterieux",
      rating: 4,
      note: "A lancé une vraie conversation",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  ];
}
