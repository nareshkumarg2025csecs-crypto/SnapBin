import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";
import { useCreatePaste } from "../hooks/usePaste";
import { LANGUAGE_LABELS } from "../lib/utils";

const EXPIRATION_OPTIONS = [
  { value: "10m", label: "10 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "1d", label: "1 Day" },
  { value: "1w", label: "1 Week" },
  { value: "never", label: "Never" },
] as const;

const SUPPORTED_LANGUAGES_LIST = [
  "plaintext","javascript","typescript","python","java","c","cpp","csharp",
  "go","rust","ruby","php","swift","kotlin","html","css","json","yaml",
  "toml","markdown","sql","bash","dockerfile","xml",
] as const;

type Language = typeof SUPPORTED_LANGUAGES_LIST[number];
type Expiration = "10m" | "1h" | "1d" | "1w" | "never";

const monacoLangMap: Record<string, string> = {
  plaintext: "plaintext", javascript: "javascript", typescript: "typescript",
  python: "python", java: "java", c: "c", cpp: "cpp", csharp: "csharp",
  go: "go", rust: "rust", ruby: "ruby", php: "php", swift: "swift",
  kotlin: "kotlin", html: "html", css: "css", json: "json", yaml: "yaml",
  toml: "plaintext", markdown: "markdown", sql: "sql", bash: "shell",
  dockerfile: "dockerfile", xml: "xml",
};

export default function CreatePaste() {
  const navigate = useNavigate();
  const { create, loading } = useCreatePaste();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [language, setLanguage] = useState<Language>("plaintext");
  const [expiration, setExpiration] = useState<Expiration>("never");
  const [visibility, setVisibility] = useState<"public" | "unlisted">("public");
  const [burnAfterRead, setBurnAfterRead] = useState<boolean>(false);

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error("Paste content cannot be empty");
      return;
    }

    const toastId = toast.loading("Creating paste...");

    try {
      const data = {
        title: title.trim() || "Untitled Paste",
        content,
        language,
        expiration,
        visibility,
        burnAfterRead,
      };

      console.log("[CreatePaste] Submitting data:", data);

      const response = await create(data);

      if (!response || !response.id) {
        throw new Error("Paste creation failed.");
      }

      console.log("[CreatePaste] Navigating to:", `/paste/${response.id}`);
      toast.success("Paste created successfully!", { id: toastId });
      navigate(`/paste/${response.id}`, { state: { paste: response } });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create paste";
      console.error("[CreatePaste] Exception caught during creation:", err);
      toast.error(msg, { id: toastId });
    }
  };

  return (
    <div className="container-app" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div style={{ marginBottom: "32px" }}>
          <span className="section-label">New Paste</span>
          <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em", marginTop: "8px" }}>
            Create a Paste
          </h1>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "24px" }} className="lg-grid">
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <input
              type="text"
              placeholder="Paste title (optional)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="input-field"
              id="paste-title"
              style={{ fontSize: "16px", fontWeight: 500 }}
            />

            <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E1D8", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", backgroundColor: "#F0ECE5", borderBottom: "1px solid #E5E1D8" }}>
                <div style={{ display: "flex", gap: "6px" }}>
                  {["#FF5F57", "#FFBD2E", "#28CA42"].map((c) => (
                    <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />
                  ))}
                </div>
                <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#6B6560" }}>
                  {language} · {content.split("\n").length} lines
                </span>
              </div>

              <div style={{ width: "100%" }}>
                <Editor
                  height="460px"
                  language={monacoLangMap[language] ?? "plaintext"}
                  value={content}
                  onChange={(val) => setContent(val ?? "")}
                  theme="vs"
                  options={{
                    fontSize: 14,
                    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                    minimap: { enabled: false },
                    lineNumbers: "on",
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    padding: { top: 16, bottom: 16 },
                    renderLineHighlight: "none",
                    overviewRulerBorder: false,
                    hideCursorInOverviewRuler: true,
                    folding: true,
                    tabSize: 2,
                    automaticLayout: true,
                  }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div className="card" style={{ padding: "24px" }}>
              <p className="section-label" style={{ marginBottom: "20px" }}>Settings</p>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label htmlFor="language-select" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6B6560", marginBottom: "6px" }}>
                    Language
                  </label>
                  <select
                    id="language-select"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="select-field"
                    style={{ fontSize: "14px" }}
                  >
                    {SUPPORTED_LANGUAGES_LIST.map((lang) => (
                      <option key={lang} value={lang}>
                        {LANGUAGE_LABELS[lang] ?? lang}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="expiration-select" style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "#6B6560", marginBottom: "6px" }}>
                    Expires In
                  </label>
                  <select
                    id="expiration-select"
                    value={expiration}
                    onChange={(e) => setExpiration(e.target.value as Expiration)}
                    className="select-field"
                    style={{ fontSize: "14px" }}
                  >
                    {EXPIRATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p style={{ fontSize: "12px", fontWeight: 600, color: "#6B6560", marginBottom: "6px" }}>Visibility</p>
                  <div style={{ display: "flex", gap: "8px" }}>
                    {(["public", "unlisted"] as const).map((v) => (
                      <button
                        key={v}
                        id={`visibility-${v}`}
                        onClick={() => setVisibility(v)}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          padding: "8px",
                          fontSize: "13px",
                          fontWeight: 500,
                          borderRadius: "8px",
                          border: "1px solid",
                          cursor: "pointer",
                          transition: "all 0.15s",
                          borderColor: visibility === v ? "#C1512D" : "#E5E1D8",
                          color: visibility === v ? "#C1512D" : "#6B6560",
                          backgroundColor: visibility === v ? "rgba(193,81,45,0.08)" : "transparent",
                        }}
                      >
                        {v === "public" ? <Eye size={13} /> : <EyeOff size={13} />}
                        {v === "public" ? "Public" : "Unlisted"}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    id="burn-after-read-toggle"
                    onClick={() => setBurnAfterRead((b) => !b)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                      borderRadius: "8px",
                      border: "1px solid",
                      cursor: "pointer",
                      transition: "all 0.15s",
                      borderColor: burnAfterRead ? "rgba(193,81,45,0.4)" : "#E5E1D8",
                      backgroundColor: burnAfterRead ? "rgba(193,81,45,0.08)" : "transparent",
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: 500, color: burnAfterRead ? "#C1512D" : "#6B6560" }}>
                      <Flame size={14} /> Burn After Read
                    </span>
                    <div style={{ width: "32px", height: "18px", borderRadius: "9px", backgroundColor: burnAfterRead ? "#C1512D" : "#E5E1D8", position: "relative", transition: "background-color 0.2s" }}>
                      <div style={{
                        position: "absolute",
                        top: "2px",
                        left: burnAfterRead ? "16px" : "2px",
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        backgroundColor: "white",
                        transition: "left 0.2s",
                      }} />
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <button
              id="create-paste-btn"
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin" /> Creating...</>
              ) : (
                "Create Paste"
              )}
            </button>

            <p style={{ fontSize: "12px", textAlign: "center", color: "#6B6560" }}>
              Pastes are public by default. Use &quot;Unlisted&quot; for private sharing.
            </p>
          </div>
        </div>
      </motion.div>

      <style>{`
        @media (min-width: 1024px) {
          .lg-grid {
            grid-template-columns: 1fr 320px !important;
          }
        }
      `}</style>
    </div>
  );
}
