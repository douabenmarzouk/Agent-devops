import { useState, useEffect, useRef } from "react";

const API = "http://localhost:8000";

// ─── Severity Badge ───────────────────────────────────────────────────────────
function SeverityBadge({ level, count }) {
  const cfg = {
    critical: { bg: "#ff2d2d22", border: "#ff2d2d", text: "#ff6b6b", label: "CRITICAL" },
    high:     { bg: "#ff6b0022", border: "#ff6b00", text: "#ff9f43", label: "HIGH" },
    medium:   { bg: "#ffd70022", border: "#ffd700", text: "#ffd700", label: "MEDIUM" },
    low:      { bg: "#00ff8822", border: "#00ff88", text: "#00ff88", label: "LOW" },
  };
  const c = cfg[level] || cfg.low;
  return (
    <span style={{
      background: c.bg, border: `1px solid ${c.border}`, color: c.text,
      borderRadius: 4, padding: "2px 10px", fontSize: 11,
      fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, letterSpacing: 1,
    }}>
      {count > 0 ? `${count}× ` : ""}{c.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ icon, value, label, accent }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, #0d1117 0%, #161b22 100%)",
      border: `1px solid ${accent}33`, borderRadius: 12,
      padding: "20px 24px", flex: 1, minWidth: 140,
      boxShadow: `0 0 20px ${accent}11`,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 4px 30px ${accent}33`; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = `0 0 20px ${accent}11`; }}
    >
      <div style={{ fontSize: 24, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: accent, fontFamily: "'JetBrains Mono', monospace" }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8b949e", marginTop: 4, textTransform: "uppercase", letterSpacing: 1 }}>{label}</div>
    </div>
  );
}

// ─── Answer Block ─────────────────────────────────────────────────────────────
function AnswerBlock({ item }) {
  const lines = item.answer.split("\n");
  return (
    <div style={{
      background: "#0d1117", border: "1px solid #30363d",
      borderRadius: 12, padding: 24, marginBottom: 16,
      animation: "fadeIn 0.4s ease",
    }}>
      {/* Question */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <span style={{
          background: "#1f6feb22", border: "1px solid #1f6feb",
          borderRadius: 6, padding: "4px 10px", fontSize: 11,
          color: "#58a6ff", fontFamily: "'JetBrains Mono', monospace",
          whiteSpace: "nowrap", marginTop: 2,
        }}>QUERY</span>
        <span style={{ color: "#e6edf3", fontSize: 14, lineHeight: 1.6 }}>{item.question}</span>
      </div>

      {/* Severity row */}
      {item.severity && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
          {item.severity.critical > 0 && <SeverityBadge level="critical" count={item.severity.critical} />}
          {item.severity.high > 0 && <SeverityBadge level="high" count={item.severity.high} />}
          {item.severity.medium > 0 && <SeverityBadge level="medium" count={item.severity.medium} />}
          {item.severity.low > 0 && <SeverityBadge level="low" count={item.severity.low} />}
        </div>
      )}

      {/* Answer */}
      <div style={{
        background: "#161b22", borderRadius: 8, padding: 16,
        fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
        lineHeight: 1.8, color: "#c9d1d9",
      }}>
        {lines.map((line, i) => {
          const isCritical = line.toUpperCase().includes("CRITICAL");
          const isHigh = line.toUpperCase().includes("HIGH");
          const isMedium = line.toUpperCase().includes("MEDIUM");
          const isLow = line.toUpperCase().includes("LOW");
          const isSolution = line.toUpperCase().includes("SOLUTION");
          const isProblem = line.toUpperCase().includes("PROBLÈME") || line.toUpperCase().includes("PROBLEME");
          
          let color = "#c9d1d9";
          if (isCritical) color = "#ff6b6b";
          else if (isHigh) color = "#ff9f43";
          else if (isMedium) color = "#ffd700";
          else if (isLow || isSolution) color = "#00ff88";
          else if (isProblem) color = "#58a6ff";

          return (
            <div key={i} style={{ color, marginBottom: line === "" ? 8 : 2 }}>
              {line || <br />}
            </div>
          );
        })}
      </div>

      {/* Sources */}
      {item.sources && item.sources.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ color: "#8b949e", fontSize: 11, textTransform: "uppercase", letterSpacing: 1 }}>Sources :</span>
          {item.sources.map((s, i) => (
            <span key={i} style={{
              background: "#21262d", border: "1px solid #30363d",
              borderRadius: 4, padding: "2px 8px", fontSize: 11,
              color: "#8b949e", fontFamily: "'JetBrains Mono', monospace",
            }}>{s.split("\\").pop().split("/").pop()}</span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── File List ────────────────────────────────────────────────────────────────
function FileItem({ name, onDelete }) {
  const isYaml = name.endsWith(".yaml") || name.endsWith(".yml");
  const isPdf = name.endsWith(".pdf");
  const icon = isYaml ? "📄" : isPdf ? "📕" : "📝";
  const color = isYaml ? "#58a6ff" : isPdf ? "#ff9f43" : "#00ff88";
  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", borderRadius: 6, background: "#161b22",
      border: "1px solid #21262d", marginBottom: 6,
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color }}>
        {icon} {name}
      </span>
      <button onClick={() => onDelete(name)} style={{
        background: "none", border: "none", cursor: "pointer",
        color: "#6e7681", fontSize: 14, padding: "0 4px",
        transition: "color 0.2s",
      }}
      onMouseEnter={e => e.target.style.color = "#ff6b6b"}
      onMouseLeave={e => e.target.style.color = "#6e7681"}
      >✕</button>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState("chat");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef();
  const chatEndRef = useRef();

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [history]);

  const fetchStats = async () => {
    try {
      const r = await fetch(`${API}/api/stats`);
      const d = await r.json();
      setStats(d);
    } catch { setStats(null); }
  };

  const handleUpload = async (files) => {
    if (!files.length) return;
    setUploading(true);
    setStatus("📤 Upload en cours...");
    const form = new FormData();
    Array.from(files).forEach(f => form.append("files", f));
    try {
      const r = await fetch(`${API}/api/upload`, { method: "POST", body: form });
      const d = await r.json();
      setStatus(`✅ ${d.uploaded.length} fichier(s) uploadé(s)`);
      fetchStats();
    } catch { setStatus("❌ Erreur upload"); }
    setUploading(false);
  };

  const handleIndex = async () => {
    setIndexing(true);
    setStatus("⚙️ Indexation en cours...");
    try {
      const r = await fetch(`${API}/api/index`, { method: "POST" });
      const d = await r.json();
      if (d.success) {
        setStatus("✅ Indexation terminée !");
        fetchStats();
      } else {
        setStatus("❌ " + (d.error || "Erreur inconnue"));
        console.error("Erreur indexation:", d);
      }
    } catch { setStatus("❌ Erreur serveur"); }
    setIndexing(false);
  };

  const handleAsk = async () => {
    if (!question.trim() || loading) return;
    const q = question;
    setQuestion("");
    setLoading(true);
    setHistory(h => [...h, { question: q, answer: null, loading: true }]);
    try {
      const r = await fetch(`${API}/api/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const d = await r.json();
      setHistory(h => h.map((item, i) =>
        i === h.length - 1 ? { ...item, ...d, loading: false } : item
      ));
    } catch (e) {
      setHistory(h => h.map((item, i) =>
        i === h.length - 1 ? { ...item, answer: "❌ Erreur serveur", loading: false } : item
      ));
    }
    setLoading(false);
  };

  const handleDelete = async (filename) => {
    try {
      await fetch(`${API}/api/files/${filename}`, { method: "DELETE" });
      fetchStats();
    } catch {}
  };

  const quickQuestions = [
    "Analyse la sécurité des fichiers YAML",
    "Quelles sont les vulnérabilités CRITICAL ?",
    "Recommandations NIST pour Docker",
    "Le pod tourne-t-il en root ?",
  ];

  return (
    <div style={{
      minHeight: "100vh", background: "#010409",
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      color: "#e6edf3",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 6px; } 
        ::-webkit-scrollbar-track { background: #0d1117; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes scanline { 0% { top: -10%; } 100% { top: 110%; } }
      `}</style>

      {/* Header */}
      <div style={{
        borderBottom: "1px solid #21262d",
        background: "linear-gradient(90deg, #0d1117 0%, #161b22 50%, #0d1117 100%)",
        padding: "0 32px",
        position: "sticky", top: 0, zIndex: 100,
        backdropFilter: "blur(20px)",
      }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 8,
              background: "linear-gradient(135deg, #1f6feb, #58a6ff)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, boxShadow: "0 0 20px #1f6feb44",
            }}>🛡️</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: -0.5, color: "#e6edf3" }}>
                DevSecOps <span style={{ color: "#58a6ff" }}>RAG</span> Agent
              </div>
              <div style={{ fontSize: 11, color: "#8b949e", fontFamily: "'JetBrains Mono', monospace" }}>
                LangChain · Groq · FAISS
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 8, height: 8, borderRadius: "50%",
              background: stats?.indexed ? "#00ff88" : "#ff6b6b",
              boxShadow: `0 0 8px ${stats?.indexed ? "#00ff88" : "#ff6b6b"}`,
              animation: "pulse 2s infinite",
            }} />
            <span style={{ fontSize: 12, color: "#8b949e", fontFamily: "'JetBrains Mono', monospace" }}>
              {stats?.indexed ? "BASE INDEXÉE" : "NON INDEXÉE"}
            </span>
          </div>
        </div>
      </div>

      <div style={{maxWidth: "100%", margin: "0 auto", padding: "24px 32px" }}>

        {/* Stats */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          <StatCard icon="📁" value={stats?.total_files ?? "—"} label="Fichiers total" accent="#58a6ff" />
          <StatCard icon="📄" value={stats?.yaml_files ?? "—"} label="YAML indexés" accent="#00ff88" />
          <StatCard icon="📕" value={stats?.pdf_files ?? "—"} label="Docs sécurité" accent="#ff9f43" />
          <StatCard icon="🔮" value={stats?.indexed ? "✓" : "✗"} label="Base vectorielle" accent={stats?.indexed ? "#00ff88" : "#ff6b6b"} />
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#0d1117", borderRadius: 10, padding: 4, border: "1px solid #21262d", width: "fit-content" }}>
          {["chat", "fichiers"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "8px 20px", borderRadius: 7, border: "none", cursor: "pointer",
              fontWeight: 600, fontSize: 13, fontFamily: "'DM Sans', sans-serif",
              background: activeTab === tab ? "#1f6feb" : "transparent",
              color: activeTab === tab ? "#fff" : "#8b949e",
              transition: "all 0.2s",
              textTransform: "capitalize",
            }}>
              {tab === "chat" ? "🤖 Chat Audit" : "📂 Fichiers"}
            </button>
          ))}
        </div>

        {/* ── TAB CHAT ── */}
        {activeTab === "chat" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

            {/* Chat area */}
            <div>
              {/* Quick questions */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 11, color: "#8b949e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                  Questions rapides
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {quickQuestions.map((q, i) => (
                    <button key={i} onClick={() => setQuestion(q)} style={{
                      background: "#161b22", border: "1px solid #30363d",
                      borderRadius: 20, padding: "6px 14px", fontSize: 12,
                      color: "#8b949e", cursor: "pointer", fontFamily: "'DM Sans', sans-serif",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "#58a6ff"; e.currentTarget.style.color = "#58a6ff"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "#30363d"; e.currentTarget.style.color = "#8b949e"; }}
                    >{q}</button>
                  ))}
                </div>
              </div>

              {/* History */}
              <div style={{ minHeight: 400, maxHeight: 500, overflowY: "auto", marginBottom: 16 }}>
                {history.length === 0 && (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", height: 300, gap: 12,
                    color: "#8b949e",
                  }}>
                    <div style={{ fontSize: 48 }}>🛡️</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Prêt pour l'audit de sécurité</div>
                    <div style={{ fontSize: 12 }}>Pose une question sur tes fichiers YAML ou Docker</div>
                  </div>
                )}
                {history.map((item, i) => (
                  item.loading
                    ? <div key={i} style={{
                        background: "#0d1117", border: "1px solid #30363d",
                        borderRadius: 12, padding: 24, marginBottom: 16,
                        display: "flex", alignItems: "center", gap: 12,
                      }}>
                        <div style={{
                          width: 20, height: 20, border: "2px solid #58a6ff",
                          borderTopColor: "transparent", borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }} />
                        <span style={{ color: "#8b949e", fontSize: 13 }}>Analyse en cours avec Groq Llama 3...</span>
                      </div>
                    : <AnswerBlock key={i} item={item} />
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <div style={{ display: "flex", gap: 10 }}>
                <input
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleAsk()}
                  placeholder="Ex: Analyse la sécurité de deployment-backend.yaml..."
                  style={{
                    flex: 1, background: "#0d1117", border: "1px solid #30363d",
                    borderRadius: 10, padding: "12px 16px", color: "#e6edf3",
                    fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={e => e.target.style.borderColor = "#58a6ff"}
                  onBlur={e => e.target.style.borderColor = "#30363d"}
                />
                <button onClick={handleAsk} disabled={loading || !question.trim()} style={{
                  background: loading ? "#21262d" : "linear-gradient(135deg, #1f6feb, #58a6ff)",
                  border: "none", borderRadius: 10, padding: "12px 24px",
                  color: "#fff", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "opacity 0.2s",
                  opacity: loading ? 0.6 : 1,
                }}>
                  {loading ? "..." : "Analyser →"}
                </button>
              </div>
            </div>

            {/* Sidebar */}
            <div>
              {/* Index button */}
              <div style={{
                background: "#0d1117", border: "1px solid #21262d",
                borderRadius: 12, padding: 20, marginBottom: 16,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#e6edf3" }}>
                  ⚙️ Pipeline RAG
                </div>
                <button onClick={handleIndex} disabled={indexing} style={{
                  width: "100%", background: indexing ? "#21262d" : "linear-gradient(135deg, #00ff8822, #00ff8811)",
                  border: `1px solid ${indexing ? "#30363d" : "#00ff88"}`,
                  borderRadius: 8, padding: "10px 16px", color: indexing ? "#8b949e" : "#00ff88",
                  fontWeight: 700, fontSize: 13, cursor: indexing ? "not-allowed" : "pointer",
                  fontFamily: "'DM Sans', sans-serif", transition: "all 0.2s",
                }}>
                  {indexing ? "⚙️ Indexation..." : "🚀 Lancer l'indexation"}
                </button>
                {status && (
                  <div style={{
                    marginTop: 10, padding: "8px 12px", borderRadius: 6,
                    background: "#161b22", fontSize: 12,
                    color: status.startsWith("✅") ? "#00ff88" : status.startsWith("❌") ? "#ff6b6b" : "#ffd700",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>{status}</div>
                )}
              </div>

              {/* Legend */}
              <div style={{
                background: "#0d1117", border: "1px solid #21262d",
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#e6edf3" }}>
                  📊 Niveaux de sévérité
                </div>
                {["critical", "high", "medium", "low"].map(l => (
                  <div key={l} style={{ marginBottom: 8 }}>
                    <SeverityBadge level={l} count={0} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB FILES ── */}
        {activeTab === "fichiers" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

            {/* Upload zone */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#e6edf3" }}>
                📤 Upload de fichiers
              </div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files); }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#58a6ff" : "#30363d"}`,
                  borderRadius: 12, padding: 40, textAlign: "center",
                  cursor: "pointer", transition: "all 0.2s",
                  background: dragOver ? "#1f6feb11" : "#0d1117",
                }}
              >
                <div style={{ fontSize: 40, marginBottom: 12 }}>📁</div>
                <div style={{ fontWeight: 600, marginBottom: 6, color: "#e6edf3" }}>
                  Glisse tes fichiers ici
                </div>
                <div style={{ fontSize: 12, color: "#8b949e" }}>
                  YAML · PDF · TXT · HTML
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".yaml,.yml,.pdf,.txt,.html"
                  style={{ display: "none" }}
                  onChange={e => handleUpload(e.target.files)}
                />
              </div>
              {uploading && (
                <div style={{ marginTop: 12, color: "#ffd700", fontSize: 12, fontFamily: "'JetBrains Mono', monospace" }}>
                  📤 Upload en cours...
                </div>
              )}
            </div>

            {/* File list */}
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: "#e6edf3" }}>
                📂 Fichiers indexés ({stats?.total_files ?? 0})
              </div>
              <div style={{ maxHeight: 400, overflowY: "auto" }}>
                {stats?.files?.length > 0
                  ? stats.files.map((f, i) => (
                      <FileItem key={i} name={f} onDelete={handleDelete} />
                    ))
                  : <div style={{ color: "#8b949e", fontSize: 13, padding: 20, textAlign: "center" }}>
                      Aucun fichier pour l'instant
                    </div>
                }
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}