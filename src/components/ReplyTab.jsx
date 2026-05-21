import { useState } from "react";
import { generateReplies } from "../lib/groq.js";
import { ReplyCard, Spinner } from "./UI.jsx";

export default function ReplyTab({ style }) {
  const [receivedMsg, setReceivedMsg] = useState("");
  const [context, setContext] = useState("");
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  const handleGenerate = async () => {
    setLoading(true);
    setReplies([]);
    setError(null);
    try {
      const data = await generateReplies({ receivedMsg, context, style });
      setReplies(data.suggestions || []);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleCopy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

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
        onClick={handleGenerate}
      >
        {loading ? <><Spinner />Génération...</> : "🎯 Générer 5 réponses"}
      </button>

      {error && <p style={{ color: "#ef4444", marginTop: 12, fontSize: 13 }}>❌ {error}</p>}

      {replies.length > 0 && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Clique pour copier
          </p>
          {[...replies]
            .sort((a, b) => b.score - a.score)
            .map((r, i) => (
              <ReplyCard
                key={i}
                rank={i + 1}
                reply={r}
                onCopy={(text) => handleCopy(text, i)}
                copied={copied === i}
              />
            ))}
        </div>
      )}
    </div>
  );
}
