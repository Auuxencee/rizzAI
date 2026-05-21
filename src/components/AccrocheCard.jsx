import { useState } from "react";
import { saveExample } from "../lib/examples.js";
import { Badge, ScoreBar } from "./UI.jsx";

export default function AccrocheCard({ accroche, profileDesc, styleId, onUseAccroche }) {
  const [feedback, setFeedback]       = useState(null); // 'like' | 'dislike'
  const [comment, setComment]         = useState("");
  const [commentSaved, setCommentSaved] = useState(false);
  const [isEditing, setIsEditing]     = useState(false);
  const [editText, setEditText]       = useState(accroche.texte);
  const [editSaved, setEditSaved]     = useState(false);
  const [copied, setCopied]           = useState(false);
  const [usedLoading, setUsedLoading] = useState(false);

  const displayText = editSaved ? editText : accroche.texte;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (feedback === "like") return;
    setFeedback("like");
    await saveExample({
      type: "accroche",
      context: profileDesc,
      response: accroche.texte,
      style: styleId,
      rating: 5,
      note: "👍 Aimé via l'app",
    });
  };

  const handleDislike = () => {
    setFeedback(feedback === "dislike" ? null : "dislike");
    setComment("");
    setCommentSaved(false);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    await saveExample({
      type: "accroche",
      context: profileDesc,
      response: editText.trim(),
      style: styleId,
      rating: 5,
      note: "✏️ Modifié et approuvé",
    });
    setEditSaved(true);
    setIsEditing(false);
  };

  const handleUse = async () => {
    setUsedLoading(true);
    await onUseAccroche(displayText, profileDesc);
    setUsedLoading(false);
  };

  const borderColor =
    feedback === "like"    ? "#10b981" :
    feedback === "dislike" ? "#ef4444" : "#1e1e2e";

  return (
    <div style={{
      background: "#13131f",
      border: `1px solid ${borderColor}`,
      borderRadius: 14, marginBottom: 10,
      transition: "border-color 0.25s", overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Badge cat={accroche.categorie} />
          <button onClick={handleCopy} style={{
            background: copied ? "rgba(16,185,129,0.12)" : "#1e1e2e",
            border: `1px solid ${copied ? "#10b981" : "#2a2a3e"}`,
            borderRadius: 8, padding: "4px 10px", cursor: "pointer",
            fontSize: 12, color: copied ? "#10b981" : "#64748b",
            fontFamily: "'DM Sans', sans-serif", fontWeight: 500, transition: "all 0.2s",
          }}>
            {copied ? "✓ Copié !" : "📋 Copier"}
          </button>
        </div>

        <ScoreBar score={accroche.score} />

        {isEditing ? (
          <textarea
            className="field"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={3}
            style={{ marginTop: 10, fontSize: 14, lineHeight: 1.6 }}
            autoFocus
          />
        ) : (
          <>
            <p style={{ fontSize: 14, color: "#e2e8f0", margin: "10px 0 0", lineHeight: 1.6 }}>
              "{displayText}"
            </p>
            {accroche.strategie && (
              <p style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 6 }}>
                💡 {accroche.strategie}
              </p>
            )}
          </>
        )}
      </div>

      {/* Edit actions */}
      {isEditing && (
        <div style={{ display: "flex", gap: 8, padding: "0 16px 12px" }}>
          <button onClick={handleSaveEdit} disabled={!editText.trim()} style={{
            background: "linear-gradient(135deg, #e879f9, #f43f5e)",
            border: "none", color: "white", padding: "8px 16px", borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
            cursor: editText.trim() ? "pointer" : "not-allowed",
            opacity: editText.trim() ? 1 : 0.5,
          }}>💾 Sauvegarder</button>
          <button onClick={() => { setIsEditing(false); setEditText(editSaved ? editText : accroche.texte); }} style={{
            background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#94a3b8",
            padding: "8px 14px", borderRadius: 8,
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
          }}>Annuler</button>
        </div>
      )}

      {/* Dislike comment */}
      {feedback === "dislike" && !commentSaved && (
        <div style={{ padding: "0 16px 12px" }}>
          <input
            className="field"
            type="text"
            placeholder="Pourquoi ? (optionnel)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setCommentSaved(true)}
            style={{ marginBottom: 8, fontSize: 13 }}
          />
          <button onClick={() => setCommentSaved(true)} style={{
            background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#94a3b8",
            padding: "7px 0", borderRadius: 8, width: "100%",
            fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
          }}>Valider</button>
        </div>
      )}
      {feedback === "dislike" && commentSaved && (
        <p style={{ fontSize: 12, color: "#475569", fontStyle: "italic", padding: "0 16px 12px" }}>
          Retour enregistré.{comment ? ` "${comment}"` : ""}
        </p>
      )}

      {/* Footer actions */}
      {!isEditing && (
        <div style={{
          borderTop: "1px solid #1a1a2a",
          padding: "8px 12px 10px",
          display: "flex", alignItems: "center", gap: 2,
        }}>
          {/* Like */}
          <button onClick={handleLike} title="Bonne accroche" style={{
            background: feedback === "like" ? "rgba(16,185,129,0.15)" : "none",
            border: `1px solid ${feedback === "like" ? "rgba(16,185,129,0.4)" : "transparent"}`,
            borderRadius: 8, padding: "5px 10px", fontSize: 17,
            cursor: feedback === "like" ? "default" : "pointer",
            transition: "all 0.2s", lineHeight: 1,
          }}>👍</button>

          {/* Dislike */}
          <button onClick={handleDislike} title="Mauvaise accroche" style={{
            background: feedback === "dislike" ? "rgba(239,68,68,0.15)" : "none",
            border: `1px solid ${feedback === "dislike" ? "rgba(239,68,68,0.4)" : "transparent"}`,
            borderRadius: 8, padding: "5px 10px", fontSize: 17,
            cursor: "pointer", transition: "all 0.2s", lineHeight: 1,
          }}>👎</button>

          {/* Edit pencil */}
          {!editSaved ? (
            <button onClick={() => setIsEditing(true)} title="Modifier l'accroche" style={{
              background: "none", border: "1px solid transparent",
              borderRadius: 8, padding: "5px 10px", cursor: "pointer",
              fontSize: 15, color: "#475569", transition: "all 0.2s", lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = "#94a3b8"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#475569"; }}
            >✏️</button>
          ) : (
            <span style={{ fontSize: 12, color: "#10b981", marginLeft: 4 }}>✓ Modifié</span>
          )}

          <div style={{ flex: 1 }} />

          {/* Utiliser cette accroche */}
          <button
            onClick={handleUse}
            disabled={usedLoading}
            style={{
              background: "linear-gradient(135deg, rgba(232,121,249,0.2), rgba(244,63,94,0.15))",
              border: "1px solid rgba(232,121,249,0.4)",
              borderRadius: 10, padding: "6px 14px",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 12,
              color: "#e879f9", cursor: usedLoading ? "wait" : "pointer",
              transition: "all 0.2s", whiteSpace: "nowrap",
            }}
            onMouseEnter={e => { if (!usedLoading) e.currentTarget.style.background = "linear-gradient(135deg, rgba(232,121,249,0.3), rgba(244,63,94,0.25))"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "linear-gradient(135deg, rgba(232,121,249,0.2), rgba(244,63,94,0.15))"; }}
          >
            {usedLoading ? "⏳ Création..." : "✅ Utiliser cette accroche →"}
          </button>
        </div>
      )}
    </div>
  );
}
