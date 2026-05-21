import { useState } from "react";
import { renameConversation, deleteConversation } from "../lib/conversations.js";

export default function ConversationList({ conversations, activeId, onSelect, onCreate, onRefresh }) {
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal] = useState("");

  const startRename = (e, conv) => {
    e.stopPropagation();
    setRenamingId(conv.id);
    setRenameVal(conv.name);
  };

  const commitRename = async (id) => {
    if (renameVal.trim()) {
      await renameConversation(id, renameVal.trim());
      onRefresh();
    }
    setRenamingId(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Supprimer cette conversation ?")) return;
    await deleteConversation(id);
    onRefresh(id); // pass deleted id so parent can reset if needed
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Conversations
        </span>
        <button
          onClick={onCreate}
          title="Nouvelle conversation"
          style={{
            background: "linear-gradient(135deg, #e879f9, #f43f5e)",
            border: "none", borderRadius: 8, width: 28, height: 28,
            cursor: "pointer", fontSize: 18, color: "white",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >+</button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
        {conversations.length === 0 && (
          <p style={{ fontSize: 12, color: "#475569", textAlign: "center", padding: "20px 0" }}>
            Aucune conversation.<br />Crée-en une !
          </p>
        )}
        {conversations.map(conv => (
          <div
            key={conv.id}
            onClick={() => onSelect(conv.id)}
            style={{
              background: activeId === conv.id ? "linear-gradient(135deg, rgba(232,121,249,0.12), rgba(244,63,94,0.08))" : "#13131f",
              border: `1px solid ${activeId === conv.id ? "rgba(232,121,249,0.3)" : "#1e1e2e"}`,
              borderRadius: 10, padding: "9px 10px", cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { if (activeId !== conv.id) e.currentTarget.style.borderColor = "#2a2a3e"; }}
            onMouseLeave={e => { if (activeId !== conv.id) e.currentTarget.style.borderColor = "#1e1e2e"; }}
          >
            {renamingId === conv.id ? (
              <input
                autoFocus
                value={renameVal}
                onChange={e => setRenameVal(e.target.value)}
                onBlur={() => commitRename(conv.id)}
                onKeyDown={e => { if (e.key === "Enter") commitRename(conv.id); if (e.key === "Escape") setRenamingId(null); }}
                onClick={e => e.stopPropagation()}
                style={{
                  background: "#1e1e2e", border: "1px solid #e879f9", borderRadius: 6,
                  padding: "3px 6px", color: "#f8fafc", fontSize: 13,
                  fontFamily: "'DM Sans', sans-serif", width: "100%", outline: "none",
                }}
              />
            ) : (
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13, color: "#e2e8f0", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  💬 {conv.name}
                </span>
                <div style={{ display: "flex", gap: 2, flexShrink: 0, opacity: 0 }} className="conv-actions">
                  <button onClick={e => startRename(e, conv)} style={actionBtnStyle} title="Renommer">✏️</button>
                  <button onClick={e => handleDelete(e, conv.id)} style={actionBtnStyle} title="Supprimer">🗑️</button>
                </div>
              </div>
            )}
            {conv.preview && renamingId !== conv.id && (
              <p style={{ fontSize: 11, color: "#475569", marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {conv.preview}
              </p>
            )}
            {conv.messageCount > 0 && renamingId !== conv.id && (
              <span style={{ fontSize: 10, color: "#334155", marginTop: 2, display: "block" }}>
                {conv.messageCount} message{conv.messageCount > 1 ? "s" : ""}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>{`
        .conv-actions { opacity: 0; transition: opacity 0.15s; }
        div:hover > div > .conv-actions { opacity: 1 !important; }
      `}</style>
    </div>
  );
}

const actionBtnStyle = {
  background: "none", border: "none", cursor: "pointer",
  fontSize: 13, padding: "2px 3px", borderRadius: 4,
  lineHeight: 1,
};
