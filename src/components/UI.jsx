import { useState } from "react";
import { saveExample } from "../lib/examples.js";
import { CATEGORIES } from "../lib/constants.js";

export function Badge({ cat }) {
  const style = CATEGORIES[cat] || CATEGORIES.chill;
  return (
    <span style={{
      background: style.bg, color: style.color,
      padding: "2px 10px", borderRadius: 99,
      fontSize: 11, fontWeight: 700,
      letterSpacing: "0.05em", textTransform: "uppercase",
    }}>{cat}</span>
  );
}

export function ScoreBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "#10b981" : pct >= 60 ? "#f59e0b" : "#ef4444";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#1e1e2e", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          width: `${pct}%`, height: "100%", background: color,
          borderRadius: 99, transition: "width 0.8s cubic-bezier(.4,0,.2,1)"
        }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color, minWidth: 36 }}>{pct}%</span>
    </div>
  );
}

export function Spinner() {
  return <span style={{
    width: 16, height: 16, border: "2px solid #ffffff33",
    borderTopColor: "white", borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    display: "inline-block", verticalAlign: "middle", marginRight: 8,
  }} />;
}

export function InfoBox({ children }) {
  return (
    <div style={{
      background: "#1a1a2e", border: "1px solid #2a2a3e",
      borderRadius: 10, padding: "10px 14px",
      fontSize: 12, color: "#64748b", lineHeight: 1.6, marginBottom: 14,
    }}>{children}</div>
  );
}

