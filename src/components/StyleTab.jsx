import { useState } from "react";
import { STYLES } from "../lib/constants.js";

export default function StyleTab({ flairStyle, setFlairStyle }) {
  const [saved, setSaved] = useState(false);
  const currentStyle = STYLES.find(s => s.id === flairStyle);

  return (
    <div className="fade-in">
      <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20, lineHeight: 1.6 }}>
        Choisis ton style de drague — il influence toutes les réponses générées.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24 }}>
        {STYLES.map(s => (
          <button
            key={s.id}
            className={`style-chip${flairStyle === s.id ? " active" : ""}`}
            onClick={() => { setFlairStyle(s.id); setSaved(false); }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{s.emoji}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.label}</div>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{s.desc}</div>
              </div>
              {flairStyle === s.id && (
                <div style={{
                  marginLeft: "auto", width: 20, height: 20,
                  background: "linear-gradient(135deg, #e879f9, #f43f5e)",
                  borderRadius: 99, display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 11, color: "white",
                }}>✓</div>
              )}
            </div>
          </button>
        ))}
      </div>

      <button
        className="btn-primary"
        style={{ width: "100%" }}
        onClick={() => setSaved(true)}
      >
        {saved ? "✓ Style sauvegardé !" : "Sauvegarder le style"}
      </button>

      {saved && (
        <div className="fade-in" style={{
          marginTop: 16, background: "#13131f",
          border: "1px solid #1e1e2e", borderRadius: 16,
          padding: 20, textAlign: "center",
        }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>{currentStyle.emoji}</div>
          <p style={{ fontWeight: 700, fontSize: 15 }}>{currentStyle.label} activé</p>
          <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>{currentStyle.desc}</p>
        </div>
      )}
    </div>
  );
}
