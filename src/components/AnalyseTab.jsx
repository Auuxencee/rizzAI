import { useState } from "react";
import { PLATFORMS } from "../lib/constants.js";
import { analyseProfile } from "../lib/groq.js";
import { Spinner, InfoBox } from "./UI.jsx";
import AccrocheCard from "./AccrocheCard.jsx";

export default function AnalyseTab({ style, onUseAccroche }) {
  const [platform, setPlatform]     = useState("hinge");
  const [profileDesc, setProfileDesc] = useState("");
  const [result, setResult]         = useState(null);
  const [loading, setLoading]       = useState(false);
  const [regenLoading, setRegenLoading] = useState(false);
  const [error, setError]           = useState(null);

  const handleAnalyse = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const data = await analyseProfile({ profileDesc, platform, style });
      setResult(data);
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  const handleRegen = async () => {
    setRegenLoading(true);
    setError(null);
    try {
      const data = await analyseProfile({ profileDesc, platform, style });
      // Remplace uniquement les accroches, garde l'impression
      setResult(prev => ({ ...prev, accroches: data.accroches }));
    } catch (e) {
      setError(e.message);
    }
    setRegenLoading(false);
  };

  return (
    <div className="fade-in">
      <InfoBox>
        💡 Décris le profil : prénom, âge, bio, centres d'intérêt, photos notables...
        Plus c'est précis, plus les accroches sont percutantes.
      </InfoBox>

      {/* Platform selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {PLATFORMS.map(p => (
          <button
            key={p}
            className={`platform-btn${platform === p ? " active" : ""}`}
            onClick={() => setPlatform(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      <textarea
        className="field"
        rows={5}
        placeholder={`Ex : Léa, 24 ans. Bio : "Accro au café ☕ et aux randos 🏔️". Photos : en montagne, avec son chien golden retriever, soirée déguisée en Mario...`}
        value={profileDesc}
        onChange={e => setProfileDesc(e.target.value)}
        style={{ marginBottom: 14 }}
      />

      <button
        className="btn-primary"
        style={{ width: "100%" }}
        disabled={!profileDesc.trim() || loading}
        onClick={handleAnalyse}
      >
        {loading ? <><Spinner />Analyse en cours...</> : "✨ Générer des accroches"}
      </button>

      {error && <p style={{ color: "#ef4444", marginTop: 12, fontSize: 13 }}>❌ {error}</p>}

      {result && (
        <div className="fade-in" style={{ marginTop: 20 }}>
          {/* Impression générale */}
          <div style={{ background: "#13131f", border: "1px solid #1e1e2e", borderRadius: 16, padding: 20, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Première impression
            </p>
            <p style={{ fontSize: 14, color: "#e2e8f0", lineHeight: 1.6 }}>{result.impression}</p>
            {result.points_forts?.length > 0 && (
              <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6 }}>
                {result.points_forts.map((p, i) => (
                  <span key={i} style={{
                    background: "#1e1e2e", border: "1px solid #2a2a3e",
                    borderRadius: 8, padding: "4px 10px", fontSize: 12, color: "#94a3b8"
                  }}>✓ {p}</span>
                ))}
              </div>
            )}
          </div>

          {/* Accroches header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <p style={{ fontSize: 12, color: "#64748b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              📋 Copier · 👍👎 Avis · ✅ Utiliser
            </p>
            <button
              onClick={handleRegen}
              disabled={regenLoading}
              style={{
                background: "none", border: "1px solid #2a2a3e",
                borderRadius: 10, padding: "6px 14px",
                fontFamily: "'DM Sans', sans-serif", fontWeight: 600, fontSize: 13,
                color: regenLoading ? "#475569" : "#94a3b8",
                cursor: regenLoading ? "not-allowed" : "pointer",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 6,
              }}
              onMouseEnter={e => { if (!regenLoading) { e.currentTarget.style.borderColor = "#e879f9"; e.currentTarget.style.color = "#f8fafc"; }}}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "#2a2a3e"; e.currentTarget.style.color = regenLoading ? "#475569" : "#94a3b8"; }}
            >
              {regenLoading
                ? <><span style={{ width:12,height:12,border:"2px solid #ffffff33",borderTopColor:"#94a3b8",borderRadius:"50%",animation:"spin 0.8s linear infinite",display:"inline-block" }} />Génération...</>
                : "🔄 Nouvelles accroches"}
            </button>
          </div>

          {result.accroches?.map((a, i) => (
            <AccrocheCard
              key={`${i}-${a.texte}`}
              accroche={a}
              profileDesc={profileDesc}
              styleId={style.id}
              onUseAccroche={onUseAccroche}
            />
          ))}
        </div>
      )}
    </div>
  );
}