export function ReplyCard({ rank, reply, receivedMsg, styleId, onChose }) {
  const [feedback, setFeedback] = useState(null); // 'like' | 'dislike'
  const [comment, setComment] = useState("");
  const [commentSaved, setCommentSaved] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(reply.texte);
  const [editSaved, setEditSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const displayText = editSaved ? editText : reply.texte;

  const handleCopy = () => {
    navigator.clipboard.writeText(displayText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLike = async () => {
    if (feedback === "like") return;
    setFeedback("like");
    await saveExample({
      type: "reply",
      context: `Message reçu: "${receivedMsg}"`,
      response: reply.texte,
      style: styleId,
      rating: 5,
      note: "👍 Aimé via l'app",
    });
    onChose?.(reply.texte);
  };

  const handleDislike = () => {
    if (feedback === "dislike") {
      setFeedback(null);
      setComment("");
      setCommentSaved(false);
    } else {
      setFeedback("dislike");
      setCommentSaved(false);
    }
  };

  const handleSaveComment = () => setCommentSaved(true);

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    await saveExample({
      type: "reply",
      context: `Message reçu: "${receivedMsg}"`,
      response: editText.trim(),
      style: styleId,
      rating: 5,
      note: "✏️ Modifié et approuvé",
    });
    setEditSaved(true);
    setIsEditing(false);
    onChose?.(editText.trim());
  };

  const handleCancelEdit = () => {
    setEditText(editSaved ? editText : reply.texte);
    setIsEditing(false);
  };

  const borderColor =
    feedback === "like" ? "#10b981"
    : feedback === "dislike" ? "#ef4444"
    : "#1e1e2e";

  return (
    <div style={{
      background: "#13131f",
      border: `1px solid ${borderColor}`,
      borderRadius: 14, marginBottom: 10,
      transition: "border-color 0.25s",
      overflow: "hidden",
    }}>
      {/* Main body */}
      <div style={{ padding: "14px 16px 12px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            {rank && <span style={{ fontWeight: 700, fontSize: 13, color: "#475569" }}>#{rank}</span>}
            <Badge cat={reply.categorie} />
          </div>
          <button
            onClick={handleCopy}
            style={{
              background: copied ? "rgba(16,185,129,0.12)" : "#1e1e2e",
              border: `1px solid ${copied ? "#10b981" : "#2a2a3e"}`,
              borderRadius: 8, padding: "4px 10px", cursor: "pointer",
              fontSize: 12, color: copied ? "#10b981" : "#64748b",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 500,
              transition: "all 0.2s",
            }}
          >
            {copied ? "✓ Copié !" : "📋 Copier"}
          </button>
        </div>

        <ScoreBar score={reply.score} />

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
            {reply.explication && (
              <p style={{ fontSize: 12, color: "#64748b", fontStyle: "italic", marginTop: 6 }}>
                {reply.explication}
              </p>
            )}
          </>
        )}
      </div>

      {/* Edit actions */}
      {isEditing && (
        <div style={{ display: "flex", gap: 8, padding: "0 16px 12px" }}>
          <button
            onClick={handleSaveEdit}
            disabled={!editText.trim()}
            style={{
              background: "linear-gradient(135deg, #e879f9, #f43f5e)",
              border: "none", color: "white", padding: "8px 16px", borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
              cursor: editText.trim() ? "pointer" : "not-allowed",
              opacity: editText.trim() ? 1 : 0.5, transition: "opacity 0.2s",
            }}
          >💾 Sauvegarder</button>
          <button
            onClick={handleCancelEdit}
            style={{
              background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#94a3b8",
              padding: "8px 14px", borderRadius: 8,
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
            }}
          >Annuler</button>
        </div>
      )}

      {/* Dislike comment box */}
      {feedback === "dislike" && !commentSaved && (
        <div style={{ padding: "0 16px 12px" }}>
          <input
            className="field"
            type="text"
            placeholder="Pourquoi ? (optionnel — aide à affiner le modèle)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleSaveComment()}
            style={{ marginBottom: 8, fontSize: 13 }}
          />
          <button
            onClick={handleSaveComment}
            style={{
              background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#94a3b8",
              padding: "7px 0", borderRadius: 8, width: "100%",
              fontFamily: "'DM Sans', sans-serif", fontSize: 13, cursor: "pointer",
            }}
          >Valider</button>
        </div>
      )}
      {feedback === "dislike" && commentSaved && (
        <p style={{ fontSize: 12, color: "#475569", fontStyle: "italic", padding: "0 16px 12px" }}>
          Retour enregistré.{comment ? ` "${comment}"` : ""}
        </p>
      )}

      {/* Footer: like / dislike / edit */}
      {!isEditing && (
        <div style={{
          display: "flex", alignItems: "center", gap: 2,
          padding: "8px 12px 10px",
          borderTop: "1px solid #1a1a2a",
        }}>
          {/* Like */}
          <button
            onClick={handleLike}
            title="Bonne réponse — sauvegardée dans tes exemples"
            style={{
              background: feedback === "like" ? "rgba(16,185,129,0.15)" : "none",
              border: `1px solid ${feedback === "like" ? "rgba(16,185,129,0.4)" : "transparent"}`,
              borderRadius: 8, padding: "5px 10px", fontSize: 17,
              cursor: feedback === "like" ? "default" : "pointer",
              transition: "all 0.2s", lineHeight: 1,
            }}
          >👍</button>

          {/* Dislike */}
          <button
            onClick={handleDislike}
            title="Mauvaise réponse"
            style={{
              background: feedback === "dislike" ? "rgba(239,68,68,0.15)" : "none",
              border: `1px solid ${feedback === "dislike" ? "rgba(239,68,68,0.4)" : "transparent"}`,
              borderRadius: 8, padding: "5px 10px", fontSize: 17,
              cursor: "pointer", transition: "all 0.2s", lineHeight: 1,
            }}
          >👎</button>

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Edit saved indicator */}
          {editSaved && (
            <span style={{ fontSize: 12, color: "#10b981", marginRight: 8 }}>
              ✓ Modif. sauvegardée
            </span>
          )}

          {/* Edit pencil */}
          {!editSaved && (
            <button
              onClick={() => setIsEditing(true)}
              title="Modifier la réponse — la version améliorée sera sauvegardée"
              style={{
                background: "none",
                border: "1px solid transparent",
                borderRadius: 8, padding: "5px 10px",
                cursor: "pointer", fontSize: 15, color: "#475569",
                transition: "all 0.2s", lineHeight: 1,
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = "#94a3b8"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#475569"; }}
            >✏️</button>
          )}
        </div>
      )}
    </div>
  );
}

export function StarRating({ value, onChange }) {
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          onClick={() => onChange(n)}
          style={{
            background: "none", border: "none", cursor: "pointer",
            fontSize: 22, color: n <= value ? "#f59e0b" : "#2a2a3e",
            transition: "color 0.15s", padding: "0 2px",
          }}
        >★</button>
      ))}
    </div>
  );
}
