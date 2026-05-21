import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, "data");
const DATA_FILE = join(DATA_DIR, "examples.json");

// Crée le dossier data/ si besoin
if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);

// Initialise le fichier avec les exemples par défaut s'il n'existe pas
if (!existsSync(DATA_FILE)) {
  writeFileSync(DATA_FILE, JSON.stringify(getDefaultExamples(), null, 2), "utf-8");
}

function readData() {
  try {
    return JSON.parse(readFileSync(DATA_FILE, "utf-8"));
  } catch {
    return getDefaultExamples();
  }
}

function writeData(data) {
  writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
}

function getDefaultExamples() {
  return [
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

const app = express();
app.use(express.json());

// GET  /api/examples  — lire tous les exemples
app.get("/api/examples", (_req, res) => {
  res.json(readData());
});

// POST /api/examples  — ajouter un exemple
app.post("/api/examples", (req, res) => {
  const example = {
    ...req.body,
    id: `ex_${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const updated = [example, ...readData()];
  writeData(updated);
  res.json(updated);
});

// DELETE /api/examples/:id  — supprimer un exemple
app.delete("/api/examples/:id", (req, res) => {
  const updated = readData().filter(e => e.id !== req.params.id);
  writeData(updated);
  res.json(updated);
});

app.listen(3001, () => {
  console.log("✅  API server → http://localhost:3001");
});
