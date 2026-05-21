import { useState } from "react";
import { STYLES } from "./lib/constants.js";
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

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", fontFamily: "'DM Sans', sans-serif", color: "#f8fafc" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=Playfair+Display:ital,wght@0,700;1,400&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #0a0a0f; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        textarea, input, select { outline: none; }
        .tab-btn {
          background: none; border: none; cursor: pointer;
          padding: 8px 0; border-radius: 10px;
          font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500;
          transition: all 0.2s; color: #94a3b8; flex: 1;
        }
        .tab-btn.active { background: #1e1e2e; color: #f8fafc; }
        .tab-btn:hover:not(.active) { color: #e2e8f0; }
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
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", padding: "24px 16px 60px" }}>
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
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 15 }}>{currentStyle.emoji}</span>
            <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500 }}>{currentStyle.label}</span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", background: "#13131f",
          borderRadius: 12, padding: 4, marginBottom: 20,
          border: "1px solid #1e1e2e", gap: 2,
        }}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`tab-btn${tab === t.id ? " active" : ""}`}
              onClick={() => setTab(t.id)}
            >{t.label}</button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "analyse" && <AnalyseTab style={currentStyle} />}
        {tab === "reply"   && <ReplyTab   style={currentStyle} />}
        {tab === "train"   && <TrainTab />}
        {tab === "style"   && <StyleTab flairStyle={flairStyle} setFlairStyle={setFlairStyle} />}
      </div>
    </div>
  );
}
