import { useState } from "react";
import { PLATFORMS } from "../lib/constants.js";
import { analyseProfile } from "../lib/groq.js";
import { Badge, ScoreBar, Spinner, InfoBox } from "./UI.jsx";

export default function AnalyseTab({ style }) {
  const [platform, setPlatform] = useState("hinge");
  const [profileDesc, setProfileDesc] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

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

  const handleCopy = (text, i) => {
    navigator.clipboard.writeText(text);
    setCopied(i);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="fade-in">
      <InfoBox>
        💡 Décris le profil : prénom, âge, bio, centres d'intérêt, photos notables...
        Plus c'est précis, meilleures sont les accroches.
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
          {/* Impression */}
          <div style={{ background: "#13131f", border: "1px solid #1e1e2e", borderRadius: 16, padding: 20, marginBottom: 12 }}>
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

          {/* Accroches */}
          <p style={{ fontSize: 12, color: "#64748b", marginBottom: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Accroches générées
          </p>
          {result.accroches?.map((a, i) => (
            <div
              key={i}
              className="fade-in"
              onClick={() => handleCopy(a.texte, i)}
              style={{
                background: "#13131f", border: `1px solid ${copied === i ? "#10b981" : "#1e1e2e"}`,
                borderRadius: 14, padding: "16px 18px", cursor: "pointer",
                transition: "all 0.2s", marginBottom: 8,
              }}
              onMouseEnter={e => { if (copied !== i) e.currentTarget.style.borderColor = "#e879f9"; }}
              onMouseLeave={e => { if (copied !== i) e.currentTarget.style.borderColor = "#1e1e2e"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <Badge cat={a.categorie} />
                <span style={{ fontSize: 12, color: copied === i ? "#10b981" : "#475569" }}>
                  {copied === i ? "✓ Copié !" : "Copier"}
                </span>
              </div>
              <ScoreBar score={a.score} />
              <p style={{ fontSize: 14, color: "#e2e8f0", marginTop: 10, lineHeight: 1.6 }}>"{a.texte}"</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
