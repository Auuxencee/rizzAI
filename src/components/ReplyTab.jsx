import { useState, useEffect, useRef } from "react";
import { generateReplies } from "../lib/groq.js";
import { addExchange, createConversation, getConversation, getConversations } from "../lib/conversations.js";
import { ReplyCard, Spinner } from "./UI.jsx";
import ConversationList from "./ConversationList.jsx";

export default function ReplyTab({ style }) {
  // ── Conversations ──────────────────────────────────────────────────────────
  const [convList, setConvList]         = useState([]);
  const [activeConvId, setActiveConvId] = useState(null);
  const [activeConv, setActiveConv]     = useState(null);
  const [showSidebar, setShowSidebar]   = useState(true);

  // ── Form ───────────────────────────────────────────────────────────────────
  const [receivedMsg, setReceivedMsg] = useState("");
  const [context, setContext]         = useState("");
  const [replies, setReplies]         = useState([]);
  const [loading, setLoading]         = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [error, setError]             = useState(null);
  const [attempt, setAttempt]         = useState(0);
  const [done, setDone]               = useState(false);
  const [chosenReply, setChosenReply] = useState(null);

  const historyEndRef = useRef(null);

  // ── Load conversations list ────────────────────────────────────────────────
  const refreshList = async (deletedId = null) => {
    const list = await getConversations();
    setConvList(list);
    if (deletedId && deletedId === activeConvId) {
      setActiveConvId(null);
      setActiveConv(null);
    }
  };

  useEffect(() => { refreshList(); }, []);

  // ── Load full conversation when selection changes ──────────────────────────
  useEffect(() => {
    if (!activeConvId) { setActiveConv(null); return; }
    getConversation(activeConvId).then(c => {
      setActiveConv(c);
      setReplies([]);
      setReceivedMsg("");
      setContext("");
      setDone(false);
      setChosenReply(null);
    });
  }, [activeConvId]);

  // ── Auto-scroll message history ────────────────────────────────────────────
  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeConv?.messages]);

  // ── Create new conversation ────────────────────────────────────────────────
  const handleCreate = async () => {
    const conv = await createConversation("Nouvelle conversation");
    await refreshList();
    setActiveConvId(conv.id);
  };

  // ── Generate replies ───────────────────────────────────────────────────────
  const fetchReplies = async ({ isRegen = false } = {}) => {
    if (isRegen) setRegenLoading(true);
    else { setLoading(true); setReplies([]); setAttempt(0); setDone(false); setChosenReply(null); }
    setError(null);
    try {
      const history = activeConv?.messages || [];
      const data = await generateReplies({ receivedMsg, context, style, history });
      setReplies(data.suggestions || []);
      if (isRegen) setAttempt(a => a + 1);
    } catch (e) { setError(e.message); }
    if (isRegen) setRegenLoading(false);
    else setLoading(false);
  };

  // ── Save chosen reply to conversation ─────────────────────────────────────
  const handleChoseReply = async (replyText) => {
    if (!activeConvId || !receivedMsg.trim()) return;
    setChosenReply(replyText);
    const updated = await addExchange(activeConvId, receivedMsg, replyText);
    setActiveConv(updated);
    await refreshList();
  };

  const sorted = [...replies].sort((a, b) => b.score - a.score);
  const history = activeConv?.messages || [];

  // ── No conversation selected ───────────────────────────────────────────────
  const EmptyState = () => (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 32, gap: 16 }}>
      <div style={{ fontSize: 48 }}>💬</div>
      <p style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>Aucune conversation</p>
      <p style={{ fontSize: 13, color: "#475569" }}>Crée une conversation pour commencer à générer des réponses avec contexte.</p>
      <button className="btn-primary" onClick={handleCreate} style={{ padding: "10px 24px" }}>
        + Nouvelle conversation
      </button>
    </div>
  );

  return (
    <div className="fade-in" style={{ display: "flex", gap: 0, minHeight: 500 }}>

      {/* ── Sidebar conversations ──────────────────────────────────────────── */}
      <div style={{
        width: showSidebar ? 210 : 0,
        flexShrink: 0,
        overflow: "hidden",
        transition: "width 0.25s ease",
        borderRight: showSidebar ? "1px solid #1e1e2e" : "none",
        paddingRight: showSidebar ? 14 : 0,
        marginRight: showSidebar ? 14 : 0,
      }}>
        {showSidebar && (
          <ConversationList
            conversations={convList}
            activeId={activeConvId}
            onSelect={setActiveConvId}
            onCreate={handleCreate}
            onRefresh={refreshList}
          />
        )}
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>

        {/* Toggle sidebar + conv name */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setShowSidebar(s => !s)}
            title={showSidebar ? "Masquer les conversations" : "Afficher les conversations"}
            style={{
              background: "#13131f", border: "1px solid #1e1e2e",
              borderRadius: 8, padding: "5px 8px", cursor: "pointer",
              fontSize: 15, color: "#64748b", transition: "all 0.2s", flexShrink: 0,
            }}
          >☰</button>
          {activeConv ? (
            <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              💬 {activeConv.name}
            </span>
          ) : (
            <span style={{ fontSize: 13, color: "#475569" }}>Sélectionne ou crée une conversation</span>
          )}
        </div>

        {!activeConv ? <EmptyState /> : (
          <>
            {/* ── Message history ─────────────────────────────────────────── */}
            {history.length > 0 && (
              <div style={{
                background: "#0d0d18", border: "1px solid #1e1e2e",
                borderRadius: 14, padding: "14px 16px", marginBottom: 16,
                maxHeight: 280, overflowY: "auto",
                display: "flex", flexDirection: "column", gap: 8,
              }}>
                {history.map((msg, i) => (
                  <div key={msg.id || i} style={{
                    display: "flex",
                    justifyContent: msg.role === "sent" ? "flex-end" : "flex-start",
                  }}>
                    <div style={{
                      maxWidth: "78%",
                      background: msg.role === "sent"
                        ? "linear-gradient(135deg, #e879f9, #f43f5e)"
                        : "#1e1e2e",
                      color: "#f8fafc",
                      borderRadius: msg.role === "sent" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                      padding: "8px 12px",
                      fontSize: 13, lineHeight: 1.5,
                    }}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={historyEndRef} />
              </div>
            )}

            {/* ── Input zone ──────────────────────────────────────────────── */}
            {!done ? (
              <>
                <p style={{ fontSize: 12, color: "#475569", marginBottom: 8 }}>
                  {history.length > 0
                    ? "Son prochain message ↓"
                    : "Colle son message, l'IA voit tout l'historique pour générer le meilleur contexte."}
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
                  placeholder="Contexte optionnel (ex: on s'est matchés hier...)"
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
              </>
            ) : (
              /* ── Done state ───────────────────────────────────────────── */
              <div className="fade-in" style={{
                background: "linear-gradient(135deg, #0a1f10, #0a1a0f)",
                border: "1px solid rgba(16,185,129,0.3)",
                borderRadius: 16, padding: "24px 20px", textAlign: "center",
              }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
                <p style={{ fontWeight: 700, fontSize: 15, color: "#10b981", marginBottom: 4 }}>Bonne chance !</p>
                {chosenReply && (
                  <p style={{ fontSize: 13, color: "#64748b", fontStyle: "italic", marginBottom: 12 }}>
                    Envoyé : "{chosenReply.slice(0, 60)}{chosenReply.length > 60 ? "…" : ""}"
                  </p>
                )}
                <button
                  onClick={() => { setReplies([]); setReceivedMsg(""); setContext(""); setDone(false); setAttempt(0); setChosenReply(null); }}
                  style={{
                    background: "#1e1e2e", border: "1px solid #2a2a3e",
                    borderRadius: 10, padding: "9px 20px", cursor: "pointer",
                    fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: "#94a3b8",
                  }}
                >Répondre à son prochain message</button>
              </div>
            )}

            {error && <p style={{ color: "#ef4444", marginTop: 12, fontSize: 13 }}>❌ {error}</p>}

            {/* ── Suggestions ─────────────────────────────────────────────── */}
            {replies.length > 0 && !done && (
              <div className="fade-in" style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    📋 Copier · ✏️ Modifier · 👍👎 Avis
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    {attempt > 0 && <span style={{ fontSize: 11, color: "#475569" }}>Tentative {attempt + 1}</span>}
                    <button
                      onClick={() => setDone(true)}
                      style={{
                        background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.35)",
                        borderRadius: 10, padding: "6px 14px",
                        fontFamily: "'DM Sans', sans-serif", fontWeight: 700, fontSize: 13,
                        color: "#10b981", cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
                      }}
                    >✅ Message trouvé !</button>
                  </div>
                </div>

                {sorted.map((r, i) => (
                  <ReplyCard
                    key={`${attempt}-${i}`}
                    rank={i + 1}
                    reply={r}
                    receivedMsg={receivedMsg}
                    styleId={style.id}
                    onChose={handleChoseReply}
                  />
                ))}

                <button
                  onClick={() => fetchReplies({ isRegen: true })}
                  disabled={regenLoading}
                  style={{
                    width: "100%", marginTop: 6, background: "none",
                    border: "1px solid #2a2a3e", borderRadius: 12, padding: "11px 0",
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
          </>
        )}
      </div>
    </div>
  );
}
