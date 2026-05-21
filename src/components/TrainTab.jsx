import { useState } from "react";
import { getExamples, saveExample, deleteExample } from "../lib/examples.js";
import { STYLES } from "../lib/constants.js";
import { StarRating } from "./UI.jsx";

export default function TrainTab() {
  const [examples, setExamples] = useState(getExamples());
  const [form, setForm] = useState({
    type: "reply",
    context: "",
    response: "",
    style: "humour",
    rating: 4,
    note: "",
  });
  const [saved, setSaved] = useState(false);
  const [filter, setFilter] = useState("all");

  const handleSave = () => {
    if (!form.context.trim() || !form.response.trim()) return;
    const updated = saveExample(form);
    setExamples(updated);
    setForm({ type: "reply", context: "", response: "", style: "humour", rating: 4, note: "" });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (id) => {
    const updated = deleteExample(id);
    setExamples(updated);
  };

  const filtered = filter === "all" ? examples : examples.filter(e => e.type === filter);

  return (
    <div className="fade-in">
      {/* Explainer */}
      <div style={{
        background: "linear-gradient(135deg, #1e0a1f, #0a1020)",
        border: "1px solid #2a2a3e", borderRadius: 14, padding: 16, marginBottom: 20,
      }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#e879f9", marginBottom: 6 }}>
          🧠 Comment ça marche ?
        </p>
        <p style={{ fontSize: 12, color: "#94a3b8", lineHeight: 1.7 }}>
          Chaque exemple que tu sauvegardes est injecté dans le prompt de l'IA.
          Plus tu ajoutes des échanges qui ont <strong style={{ color: "#e2e8f0" }}>bien marché</strong>,
          plus le modèle s'adapte à <strong style={{ color: "#e2e8f0" }}>ton style</strong>.
          C'est du <em>few-shot learning</em> — pas besoin d'entraîner un modèle.
        </p>
      </div>

      {/* Add example form */}
      <div style={{ background: "#13131f", border: "1px solid #1e1e2e", borderRadius: 16, padding: 18, marginBottom: 20 }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>
          ➕ Ajouter un exemple qui a marché
        </p>

        {/* Type */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {[
            { id: "reply", label: "💬 Réponse" },
            { id: "accroche", label: "🎯 Accroche" },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setForm(f => ({ ...f, type: t.id }))}
              style={{
                background: form.type === t.id ? "#1e0a1f" : "#1e1e2e",
                border: `2px solid ${form.type === t.id ? "#e879f9" : "transparent"}`,
                borderRadius: 10, padding: "8px 16px", cursor: "pointer",
                color: form.type === t.id ? "#f8fafc" : "#64748b",
                fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                transition: "all 0.2s",
              }}
            >{t.label}</button>
          ))}
        </div>

        {/* Context */}
        <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {form.type === "reply" ? "Message reçu" : "Description du profil"}
        </label>
        <textarea
          className="field"
          rows={2}
          placeholder={form.type === "reply"
            ? 'Ex : "Tu fais quoi ce weekend ?"'
            : 'Ex : Clara, 22 ans, aime la photo et les voyages'}
          value={form.context}
          onChange={e => setForm(f => ({ ...f, context: e.target.value }))}
          style={{ marginTop: 4, marginBottom: 10 }}
        />

        {/* Response */}
        <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Ta réponse qui a marché
        </label>
        <textarea
          className="field"
          rows={2}
          placeholder={"Ex : \"J'hésite entre grimper un volcan ou regarder Netflix... t'aurais un avis tranché là-dessus ? 😄\""}
          value={form.response}
          onChange={e => setForm(f => ({ ...f, response: e.target.value }))}
          style={{ marginTop: 4, marginBottom: 10 }}
        />

        {/* Style + Rating */}
        <div style={{ display: "flex", gap: 12, marginBottom: 10, alignItems: "center", flexWrap: "wrap" }}>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Style
            </label>
            <select
              value={form.style}
              onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
              style={{
                background: "#1e1e2e", border: "1px solid #2a2a3e", borderRadius: 8,
                padding: "6px 10px", color: "#f8fafc", fontFamily: "'DM Sans', sans-serif", fontSize: 13,
              }}
            >
              {STYLES.map(s => <option key={s.id} value={s.id}>{s.emoji} {s.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize: 11, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: 4 }}>
              Ça a marché ?
            </label>
            <StarRating value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
          </div>
        </div>

        {/* Note */}
        <input
          className="field"
          type="text"
          placeholder="Note optionnelle (ex: elle a ri, on a RDV vendredi 🎉)"
          value={form.note}
          onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
          style={{ marginBottom: 12 }}
        />

        <button
          className="btn-primary"
          style={{ width: "100%" }}
          disabled={!form.context.trim() || !form.response.trim()}
          onClick={handleSave}
        >
          {saved ? "✓ Exemple sauvegardé !" : "💾 Sauvegarder cet exemple"}
        </button>
      </div>

      {/* Examples list */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Mes exemples ({filtered.length})
        </p>
        <div style={{ display: "flex", gap: 6 }}>
          {["all", "reply", "accroche"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                background: filter === f ? "#1e0a1f" : "#1e1e2e",
                border: `1px solid ${filter === f ? "#e879f9" : "transparent"}`,
                borderRadius: 8, padding: "4px 10px", cursor: "pointer",
                color: filter === f ? "#f8fafc" : "#64748b",
                fontFamily: "'DM Sans', sans-serif", fontSize: 11, fontWeight: 600,
              }}
            >{f === "all" ? "Tous" : f}</button>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <p style={{ color: "#475569", fontSize: 13, textAlign: "center", padding: "20px 0" }}>
          Pas encore d'exemples. Ajoute tes meilleurs échanges !
        </p>
      )}

      {filtered.map(ex => (
        <div key={ex.id} style={{
          background: "#13131f", border: "1px solid #1e1e2e",
          borderRadius: 12, padding: 14, marginBottom: 10,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <span style={{
                background: ex.type === "reply" ? "#1e1e4e" : "#1e2e1e",
                color: ex.type === "reply" ? "#818cf8" : "#4ade80",
                padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700,
              }}>
                {ex.type === "reply" ? "💬 RÉPONSE" : "🎯 ACCROCHE"}
              </span>
              <span style={{ fontSize: 12, color: "#f59e0b" }}>
                {"★".repeat(ex.rating)}{"☆".repeat(5 - ex.rating)}
              </span>
            </div>
            {!ex.id.startsWith("default_") && (
              <button
                onClick={() => handleDelete(ex.id)}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  color: "#475569", fontSize: 16, padding: "0 4px",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => e.target.style.color = "#ef4444"}
                onMouseLeave={e => e.target.style.color = "#475569"}
              >×</button>
            )}
          </div>
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>
            📥 {ex.context.length > 80 ? ex.context.slice(0, 80) + "..." : ex.context}
          </p>
          <p style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5 }}>
            💬 "{ex.response}"
          </p>
          {ex.note && (
            <p style={{ fontSize: 11, color: "#4ade80", marginTop: 6, fontStyle: "italic" }}>
              ✓ {ex.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
