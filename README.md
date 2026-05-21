# 💘 RizzAI

Coach séduction IA — analyse de profils, génération de réponses, entraînable avec tes propres exemples.

**Stack :** React 18 + Vite · Groq API (Llama 3.3 70B) · Few-shot learning · localStorage

---

## 🚀 Installation

```bash
git clone https://github.com/Auuxence/rizzAI
cd rizzAI
npm install
```

Copie le fichier d'environnement :
```bash
cp .env.example .env
```

Ouvre `.env` et colle ta clé Groq :
```
VITE_GROQ_API_KEY=gsk_...
```

> Clé **100% gratuite** sur [console.groq.com](https://console.groq.com)

Lance le projet :
```bash
npm run dev
# → http://localhost:5173
```

---

## 📁 Structure du projet

```
rizzAI/
├── src/
│   ├── App.jsx                  # Composant racine, routing entre les tabs
│   ├── main.jsx                 # Entry point React
│   ├── components/
│   │   ├── AnalyseTab.jsx       # Tab "Analyser" — profil → accroches
│   │   ├── ReplyTab.jsx         # Tab "Répondre" — message → 5 réponses scorées
│   │   ├── TrainTab.jsx         # Tab "Entraîner" — gestion des exemples
│   │   ├── StyleTab.jsx         # Tab "Style" — choix du style de drague
│   │   └── UI.jsx               # Composants réutilisables (Badge, ScoreBar, etc.)
│   └── lib/
│       ├── groq.js              # Client API Groq + construction des prompts few-shot
│       ├── examples.js          # CRUD localStorage pour les exemples d'entraînement
│       └── constants.js         # STYLES, CATEGORIES, PLATFORMS
├── .env                         # ⚠️ NE JAMAIS COMMIT — clé API
├── .env.example                 # Template vide à partager
├── .gitignore
├── EXPLANATIONS.md              # Documentation technique pour Claude Code
├── index.html
├── package.json
└── vite.config.js
```

---

## 🧠 Comment fonctionne l'entraînement

RizzAI utilise du **few-shot prompting** — pas de fine-tuning, pas d'infra.

1. Tu vas dans **🧠 Entraîner**
2. Tu sauvegardes un échange qui a bien marché (contexte + réponse + note /5)
3. L'exemple est stocké en `localStorage`
4. À chaque appel API, `groq.js` récupère les meilleurs exemples et les injecte dans le prompt système
5. Llama 3.3 s'en inspire pour générer des réponses dans ton style

**Priorité d'injection :** même style > meilleure note > plus récent (max 4 exemples par appel)

---

## ✨ Les 4 fonctionnalités

| Tab | Ce que ça fait |
|-----|----------------|
| 📝 **Analyser** | Décris un profil en texte (bio, photos, centres d'intérêt) → accroches personnalisées avec score |
| 💬 **Répondre** | Colle un message reçu + contexte optionnel → 5 réponses classées par score et catégorie |
| 🧠 **Entraîner** | Sauvegarde tes vrais échanges qui ont marché pour affiner les prochaines suggestions |
| ✨ **Style** | Choix du style global : Humour 😏 / Romantique 🌹 / Direct 🎯 / Mystérieux 🌙 / Chill 🌊 |

---

## 🔐 Sécurité

- La clé API vit uniquement dans `.env`, jamais commitée
- `.gitignore` couvre `.env`, `.env.local`, `.env.production`
- Toutes les données utilisateur restent en `localStorage` (aucun serveur tiers)

---

## 🛣️ Roadmap

- [ ] Analyse de profil par image (modèle multimodal type LLaVA)
- [ ] Export / import des exemples en JSON
- [ ] Historique des conversations générées
- [ ] Mode "simulation de conversation" complète
- [ ] PWA pour utilisation mobile
