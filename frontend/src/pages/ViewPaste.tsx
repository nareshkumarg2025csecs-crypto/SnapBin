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
  EyeOff,
} from "lucide-react";
import { pastesApi, Paste, SUPPORTED_LANGUAGES } from "../lib/api";
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

  const [enteredViewPassword, setEnteredViewPassword] = useState("");
  const [showEnteredViewPassword, setShowEnteredViewPassword] = useState(false);
  const [viewPasswordLoading, setViewPasswordLoading] = useState(false);
  const [viewPasswordError, setViewPasswordError] = useState<string | null>(null);

  const [showEditPasswordModal, setShowEditPasswordModal] = useState(false);
  const [editPassword, setEditPassword] = useState("");
  const [showEditPasswordText, setShowEditPasswordText] = useState(false);
  const [editPasswordError, setEditPasswordError] = useState<string | null>(null);
  const [editPasswordLoading, setEditPasswordLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const deleteToken = id ? getDeleteToken(id) : null;
  const canDelete = !!deleteToken;

  useEffect(() => {
    if (!id) return;
    if (hasFetched.current) return;
    hasFetched.current = true;

    const statePaste = location.state?.paste as Paste | undefined;
    if (statePaste && statePaste.id === id) {
      if (statePaste.hasViewPassword) {
        setLoading(true);
        pastesApi.getById(id)
          .then(({ paste: p, burned: b }) => {
            setPaste(p);
            setBurned(b);
          })
          .catch((err: Error & { code?: string; status?: number }) => {
            setError(err.message);
            setErrorCode(err.code ?? null);
            if (err.code === "PASTE_EXPIRED") {
              toast.error("This paste has expired.");
            }
          })
          .finally(() => {
            setLoading(false);
          });
        return;
      }
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
      })
      .catch((err: Error & { code?: string; status?: number }) => {
        if (cancelled) return;
        setError(err.message);
        setErrorCode(err.code ?? null);
        if (err.code === "PASTE_EXPIRED") {
          toast.error("This paste has expired.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, location.state]);

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

  const handleViewPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setViewPasswordLoading(true);
    setViewPasswordError(null);
    try {
      const { paste: p, burned: b } = await pastesApi.getById(id, enteredViewPassword);
      setPaste(p);
      setBurned(b);
      setError(null);
      setErrorCode(null);
    } catch (err: any) {
      setViewPasswordError(err.message || "Invalid password");
      setErrorCode(err.code || null);
    } finally {
      setViewPasswordLoading(false);
    }
  };

  const handleStartEdit = () => {
    setEditPassword("");
    setEditPasswordError(null);
    setShowEditPasswordModal(true);
  };

  const handleVerifyEditPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !paste) return;
    setEditPasswordLoading(true);
    setEditPasswordError(null);
    try {
      await pastesApi.update(id, {
        editPassword,
        title: paste.title,
        content: paste.content,
        language: paste.language,
      });
      setEditTitle(paste.title);
      setEditContent(paste.content);
      setEditLanguage(paste.language);
      setIsEditing(true);
      setShowEditPasswordModal(false);
    } catch (err: any) {
      setEditPasswordError(err.message || "Invalid edit password");
    } finally {
      setEditPasswordLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    setSaveLoading(true);
    try {
      const updated = await pastesApi.update(id, {
        editPassword,
        title: editTitle.trim() || "Untitled Paste",
        content: editContent,
        language: editLanguage,
      });
      setPaste(updated);
      setIsEditing(false);
      toast.success("Paste updated successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to update paste");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "50vh" }}>
        <Loader2 size={28} className="animate-spin" style={{ color: "#C1512D" }} />
      </div>
    );
  }

  if (errorCode === "VIEW_PASSWORD_REQUIRED" || errorCode === "INVALID_VIEW_PASSWORD") {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#F0ECE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px" }}>
          <EyeOff size={28} style={{ color: "#C1512D" }} />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>
          Password Protected
        </h1>
        <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "24px", lineHeight: 1.6 }}>
          This paste is protected by a view password. Please enter the password to view its contents.
        </p>

        <form onSubmit={handleViewPasswordSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ position: "relative" }}>
            <input
              type={showEnteredViewPassword ? "text" : "password"}
              placeholder="Enter password"
              value={enteredViewPassword}
              onChange={(e) => setEnteredViewPassword(e.target.value)}
              className="input-field"
              style={{ paddingRight: "40px" }}
              required
            />
            <button
              type="button"
              onClick={() => setShowEnteredViewPassword(!showEnteredViewPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6B6560",
                display: "flex",
                alignItems: "center"
              }}
            >
              {showEnteredViewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {viewPasswordError && (
            <p style={{ fontSize: "13px", color: "#ef4444", margin: 0, textAlign: "left" }}>
              {viewPasswordError}
            </p>
          )}

          <button
            type="submit"
            disabled={viewPasswordLoading}
            className="btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "14px" }}
          >
            {viewPasswordLoading ? (
              <><Loader2 size={16} className="animate-spin" /> Unlocking...</>
            ) : (
              "Unlock Paste"
            )}
          </button>
        </form>
      </div>
    );
  }

  if (errorCode === "PASTE_ALREADY_CONSUMED") {
    return (
      <div style={{ maxWidth: "480px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ width: "64px", height: "64px", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", backgroundColor: "rgba(193,81,45,0.1)" }}>
          <Flame size={32} style={{ color: "#C1512D" }} />
        </div>
        <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#111111", marginBottom: "12px" }}>
          Paste already consumed
        </h1>
        <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "32px", lineHeight: 1.6 }}>
          This burn-after-read paste was already viewed and permanently deleted. It cannot be accessed again.
        </p>
        <Link to="/create" className="btn-primary">
          Create Your Own
        </Link>
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

  return (
    <div className="container-app" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {burned && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 18px",
              marginBottom: "24px",
              borderRadius: "12px",
              backgroundColor: "rgba(193,81,45,0.07)",
              border: "1px solid rgba(193,81,45,0.25)",
            }}
          >
            <Flame size={16} style={{ color: "#C1512D", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "#8B3520", lineHeight: 1.6, margin: 0 }}>
              <strong style={{ fontWeight: 700 }}>Burn-after-read — </strong>
              this paste has been permanently deleted from the server. This is the only time it can be viewed.
            </p>
          </motion.div>
        )}

        <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => navigate(-1)}
            style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "14px", color: "#6B6560", background: "none", border: "none", cursor: "pointer", padding: "4px 0", marginTop: "4px" }}
          >
            <ArrowLeft size={15} /> Back
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            {isEditing ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div>
                  <label htmlFor="edit-title-field" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6B6560", marginBottom: "4px" }}>
                    Title
                  </label>
                  <input
                    id="edit-title-field"
                    type="text"
                    placeholder="Paste title"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    maxLength={200}
                    className="input-field"
                    style={{ fontSize: "15px", fontWeight: 600, padding: "8px 12px" }}
                  />
                </div>
                <div>
                  <label htmlFor="edit-language-field" style={{ display: "block", fontSize: "11px", fontWeight: 600, color: "#6B6560", marginBottom: "4px" }}>
                    Language
                  </label>
                  <select
                    id="edit-language-field"
                    value={editLanguage}
                    onChange={(e) => setEditLanguage(e.target.value)}
                    className="select-field"
                    style={{ fontSize: "13px", padding: "8px 12px", width: "100%", maxWidth: "240px" }}
                  >
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <>
                <h1 style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                  {paste.title}
                </h1>
                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                  <LanguageBadge language={paste.language} />
                  {!burned && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#6B6560" }}>
                      <Eye size={13} /> {paste.viewCount.toLocaleString()} views
                    </span>
                  )}
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#6B6560" }}>
                    <Clock size={13} /> {formatDate(paste.createdAt)}
                  </span>
                  {paste.expiresAt && (
                    <span style={{ fontSize: "13px", color: "#6B6560" }}>
                      Expires {getTimeUntilExpiry(paste.expiresAt)}
                    </span>
                  )}
                  {burned && (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "13px", color: "#C1512D", fontWeight: 600 }}>
                      <Flame size={13} /> Burn-after-read
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button
              id="save-changes-btn"
              onClick={handleSave}
              disabled={saveLoading}
              className="btn-primary"
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              {saveLoading ? <Loader2 size={13} className="animate-spin" /> : null} Save Changes
            </button>
            <button
              id="cancel-edit-btn"
              onClick={() => setIsEditing(false)}
              className="btn-ghost"
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              Cancel
            </button>
          </div>
        ) : (
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
            {paste.hasEditPassword && !burned && (
              <button
                id="edit-paste-btn"
                onClick={handleStartEdit}
                className="btn-ghost"
                style={{ fontSize: "13px", padding: "8px 14px" }}
              >
                <FileText size={13} /> Edit
              </button>
            )}
            {canDelete && !burned && (
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
        )}

        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E1D8" }}>
          {isEditing ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", backgroundColor: "#F0ECE5", borderBottom: "1px solid #E5E1D8" }}>
                {["#FF5F57", "#FFBD2E", "#28CA42"].map((c) => (
                  <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />
                ))}
                <span style={{ fontSize: "12px", fontFamily: "JetBrains Mono, monospace", color: "#6B6560", marginLeft: "8px" }}>
                  Editing · {editTitle || "Untitled Paste"}
                </span>
              </div>
              <Editor
                height="520px"
                language={monacoLangMap[editLanguage] ?? "plaintext"}
                value={editContent}
                onChange={(val) => setEditContent(val ?? "")}
                theme="vs"
                options={{
                  readOnly: false,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: "none",
                  overviewRulerBorder: false,
                  domReadOnly: false,
                  automaticLayout: true,
                }}
              />
            </>
          ) : showRaw ? (
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

      {showEditPasswordModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          backdropFilter: "blur(4px)"
        }}>
          <form onSubmit={handleVerifyEditPassword} className="card" style={{ width: "100%", maxWidth: "400px", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0 }}>Enter Edit Password</h3>
            <p style={{ fontSize: "13px", color: "#6B6560", margin: 0 }}>This paste is protected by an edit password. Please enter it to start editing.</p>
            
            <div style={{ position: "relative" }}>
              <input
                type={showEditPasswordText ? "text" : "password"}
                placeholder="Edit password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                className="input-field"
                style={{ paddingRight: "40px" }}
                required
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowEditPasswordText(!showEditPasswordText)}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#6B6560",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showEditPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {editPasswordError && (
              <p style={{ fontSize: "13px", color: "#ef4444", margin: 0 }}>
                {editPasswordError}
              </p>
            )}

            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setShowEditPasswordModal(false)}
                style={{ fontSize: "13px", padding: "8px 14px" }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={editPasswordLoading}
                style={{ fontSize: "13px", padding: "8px 14px" }}
              >
                {editPasswordLoading ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
