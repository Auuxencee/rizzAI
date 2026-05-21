import { useState, useEffect, useRef } from "react";
import { generateReplies } from "../lib/groq.js";
import { saveExample } from "../lib/examples.js";
import {
  addExchange, addMessage, createConversation,
  getConversation, getConversations, deleteConversation, renameConversation,
} from "../lib/conversations.js";
import { Badge, ScoreBar, Spinner } from "./UI.jsx";
import ConversationList from "./ConversationList.jsx";

// ─── Mini carte suggestion ────────────────────────────────────────────────────

function SuggestionCard({ reply, receivedMsg, styleId, onSend }) {
  const [feedback, setFeedback]         = useState(null);
  const [isEditing, setIsEditing]       = useState(false);
  const [editText, setEditText]         = useState(reply.texte);
  const [comment, setComment]           = useState("");
  const [commentOpen, setCommentOpen]   = useState(false);
  const [commentSaved, setCommentSaved] = useState(false);

  const displayText = isEditing ? editText : reply.texte;

  const handleSend = async (text = reply.texte) => {
    if (feedback !== "like") {
      await saveExample({
        type: "reply",
        context: `Message reçu: "${receivedMsg}"`,
        response: text,
        style: styleId,
        rating: 5,
        note: "✅ Envoyé depuis la conversation",
      });
    }
    onSend(text);
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
  };

  return (
    <div style={{
      background: "#13131f",
      border: `1px solid ${feedback === "like" ? "#10b981" : feedback === "dislike" ? "#ef4444" : "#1e1e2e"}`,
      borderRadius: 14, marginBottom: 8, overflow: "hidden",
      transition: "border-color 0.2s",
    }}>
      <div style={{ padding: "12px 14px 8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <Badge cat={reply.categorie} />
          <span style={{ fontSize: 12, color: "#475569" }}>
            {Math.round(reply.score * 100)}%
          </span>
        </div>

        {isEditing ? (
          <textarea
            className="field"
            value={editText}
            onChange={e => setEditText(e.target.value)}
            rows={2}
            style={{ fontSize: 14, lineHeight: 1.6, marginTop: 4 }}
            autoFocus
          />
        ) : (
          <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6, margin: "6px 0 0" }}>
            {reply.texte}
          </p>
        )}

        {reply.explication && !isEditing && (
          <p style={{ fontSize: 11, color: "#475569", fontStyle: "italic", marginTop: 4 }}>
            {reply.explication}
          </p>
        )}
      </div>

      {/* Dislike comment */}
      {commentOpen && !commentSaved && (
        <div style={{ padding: "0 14px 10px" }}>
          <input
            className="field"
            placeholder="Pourquoi ? (optionnel)"
            value={comment}
            onChange={e => setComment(e.target.value)}
            onKeyDown={e => e.key === "Enter" && setCommentSaved(true)}
            style={{ fontSize: 13, marginBottom: 6 }}
          />
          <button onClick={() => setCommentSaved(true)} style={ghostBtn}>Valider</button>
        </div>
      )}
      {commentSaved && (
        <p style={{ fontSize: 11, color: "#475569", fontStyle: "italic", padding: "0 14px 8px" }}>
          Retour enregistré.
        </p>
      )}

      {/* Footer */}
      <div style={{
        display: "flex", alignItems: "center", gap: 4,
        padding: "6px 10px 8px", borderTop: "1px solid #1a1a2a",
      }}>
        {/* Like */}
        <button onClick={handleLike} style={{
          ...iconBtn,
          background: feedback === "like" ? "rgba(16,185,129,0.15)" : "none",
          border: `1px solid ${feedback === "like" ? "rgba(16,185,129,0.4)" : "transparent"}`,
        }}>👍</button>

        {/* Dislike */}
        <button onClick={() => { setFeedback("dislike"); setCommentOpen(true); }} style={{
          ...iconBtn,
          background: feedback === "dislike" ? "rgba(239,68,68,0.15)" : "none",
          border: `1px solid ${feedback === "dislike" ? "rgba(239,68,68,0.4)" : "transparent"}`,
        }}>👎</button>

        {/* Edit */}
        {isEditing ? (
          <>
            <button onClick={() => handleSend(editText)} disabled={!editText.trim()} style={{
              ...iconBtn, fontSize: 12, color: "#e879f9", border: "1px solid rgba(232,121,249,0.4)",
            }}>💾 Envoyer</button>
            <button onClick={() => { setIsEditing(false); setEditText(reply.texte); }} style={{ ...iconBtn, fontSize: 12, color: "#64748b" }}>Annuler</button>
          </>
        ) : (
          <button onClick={() => setIsEditing(true)} style={{ ...iconBtn, color: "#475569" }} title="Modifier avant d'envoyer">✏️</button>
        )}

        <div style={{ flex: 1 }} />

        {/* Send */}
        {!isEditing && (
          <button
            onClick={() => handleSend(reply.texte)}
            style={{
              background: "linear-gradient(135deg, #e879f9, #f43f5e)",
              border: "none", borderRadius: 10, padding: "7px 16px",
              fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
              color: "white", cursor: "pointer", transition: "all 0.2s",
            }}
          >Envoyer →</button>
        )}
      </div>
    </div>
  );
}

