import { useState } from "react";
import { STYLES } from "./lib/constants.js";
import { createConversation, addMessage } from "./lib/conversations.js";
import AnalyseTab from "./components/AnalyseTab.jsx";
import ReplyTab from "./components/ReplyTab.jsx";
import TrainTab from "./components/TrainTab.jsx";
import StyleTab from "./components/StyleTab.jsx";

const TABS = [
  { id: "analyse", label: "📝 Analyser" },
  { id: "reply",   label: "💬 Répondre" },
  { id: "train",   label: "🧠 Entraîner" },
  { id: "style",   label: "✨ Style" },
];

export default function App() {
  const [tab, setTab] = useState("reply");
  const [flairStyle, setFlairStyle] = useState("humour");
  const currentStyle = STYLES.find(s => s.id === flairStyle);
  const [pendingConvId, setPendingConvId] = useState(null);

  // Appelé depuis AnalyseTab quand l'user valide une accroche
  const handleUseAccroche = async (accrocheText, profileDesc) => {
    // Nom de la conv = premiers mots du profil
    const convName = profileDesc.trim().split(/\s+/).slice(0, 4).join(" ") || "Nouvelle conv";
    const conv = await createConversation(convName);
    await addMessage(conv.id, "sent", accrocheText);
    setPendingConvId(conv.id);
    setTab("reply");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        textarea, input, select { outline: none; }

        /* ── Tab buttons ── */
        .tab-btn {
          background: none; border: none; cursor: pointer;
          padding: 8px 0; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          transition: all 0.2s; color: #94a3b8; flex: 1;
          text-align: center;
        }
        .tab-btn.active { background: #1e1e2e; color: #f8fafc; }
        .tab-btn:hover:not(.active) { color: #e2e8f0; }

        /* ── Shared components ── */
        .btn-primary {
          background: linear-gradient(135deg, #e879f9, #f43f5e);
          border: none; color: white; padding: 12px 24px; border-radius: 12px;
          font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 14px;
          cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em;
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(232,121,249,0.4); }
        .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; transform: none; box-shadow: none; }
        .field {
          background: #1e1e2e; border: 1px solid #2a2a3e; border-radius: 12px;
          padding: 12px 14px; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          width: 100%; resize: none;
        }
        .field:focus { border-color: #e879f9; }
        .platform-btn {
          background: #1e1e2e; border: 2px solid transparent; border-radius: 10px;
          padding: 7px 14px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
          color: #94a3b8; transition: all 0.2s;
        }
        .platform-btn.active { border-color: #e879f9; color: #f8fafc; background: #1e0a1f; }
        .style-chip {
          border: 2px solid transparent; background: #1e1e2e; border-radius: 12px;
          padding: 12px 14px; cursor: pointer; transition: all 0.2s;
          text-align: left; color: #f8fafc;
          font-family: 'DM Sans', sans-serif; width: 100%;
        }
        .style-chip.active { border-color: #e879f9; background: #1e0a1f; }
        .style-chip:hover:not(.active) { border-color: #444; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .fade-in { animation: fadeIn 0.35s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

        /* ── Layout ── */
        .app-outer {
          max-width: 480px;
          margin: 0 auto;
          padding: 24px 16px 60px;
        }
        .tabs-nav {
          display: flex;
          background: #13131f;
          border-radius: 12px;
          padding: 4px;
          margin-bottom: 20px;
          border: 1px solid #1e1e2e;
          gap: 2px;
        }

        /* ── Desktop layout (≥ 768px) ── */
        @media (min-width: 768px) {
          .app-outer {
            max-width: 1000px;
            display: flex;
            align-items: flex-start;
            gap: 24px;
            padding: 40px 32px 60px;
          }
          .sidebar {
            width: 220px;
            flex-shrink: 0;
            position: sticky;
            top: 40px;
          }
          .main-content {
            flex: 1;
            min-width: 0;
          }
          .tabs-nav {
            flex-direction: column;
            background: #13131f;
            border-radius: 14px;
            padding: 6px;
            margin-bottom: 0;
            border: 1px solid #1e1e2e;
            gap: 2px;
          }
          .tab-btn {
            text-align: left;
            padding: 11px 16px;
            border-radius: 10px;
            font-size: 14px;
            flex: none;
          }
          .tab-btn.active {
            background: linear-gradient(135deg, rgba(232,121,249,0.15), rgba(244,63,94,0.1));
            color: #f8fafc;
            border: 1px solid rgba(232,121,249,0.25);
          }
          .header-desktop-hidden { display: none; }
          .style-indicator-sidebar {
            margin-top: 16px;
            background: #13131f;
            border: 1px solid #1e1e2e;
            border-radius: 12px;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          }
        }

        /* ── Mobile: hide sidebar-only elements ── */
        @media (max-width: 767px) {
          .sidebar { width: 100%; }
          .style-indicator-sidebar { display: none; }
          .header-desktop-hidden { display: flex; }
        }
      `}</style>

      <div className="app-outer">
        {/* Sidebar (desktop) / Top header (mobile) */}
        <div className="sidebar">
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
            <div style={{
              width: 40, height: 40,
              background: "linear-gradient(135deg, #e879f9, #f43f5e)",
              borderRadius: 12, display: "flex", alignItems: "center",
              justifyContent: "center", fontSize: 20, flexShrink: 0,
            }}>💘</div>
            <div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700, lineHeight: 1 }}>
                Rizz<span style={{ color: "#e879f9" }}>AI</span>
              </div>
              <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Powered by Groq · Llama 3.3 70B</div>
            </div>
            {/* Style indicator — visible on mobile only */}
            <div className="header-desktop-hidden" style={{ marginLeft: "auto", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 15 }}>{currentStyle.emoji}</span>
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{currentStyle.label}</span>
            </div>
          </div>

          {/* Tabs nav */}
          <div className="tabs-nav">
            {TABS.map(t => (
              <button
                key={t.id}
                className={`tab-btn${tab === t.id ? " active" : ""}`}
                onClick={() => setTab(t.id)}
              >{t.label}</button>
            ))}
          </div>

          {/* Style indicator — desktop sidebar */}
          <div className="style-indicator-sidebar">
            <span style={{ fontSize: 20 }}>{currentStyle.emoji}</span>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{currentStyle.label}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Style actif</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="main-content">
          {tab === "analyse" && <AnalyseTab style={currentStyle} onUseAccroche={handleUseAccroche} />}
          {tab === "reply"   && <ReplyTab   style={currentStyle} initialConvId={pendingConvId} onConvLoaded={() => setPendingConvId(null)} />}
          {tab === "train"   && <TrainTab />}
          {tab === "style"   && <StyleTab flairStyle={flairStyle} setFlairStyle={setFlairStyle} />}
        </div>
      </div>
    </div>
  );
}
