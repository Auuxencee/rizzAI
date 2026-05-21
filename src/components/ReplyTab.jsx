import { useState } from "react";
import { generateReplies } from "../lib/groq.js";
import { ReplyCard, Spinner } from "./UI.jsx";

export default function ReplyTab({ style }) {
  const [receivedMsg, setReceivedMsg] = useState("");
  const [context, setContext] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const fetchReplies = async ({ isRegen = false } = {}) => {
    if (isRegen) setRegenLoading(true);
    else { setLoading(true); setReplies([]); setAttempt(0); }
    setError(null);
    try {
      const data = await generateReplies({ receivedMsg, context, style });
      setReplies(data.suggestions || []);
      if (isRegen) setAttempt(a => a + 1);
    } catch (e) {
      setError(e.message);
    }
    if (isRegen) setRegenLoading(false);
    else setLoading(false);
  };

  const sorted = [...replies].sort((a, b) => b.score - a.score);

  return (
    <div className="fade-in">
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 14, lineHeight: 1.6 }}>
        Colle le message reçu, l'IA propose 5 réponses classées par efficacité.
      </p>

      <textarea
        className="field"
        rows={3}
        placeholder='Ex : "Salut, tu fais quoi dans la vie ?" 😄'
        value={receivedMsg}
        onChange={e => setReceivedMsg(e.target.value)}
        style={{ marginBottom: 10 }}
      />
      <textarea
        className="field"
        rows={2}
        placeholder="Contexte optionnel (ex: on s'est matchés hier, on se connaît de vue...)"
        value={context}
        onChange={e => setContext(e.target.value)}
        style={{ marginBottom: 14 }}
      />

      <button
        className="btn-primary"
        style={{ width: "100%" }}
        disabled={!receivedMsg.trim() || loading}
        onClick={() => fetchReplies()}
      >
        {loading ? <><Spinner />Génération...</> : "🎯 Générer 5 réponses"}
      </button>

      {error && <p style={{ color: "#ef4444", marginTop: 12, fontSize: 13 }}>❌ {error}</p>}

      {replies.length > 0 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              👍 Clique pour copier · ✏️ Modifier · 👍👎 Donner un avis
            </p>
            {attempt > 0 && (
              <span style={{ fontSize: 11, color: "#475569" }}>Tentative {attempt + 1}</span>
            )}
          </div>

          {sorted.map((r, i) => (
            <ReplyCard
              key={`${attempt}-${i}`}
              rank={i + 1}
              reply={r}
              receivedMsg={receivedMsg}
              styleId={style.id}
            />
          ))}

          {/* Régénérer */}
          <button
            onClick={() => fetchReplies({ isRegen: true })}
            disabled={regenLoading}
            style={{
              width: "100%", marginTop: 6,
              background: "none",
              border: "1px solid #2a2a3e",
              borderRadius: 12, padding: "11px 0",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 14,
              color: regenLoading ? "#475569" : "#94a3b8",
              cursor: regenLoading ? "not-allowed" : "pointer",
              transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
            onMouseEnter={e => { if (!regenLoading) { e.currentTarget.style.borderColor = "#e879f9"; e.currentTarget.style.color = "#f8fafc"; }}}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = regenLoading ? "#475569" : "#94a3b8"; }}
          >
            {regenLoading ? <><Spinner />Génération...</> : "🔄 Générer 5 nouvelles réponses"}
          </button>
        </div>
      )}
    </div>
  );
}