const iconBtn = {
  background: "none", border: "1px solid transparent", borderRadius: 8,
  padding: "4px 8px", cursor: "pointer", fontSize: 16, lineHeight: 1,
  transition: "all 0.2s", fontFamily: "'DM Sans', sans-serif",
};
const ghostBtn = {
  background: "#1e1e2e", border: "1px solid #2a2a3e", color: "#94a3b8",
  padding: "6px 14px", borderRadius: 8, cursor: "pointer",
  fontFamily: "'DM Sans', sans-serif", fontSize: 13, width: "100%",
};

// ─── ReplyTab ─────────────────────────────────────────────────────────────────

export default function ReplyTab({ style, initialConvId, onConvLoaded }) {
  const [convList, setConvList]         = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConv, setActiveConv]     = useState(null);
  const [showSidebar, setShowSidebar]   = useState(true);
  const [apiError, setApiError]         = useState(null);

  // mode: "start" | "her_turn" | "picking"
  const [mode, setMode]           = useState("start");
  const [startWho, setStartWho]   = useState(null); // "her" | "me"
  const [inputText, setInputText] = useState("");
  const [contextText, setContextText] = useState("");
  const [showContext, setShowContext] = useState(false);

  const [replies, setReplies]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [genError, setGenError]       = useState(null);

  const bottomRef = useRef(null);

  // ── Conversations list ──────────────────────────────────────────────────────
  const refreshList = async (deletedId = null) => {
    try {
      const list = await getConversations();
      setConvList(list);
      setApiError(null);
      if (deletedId && deletedId === activeConvId) {
        setActiveConvId(null); setActiveConv(null);
      }
    } catch { setApiError("Serveur API non disponible — relance avec npm run dev"); }
  };

  useEffect(() => { refreshList(); }, []);

  useEffect(() => {
    if (!initialConvId) return;
    setActiveConvId(initialConvId);
    onConvLoaded?.();
  }, [initialConvId]);

  useEffect(() => {
    if (!activeConvId) { setActiveConv(null); setMode("start"); return; }
    getConversation(activeConvId)
      .then(c => {
        setActiveConv(c);
        setReplies([]);
        setInputText("");
        setContextText("");
        setGenError(null);
        setApiError(null);
        const msgs = c.messages || [];
        if (msgs.length === 0) setMode("start");
        else if (msgs[msgs.length - 1].role === "sent") setMode("her_turn");
        else setMode("picking_pending"); // received last → need to generate
      })
      .catch(() => setApiError("Impossible de charger la conversation"));
  }, [activeConvId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages, replies, loading]);

  const handleCreate = async () => {
    try {
      const conv = await createConversation("Nouvelle conversation");
      await refreshList();
      setActiveConvId(conv.id);
    } catch { setApiError("Impossible de créer une conversation — relance avec npm run dev"); }
  };

  // ── Génération IA ───────────────────────────────────────────────────────────
  const generateSuggestions = async ({ regen = false } = {}) => {
    const msgs = activeConv?.messages || [];
    const lastReceived = [...msgs].reverse().find(m => m.role === "received");
    if (!lastReceived) return;

    if (regen) setRegenLoading(true);
    else setLoading(true);
    setGenError(null);
    try {
      const data = await generateReplies({
        receivedMsg: lastReceived.text,
        context: contextText,
        style,
        history: msgs,
      });
      setReplies(data.suggestions || []);
      setMode("picking");
    } catch (e) { setGenError(e.message); }
    if (regen) setRegenLoading(false);
    else setLoading(false);
  };

  // ── Ajouter son message (start "her" ou "her_turn") ────────────────────────
  const handleHerMessage = async () => {
    if (!inputText.trim() || !activeConvId) return;
    const updated = await addMessage(activeConvId, "received", inputText.trim());
    setActiveConv(updated);
    setInputText("");
    setReplies([]);
    setMode("loading_suggestions");
    // Generate immediately
    const msgs = updated.messages || [];
    setLoading(true);
    setGenError(null);
    try {
      const data = await generateReplies({
        receivedMsg: inputText.trim(),
        context: contextText,
        style,
        history: msgs,
      });
      setReplies(data.suggestions || []);
      setMode("picking");
    } catch (e) { setGenError(e.message); setMode("her_turn"); }
    setLoading(false);
  };

  // ── Ajouter mon message (start "me" uniquement) ────────────────────────────
  const handleMyFirstMessage = async () => {
    if (!inputText.trim() || !activeConvId) return;
    const updated = await addMessage(activeConvId, "sent", inputText.trim());
    setActiveConv(updated);
    setInputText("");
    setMode("her_turn");
    await refreshList();
  };

  // ── Choisir une réponse IA ──────────────────────────────────────────────────
  const handleSendReply = async (text) => {
    if (!activeConvId) return;
    const updated = await addMessage(activeConvId, "sent", text);
    setActiveConv(updated);
    setReplies([]);
    setMode("her_turn");
    await refreshList();
  };

  const history = activeConv?.messages || [];
  const lastReceived = [...history].reverse().find(m => m.role === "received");

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in" style={{ display: "flex", gap: 0, height: "calc(100vh - 140px)", minHeight: 500 }}>

      {/* Sidebar */}
      <div style={{
        width: showSidebar ? 210 : 0, flexShrink: 0,
        overflow: "hidden", transition: "width 0.25s ease",
        borderRight: showSidebar ? "1px solid #1e1e2e" : "none",
        paddingRight: showSidebar ? 14 : 0, marginRight: showSidebar ? 14 : 0,
      }}>
        {showSidebar && (
          <ConversationList
            conversations={convList} activeId={activeConvId}
            onSelect={setActiveConvId} onCreate={handleCreate}
            onRefresh={refreshList}
          />
        )}
      </div>

      {/* Chat area */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12, flexShrink: 0 }}>
          <button onClick={() => setShowSidebar(s => !s)} style={{
            background: "#13131f", border: "1px solid #1e1e2e",
            borderRadius: 8, padding: "5px 8px", cursor: "pointer",
            fontSize: 15, color: "#64748b",
          }}>☰</button>
          {activeConv
            ? <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>💬 {activeConv.name}</span>
            : <span style={{ fontSize: 13, color: "#475569" }}>Sélectionne ou crée une conversation</span>
          }
        </div>

        {apiError && (
          <div style={{
            background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 10, padding: "10px 14px", marginBottom: 12, flexShrink: 0,
            fontSize: 13, color: "#f87171", display: "flex", gap: 8,
          }}>⚠️ {apiError}</div>
        )}

        {!activeConv ? (
          /* ── No conversation ── */
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <p style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Aucune conversation</p>
            <p style={{ fontSize: 13, color: "#475569" }}>Crée une conversation pour commencer.</p>
            <button className="btn-primary" onClick={handleCreate} style={{ padding: "10px 24px" }}>+ Nouvelle conversation</button>
          </div>
        ) : (
          <>
            {/* ── Messages bubbles ── */}
            <div style={{
              flex: 1, overflowY: "auto", display: "flex", flexDirection: "column",
              gap: 6, paddingBottom: 8,
            }}>
              {history.length === 0 && mode === "start" && (
                <div style={{ textAlign: "center", padding: "40px 0 20px", color: "#475569", fontSize: 13 }}>
                  Début de la conversation
                </div>
              )}

              {history.map((msg, i) => (
                <div key={msg.id || i} style={{
                  display: "flex",
                  justifyContent: msg.role === "sent" ? "flex-end" : "flex-start",
                  paddingLeft: msg.role === "sent" ? "20%" : 0,
                  paddingRight: msg.role === "received" ? "20%" : 0,
                }}>
                  <div style={{
                    background: msg.role === "sent"
                      ? "linear-gradient(135deg, #e879f9, #f43f5e)"
                      : "#1e1e2e",
                    color: "#f8fafc",
                    borderRadius: msg.role === "sent" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    padding: "10px 14px",
                    fontSize: 14, lineHeight: 1.5,
                    maxWidth: "100%",
                    border: msg.role === "received" ? "1px solid #2a2a3e" : "none",
                  }}>
                    {msg.text}
                  </div>
                </div>
              ))}

              {/* Loading indicator */}
              {(loading || mode === "loading_suggestions") && (
                <div style={{ display: "flex", justifyContent: "flex-end", paddingLeft: "20%" }}>
                  <div style={{
                    background: "rgba(232,121,249,0.15)", border: "1px solid rgba(232,121,249,0.2)",
                    borderRadius: "18px 18px 4px 18px", padding: "10px 16px",
                    fontSize: 13, color: "#e879f9", display: "flex", alignItems: "center", gap: 8,
                  }}>
                    <Spinner />Génération en cours...
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* ── Action zone (bottom) ── */}
            <div style={{ flexShrink: 0, paddingTop: 10, borderTop: "1px solid #1e1e2e" }}>

              {/* START: empty conversation */}
              {mode === "start" && (
                <>
                  {!startWho ? (
                    <div style={{ display: "flex", gap: 10, justifyContent: "center", padding: "16px 0" }}>
                      <button onClick={() => setStartWho("her")} style={{
                        background: "#13131f", border: "1px solid #2a2a3e",
                        borderRadius: 12, padding: "12px 18px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                        color: "#e2e8f0", transition: "all 0.2s", textAlign: "center",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#e879f9"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a3e"}
                      >💌 Elle t'a écrit en premier</button>
                      <button onClick={() => setStartWho("me")} style={{
                        background: "#13131f", border: "1px solid #2a2a3e",
                        borderRadius: 12, padding: "12px 18px", cursor: "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600,
                        color: "#e2e8f0", transition: "all 0.2s", textAlign: "center",
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = "#e879f9"}
                      onMouseLeave={e => e.currentTarget.style.borderColor = "#2a2a3e"}
                      >🚀 Tu as envoyé l'accroche</button>
                    </div>
                  ) : startWho === "her" ? (
                    <MessageInput
                      value={inputText} onChange={setInputText}
                      placeholder="Son premier message..."
                      onSubmit={handleHerMessage}
                      disabled={!inputText.trim()}
                    />
                  ) : (
                    <MessageInput
                      value={inputText} onChange={setInputText}
                      placeholder="Ton accroche..."
                      onSubmit={handleMyFirstMessage}
                      disabled={!inputText.trim()}
                      submitLabel="Envoyer →"
                      color="sent"
                    />
                  )}
                </>
              )}

              {/* HER TURN: enter her response */}
              {mode === "her_turn" && (
                <MessageInput
                  value={inputText} onChange={setInputText}
                  placeholder="Sa réponse..."
                  onSubmit={handleHerMessage}
                  disabled={!inputText.trim()}
                />
              )}

              {/* PICKING_PENDING: last msg was received, need to generate */}
              {mode === "picking_pending" && (
                <div style={{ padding: "12px 0", display: "flex", gap: 10, alignItems: "center" }}>
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => generateSuggestions()}>
                    🎯 Générer des réponses
                  </button>
                </div>
              )}

              {/* PICKING: show AI suggestions */}
              {(mode === "picking" || (mode !== "her_turn" && mode !== "start" && mode !== "loading_suggestions" && mode !== "picking_pending" && replies.length > 0)) && (
                <div style={{ maxHeight: 420, overflowY: "auto", paddingTop: 4 }}>
                  {genError && <p style={{ color: "#ef4444", fontSize: 13, marginBottom: 8 }}>❌ {genError}</p>}

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: "#475569", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      Choisis une réponse
                    </span>
                    <button
                      onClick={() => generateSuggestions({ regen: true })}
                      disabled={regenLoading}
                      style={{
                        background: "none", border: "1px solid #2a2a3e", borderRadius: 8,
                        padding: "4px 12px", cursor: regenLoading ? "not-allowed" : "pointer",
                        fontFamily: "'DM Sans', sans-serif", fontSize: 12, color: "#64748b",
                        display: "flex", alignItems: "center", gap: 6,
                      }}
                    >
                      {regenLoading ? <><Spinner />...</> : "🔄 Nouvelles"}
                    </button>
                  </div>

                  {[...replies].sort((a, b) => b.score - a.score).map((r, i) => (
                    <SuggestionCard
                      key={i}
                      reply={r}
                      receivedMsg={lastReceived?.text || ""}
                      styleId={style.id}
                      onSend={handleSendReply}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Composant input message ───────────────────────────────────────────────────

function MessageInput({ value, onChange, placeholder, onSubmit, disabled, submitLabel = "→", color = "received" }) {
  const handleKey = e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); if (!disabled) onSubmit(); } };
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
      <textarea
        className="field"
        rows={2}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={handleKey}
        style={{ flex: 1, resize: "none", fontSize: 14, lineHeight: 1.5 }}
      />
      <button
        onClick={onSubmit}
        disabled={disabled}
        style={{
          background: color === "sent"
            ? "linear-gradient(135deg, #e879f9, #f43f5e)"
            : "#1e1e2e",
          border: color === "sent" ? "none" : "1px solid #2a2a3e",
          borderRadius: 12, padding: "12px 16px", cursor: disabled ? "not-allowed" : "pointer",
          fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 18,
          color: disabled ? "#475569" : "#f8fafc",
          transition: "all 0.2s", flexShrink: 0, height: 52,
          opacity: disabled ? 0.5 : 1,
        }}
      >{submitLabel}</button>
    </div>
  );
}
