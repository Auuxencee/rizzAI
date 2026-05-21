# EXPLANATIONS.md — Documentation technique pour Claude Code

Ce fichier est destiné à être lu par Claude Code pour comprendre le projet avant d'intervenir dessus.

---

## 🎯 C'est quoi ce projet ?

**RizzAI** est une app React qui aide à draguer sur les apps de rencontre (Tinder, Hinge, Instagram).
Elle utilise l'API Groq (Llama 3.3 70B) pour générer des accroches et des réponses personnalisées.
Le système s'améliore au fil du temps grâce à des exemples sauvegardés par l'utilisateur (few-shot learning).

---

## 🗂️ Architecture — chaque fichier expliqué

### `src/lib/constants.js`
Contient toutes les constantes partagées :
- `STYLES` : les 5 styles de drague (humour, romantique, direct, mysterieux, chill), chacun avec id, label, emoji, description
- `CATEGORIES` : couleurs pour les badges de catégorie des réponses
- `PLATFORMS` : liste des plateformes supportées (hinge, tinder, instagram, autre)

### `src/lib/examples.js`
Le "cerveau" de l'entraînement. Gère les exemples en localStorage.
- `getExamples()` : lit tous les exemples depuis localStorage, retourne les exemples par défaut si vide
- `saveExample(example)` : sauvegarde un nouvel exemple, retourne la liste mise à jour
- `deleteExample(id)` : supprime un exemple par id
- `getExamplesForPrompt(type, style, limit)` : retourne les meilleurs exemples pour un type et style donné, triés par (même style > meilleure note > plus récent), max `limit` résultats
- Format d'un exemple : `{ id, type ("accroche"|"reply"), context, response, style, rating (1-5), note, createdAt }`
- Les exemples avec `id` commençant par `"default_"` ne peuvent pas être supprimés (exemples par défaut)

### `src/lib/groq.js`
Client API Groq. Deux fonctions exportées :
- `analyseProfile({ profileDesc, platform, style })` : génère des accroches à partir d'une description textuelle de profil. Retourne `{ impression, points_forts[], accroches[] }` où chaque accroche a `{ texte, categorie, score }`
- `generateReplies({ receivedMsg, context, style })` : génère 5 réponses à un message reçu. Retourne `{ suggestions[] }` où chaque suggestion a `{ texte, categorie, score, explication }`
- `buildExamplesBlock(type, style)` : fonction interne qui construit le bloc few-shot à injecter dans les prompts
- `callGroq(systemPrompt, userPrompt)` : fonction interne bas niveau, appelle l'API Groq
- La clé API est lue via `import.meta.env.VITE_GROQ_API_KEY` — lève une erreur claire si manquante
- Modèle utilisé : `llama-3.3-70b-versatile`, température 0.85, max_tokens 1000
- Les réponses de l'API sont attendues en JSON pur — `parseJSON()` nettoie les éventuels backticks markdown

### `src/components/UI.jsx`
Composants réutilisables sans état :
- `Badge({ cat })` : pill coloré affichant la catégorie d'une réponse
- `ScoreBar({ score })` : barre de progression 0-1 avec couleur conditionnelle (vert/orange/rouge)
- `Spinner()` : icône de chargement animée inline
- `InfoBox({ children })` : encadré d'information gris foncé
- `ReplyCard({ rank, reply, onCopy, copied })` : carte cliquable pour une suggestion de réponse
- `StarRating({ value, onChange })` : sélecteur d'étoiles 1-5

### `src/components/AnalyseTab.jsx`
Tab "📝 Analyser". State local : platform, profileDesc, result, loading, error, copied.
L'utilisateur décrit un profil en texte → appel `analyseProfile()` → affiche impression + points forts + accroches cliquables (copie dans le presse-papier).

### `src/components/ReplyTab.jsx`
Tab "💬 Répondre". State local : receivedMsg, context, replies, loading, error, copied.
L'utilisateur colle un message reçu + contexte optionnel → appel `generateReplies()` → affiche 5 ReplyCard triées par score décroissant.

### `src/components/TrainTab.jsx`
Tab "🧠 Entraîner". Le plus complexe.
- Formulaire d'ajout : type (reply/accroche), context, response, style (select), rating (StarRating), note optionnelle
- Liste des exemples avec filtre (tous/reply/accroche) et bouton suppression (sauf exemples par défaut)
- Sauvegarde via `saveExample()` → met à jour le state local `examples`
- Les exemples sauvegardés ici sont automatiquement utilisés dans les prochains appels API via `getExamplesForPrompt()`

### `src/components/StyleTab.jsx`
Tab "✨ Style". Permet de choisir parmi les 5 styles définis dans `STYLES`.
Le style choisi est géré dans `App.jsx` via props (`flairStyle`, `setFlairStyle`) et transmis à `AnalyseTab` et `ReplyTab` qui le passent aux fonctions de `groq.js`.

### `src/App.jsx`
Composant racine. Gère :
- `tab` : onglet actif parmi ["analyse", "reply", "train", "style"]
- `flairStyle` : style de drague actif, partagé entre AnalyseTab et ReplyTab
- Le CSS global est injecté via une balise `<style>` dans le JSX (classes : tab-btn, btn-primary, field, platform-btn, style-chip, fade-in, spinner)
- Le style actif est affiché en permanence dans le header

---

## ⚙️ Variables d'environnement

| Variable | Description | Où l'obtenir |
|----------|-------------|--------------|
| `VITE_GROQ_API_KEY` | Clé API Groq (obligatoire) | console.groq.com → API Keys |

Préfixe `VITE_` obligatoire pour que Vite l'expose au frontend via `import.meta.env`.

---

## 🧩 Flux de données principal

```
Utilisateur tape un message
        ↓
ReplyTab.handleGenerate()
        ↓
groq.js → buildExamplesBlock()   ← examples.js → localStorage
        ↓
callGroq(systemPrompt + exemples, userPrompt)
        ↓
API Groq (Llama 3.3 70B)
        ↓
parseJSON(response)
        ↓
ReplyTab affiche les 5 ReplyCard triées par score
        ↓
Utilisateur clique → clipboard
```

---

## ⚠️ Points d'attention pour les modifications

1. **Toujours garder le JSON strict dans les prompts** — le parsing est fragile, `parseJSON()` nettoie les backticks mais pas plus
2. **Le style est un objet `{ id, label, emoji, desc }`** — ne pas passer juste l'id aux fonctions groq.js
3. **Les exemples par défaut ont des ids `default_X`** — ne pas les supprimer dans la UI
4. **`import.meta.env` est read-only** — ne jamais essayer d'écrire dedans
5. **Pas de React Router** — la navigation entre tabs est gérée par un simple state `tab` dans App.jsx
6. **Le CSS est en inline styles + classes globales** dans App.jsx — pas de fichier CSS séparé, pas de Tailwind
