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

export function ReplyCard({ rank, reply, onCopy, copied }) {
  return (
    <div
      onClick={() => onCopy(reply.texte)}
      style={{
        background: "#13131f", border: `1px solid ${copied ? "#10b981" : "#1e1e2e"}`,
        borderRadius: 14, padding: "16px 18px",
        cursor: "pointer", transition: "all 0.2s", marginBottom: 10,
      }}
      onMouseEnter={e => { if (!copied) e.currentTarget.style.borderColor = "#e879f9"; }}
      onMouseLeave={e => { if (!copied) e.currentTarget.style.borderColor = "#1e1e2e"; }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          {rank && <span style={{ fontWeight: 700, fontSize: 13, color: "#475569" }}>#{rank}</span>}
          <Badge cat={reply.categorie} />
        </div>
        <span style={{ fontSize: 12, color: copied ? "#10b981" : "#475569" }}>
          {copied ? "✓ Copié !" : "Copier"}
        </span>
      </div>
      <ScoreBar score={reply.score} />
      <p style={{ fontSize: 14, color: "#e2e8f0", margin: "10px 0 6px", lineHeight: 1.6 }}>
        "{reply.texte}"
      </p>
      {reply.explication && (
        <p style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>{reply.explication}</p>
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
