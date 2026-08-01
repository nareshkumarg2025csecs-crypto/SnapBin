import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import {
  Copy,
  Download,
  Trash2,
  Eye,
  Clock,
  Flame,
  ArrowLeft,
  Loader2,
  FileText,
  Link2,
} from "lucide-react";
import { pastesApi, Paste } from "../lib/api";
import {
  copyToClipboard,
  downloadAsFile,
  formatDate,
  getTimeUntilExpiry,
  getDeleteToken,
  removeDeleteToken,
} from "../lib/utils";
import { useDeletePaste } from "../hooks/usePaste";
import LanguageBadge from "../components/LanguageBadge";

const monacoLangMap: Record<string, string> = {
  plaintext: "plaintext", javascript: "javascript", typescript: "typescript",
  python: "python", java: "java", c: "c", cpp: "cpp", csharp: "csharp",
  go: "go", rust: "rust", ruby: "ruby", php: "php", swift: "swift",
  kotlin: "kotlin", html: "html", css: "css", json: "json", yaml: "yaml",
  toml: "plaintext", markdown: "markdown", sql: "sql", bash: "shell",
  dockerfile: "dockerfile", xml: "xml",
};

export default function ViewPaste() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { remove, loading: deleting } = useDeletePaste();

  const hasFetched = useRef(false);

  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [burned, setBurned] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const deleteToken = id ? getDeleteToken(id) : null;
  const canDelete = !!deleteToken;

  useEffect(() => {
    if (!id) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const statePaste = location.state?.paste as Paste | undefined;
    if (statePaste && statePaste.id === id) {
      setPaste(statePaste);
      setLoading(false);
      return;
    }

    setLoading(true);
    let cancelled = false;

    pastesApi.getById(id)
      .then(({ paste: p, burned: b }) => {
        if (cancelled) return;
        setPaste(p);
        setBurned(b);
        if (b) {
          toast("This paste was consumed and deleted.", { icon: "🔥" });
        }
      })
      .catch((err: Error & { code?: string; status?: number }) => {
        if (cancelled) return;
        setError(err.message);
        setErrorCode((err as any).code ?? null);
        if ((err as any).code === "PASTE_EXPIRED") {
          toast.error("This paste has expired.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  const handleCopy = async () => {
    if (!paste) return;
    await copyToClipboard(paste.content);
    toast.success("Content copied to clipboard!");
  };

  const handleCopyLink = async () => {
    await copyToClipboard(window.location.href);
    toast.success("Link copied!");
  };

  const handleDownload = () => {
    if (!paste) return;
    downloadAsFile(paste.content, paste.title, paste.language);
    toast.success("Download started");
  };

  const handleDelete = async () => {
    if (!id || !deleteToken) return;
    const confirmed = window.confirm("Delete this paste permanently?");
    if (!confirmed) return;
    const ok = await remove(id, deleteToken);
    if (ok) {
      removeDeleteToken(id);
      toast.success("Paste deleted");
      navigate("/browse");
    } else {
      toast.error("Failed to delete paste — token may be invalid");
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "#C1512D" }} />
      </div>
    );
  }

  if (error || !paste) {
    const isExpired = errorCode === "PASTE_EXPIRED";
    const isNotFound = errorCode === "PASTE_NOT_FOUND";
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#F0ECE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          {isExpired ? <Clock size={28} style={{ color: "#C1512D" }} /> : <FileText size={28} style={{ color: "#6B6560" }} />}
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>
          {isExpired ? "Paste expired" : isNotFound ? "Paste not found" : "Something went wrong"}
        </h1>
        <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "32px", lineHeight: 1.6 }}>
          {error ?? "The paste you're looking for doesn't exist or has been deleted."}
        </p>
        <Link to="/create" className="btn-primary">
          Create a New Paste
        </Link>
      </div>
    );
  }

  if (burned) {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", backgroundColor: "rgba(193,81,45,0.1)" }}>
          <Flame size={32} style={{ color: "#C1512D" }} />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>
          Paste consumed
        </h1>
        <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "32px", lineHeight: 1.6 }}>
          This was a burn-after-read paste. It has been permanently deleted after your first view.
        </p>
        <Link to="/create" className="btn-primary">
          Create Your Own
        </Link>
      </div>
    );
  }

  return (
    <div className="container-app" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#6B6560", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginTop: "4px" }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1 style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "8px" }}>
              {paste.title}
            </h1>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
              <LanguageBadge language={paste.language} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#6B6560" }}>
                <Eye size={13} /> {paste.viewCount.toLocaleString()} views
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#6B6560" }}>
                <Clock size={13} /> {formatDate(paste.createdAt)}
              </span>
              {paste.expiresAt && (
                <span style={{ fontSize: "13px", color: "#6B6560" }}>
                  Expires {getTimeUntilExpiry(paste.expiresAt)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "16px" }}>
          <button id="copy-content-btn" onClick={handleCopy} className="btn-ghost" style={{ fontSize: "13px", padding: "8px 14px" }}>
            <Copy size={13} /> Copy
          </button>
          <button id="copy-link-btn" onClick={handleCopyLink} className="btn-ghost" style={{ fontSize: "13px", padding: "8px 14px" }}>
            <Link2 size={13} /> Copy Link
          </button>
          <button id="download-btn" onClick={handleDownload} className="btn-ghost" style={{ fontSize: "13px", padding: "8px 14px" }}>
            <Download size={13} /> Download
          </button>
          <button
            id="raw-view-btn"
            onClick={() => setShowRaw((r) => !r)}
            className="btn-ghost"
            style={{ fontSize: "13px", padding: "8px 14px", ...(showRaw ? { borderColor: "#C1512D", color: "#C1512D", backgroundColor: "rgba(193,81,45,0.08)" } : {}) }}
          >
            <FileText size={13} /> {showRaw ? "Rendered" : "Raw"}
          </button>
          {canDelete && (
            <button
              id="delete-paste-btn"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-ghost"
              style={{ fontSize: "13px", padding: "8px 14px", borderColor: "#ef4444", color: "#ef4444" }}
            >
              {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />} Delete
            </button>
          )}
        </div>

        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E1D8" }}>
          {showRaw ? (
            <pre style={{ padding: "24px", fontFamily: "'JetBrains Mono', monospace", fontSize: "13px", lineHeight: 1.7, overflowX: "auto", maxHeight: "70vh", backgroundColor: "#FFFFFF", color: "#111111", whiteSpace: "pre-wrap", wordBreak: "break-all" }}>
              {paste.content}
            </pre>
          ) : (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#F0ECE5", borderBottom: "1px solid #E5E1D8" }}>
                {["#FF5F57", "#FFBD2E", "#28CA42"].map((c) => (
                  <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />
                ))}
                <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#6B6560", marginLeft: "8px" }}>
                  {paste.title}
                </span>
              </div>
              <Editor
                height="520px"
                language={monacoLangMap[paste.language] ?? "plaintext"}
                value={paste.content}
                theme="vs"
                options={{
                  readOnly: true,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: "none",
                  overviewRulerBorder: false,
                  domReadOnly: true,
                  automaticLayout: true,
                }}
              />
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
