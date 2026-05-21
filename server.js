import express from "express";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR   = join(__dirname, "data");
const EX_FILE    = join(DATA_DIR, "examples.json");
const CONV_FILE  = join(DATA_DIR, "conversations.json");

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR);
if (!existsSync(EX_FILE))   writeFileSync(EX_FILE,   JSON.stringify(defaultExamples(), null, 2), "utf-8");
if (!existsSync(CONV_FILE)) writeFileSync(CONV_FILE, JSON.stringify([], null, 2), "utf-8");

// ── Helpers examples ──────────────────────────────────────────────────────────

function readEx()      { try { return JSON.parse(readFileSync(EX_FILE, "utf-8")); }  catch { return defaultExamples(); } }
function writeEx(d)    { writeFileSync(EX_FILE, JSON.stringify(d, null, 2), "utf-8"); }

function defaultExamples() {
  return [
    {
      id: "default_2", type: "reply",
      context: "Message reçu: 'Salut, tu fais quoi dans la vie ?'",
      response: "Je suis en cybersécurité — donc officiellement je protège les gens, officieusement je suis le gars qu'on appelle quand quelqu'un a cliqué sur 'vous avez gagné un iPhone' 😅 Et toi ?",
      style: "humour", rating: 4, note: "Brise-glace efficace, elle a ri",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
    {
      id: "default_3", type: "reply",
      context: "Message reçu: 'C'est quoi ton film préféré ?'",
      response: "Difficile de choisir entre Interstellar et Parasite... Un dans les étoiles, l'autre dans les tréfonds — t'aurais cru que j'avais ce genre de contradictions ? 🌌 Et toi ?",
      style: "mysterieux", rating: 4, note: "A lancé une vraie conversation",
      createdAt: "2025-01-01T00:00:00.000Z",
    },
  ];
}

// ── Helpers conversations ─────────────────────────────────────────────────────

function readConvs()   { try { return JSON.parse(readFileSync(CONV_FILE, "utf-8")); } catch { return []; } }
function writeConvs(d) { writeFileSync(CONV_FILE, JSON.stringify(d, null, 2), "utf-8"); }

// ── App ───────────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());

// ── Examples ──────────────────────────────────────────────────────────────────

app.get("/api/examples", (_req, res) => res.json(readEx()));

app.post("/api/examples", (req, res) => {
  const ex = { ...req.body, id: `ex_${Date.now()}`, createdAt: new Date().toISOString() };
  const updated = [ex, ...readEx()];
  writeEx(updated);
  res.json(updated);
});

app.delete("/api/examples/:id", (req, res) => {
  const updated = readEx().filter(e => e.id !== req.params.id);
  writeEx(updated);
  res.json(updated);
});

// ── Conversations ─────────────────────────────────────────────────────────────

// GET toutes les conversations (sans les messages pour la liste)
app.get("/api/conversations", (_req, res) => {
  const list = readConvs().map(c => ({
    id: c.id, name: c.name, status: c.status || null,
    createdAt: c.createdAt, updatedAt: c.updatedAt,
    messageCount: (c.messages || []).length,
    preview: (c.messages || []).slice(-1)[0]?.text?.slice(0, 60) || "",
  }));
  res.json(list);
});

// GET une conversation complète avec messages
app.get("/api/conversations/:id", (req, res) => {
  const conv = readConvs().find(c => c.id === req.params.id);
  if (!conv) return res.status(404).json({ error: "Not found" });
  res.json(conv);
});

// POST créer une conversation
app.post("/api/conversations", (req, res) => {
  const { name = "Nouvelle conversation" } = req.body;
  const conv = {
    id: `conv_${Date.now()}`, name,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
  };
  const updated = [conv, ...readConvs()];
  writeConvs(updated);
  res.json(conv);
});

// PUT renommer ou ajouter un/des message(s)
app.put("/api/conversations/:id", (req, res) => {
  const convs = readConvs();
  const idx = convs.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  const { name, message, messages, status } = req.body;
  if (name   !== undefined) convs[idx].name   = name;
  if (status !== undefined) convs[idx].status = status;

  // Ajout d'un message unique
  if (message) {
    convs[idx].messages = [
      ...(convs[idx].messages || []),
      { id: `msg_${Date.now()}`, ...message, timestamp: new Date().toISOString() },
    ];
  }
  // Ajout batch de plusieurs messages
  if (messages && Array.isArray(messages)) {
    const ts = Date.now();
    convs[idx].messages = [
      ...(convs[idx].messages || []),
      ...messages.map((m, i) => ({ id: `msg_${ts + i}`, ...m, timestamp: new Date().toISOString() })),
    ];
  }

  convs[idx].updatedAt = new Date().toISOString();
  writeConvs(convs);
  res.json(convs[idx]);
});

// DELETE supprimer une conversation
app.delete("/api/conversations/:id", (req, res) => {
  const updated = readConvs().filter(c => c.id !== req.params.id);
  writeConvs(updated);
  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────

app.listen(3001, () => console.log("✅  API server → http://localhost:3001"));
