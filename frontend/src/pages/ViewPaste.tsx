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
  Lock,
  Edit2,
  Save,
  X,
  EyeOff
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
  const cancelledRef = useRef(false);
  const fetchedRef = useRef(false);

  const [paste, setPaste] = useState<Paste | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [burned, setBurned] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  const [needsViewPassword, setNeedsViewPassword] = useState(false);
  const [viewPasswordInput, setViewPasswordInput] = useState("");
  const [viewPasswordError, setViewPasswordError] = useState<string | null>(null);
  const [showViewPasswordText, setShowViewPasswordText] = useState(false);
  const [verifyingViewPw, setVerifyingViewPw] = useState(false);

  const [showEditPrompt, setShowEditPrompt] = useState(false);
  const [editPasswordInput, setEditPasswordInput] = useState("");
  const [editPasswordError, setEditPasswordError] = useState<string | null>(null);
  const [verifyingEditPw, setVerifyingEditPw] = useState(false);
  const [showEditPasswordText, setShowEditPasswordText] = useState(false);
  const [verifiedEditPassword, setVerifiedEditPassword] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editLanguage, setEditLanguage] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const deleteToken = id ? getDeleteToken(id) : null;
  const canDelete = !!deleteToken;

  useEffect(() => {
    if (!id || fetchedRef.current) return;
    fetchedRef.current = true;
    cancelledRef.current = false;

    const statePaste = location.state?.paste as Paste | undefined;

    if (statePaste && statePaste.id === id && !statePaste.hasViewPassword) {
      setPaste(statePaste);
      setEditTitle(statePaste.title);
      setEditContent(statePaste.content);
      setEditLanguage(statePaste.language);
      setLoading(false);
      return;
    }

    setLoading(true);

    pastesApi.getById(id)
      .then(({ paste: p, burned: b }) => {
        if (cancelledRef.current) return;
        setPaste(p);
        setEditTitle(p.title);
        setEditContent(p.content);
        setEditLanguage(p.language);
        setBurned(b);
        if (b) {
          toast("This paste was consumed and deleted.", { icon: "🔥" });
        }
      })
      .catch((err: Error & { code?: string; status?: number }) => {
        if (cancelledRef.current) return;
        if (err.status === 401) {
          setNeedsViewPassword(true);
        } else {
          setError(err.message);
          setErrorCode((err as any).code ?? null);
          if ((err as any).code === "PASTE_EXPIRED") {
            toast.error("This paste has expired.");
          }
        }
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [id]);

  const handleVerifyViewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !viewPasswordInput.trim()) return;
    setVerifyingViewPw(true);
    setViewPasswordError(null);

    try {
      const { paste: p, burned: b } = await pastesApi.getById(id, viewPasswordInput);
      setPaste(p);
      setEditTitle(p.title);
      setEditContent(p.content);
      setEditLanguage(p.language);
      setBurned(b);
      setNeedsViewPassword(false);
      if (b) {
        toast("This paste was consumed and deleted.", { icon: "🔥" });
      }
    } catch (err: any) {
      const code = err.code ?? "";
      if (code === "VIEW_PASSWORD_REQUIRED" || code === "INVALID_VIEW_PASSWORD" || err.status === 401) {
        setViewPasswordError("Incorrect password. Please try again.");
      } else {
        setViewPasswordError(err.message || "Failed to unlock paste.");
      }
    } finally {
      setVerifyingViewPw(false);
    }
  };

  const handleOpenEditPrompt = () => {
    setEditPasswordInput("");
    setEditPasswordError(null);
    setShowEditPrompt(true);
  };

  const handleVerifyEditPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !editPasswordInput.trim()) {
      setEditPasswordError("Password is required.");
      return;
    }
    if (!paste) return;

    setVerifyingEditPw(true);
    setEditPasswordError(null);

    try {
      const updated = await pastesApi.update(id, {
        title: paste.title,
        content: paste.content,
        language: paste.language,
        editPassword: editPasswordInput,
      });
      setPaste(updated);
      setEditTitle(updated.title);
      setEditContent(updated.content);
      setEditLanguage(updated.language);
      setVerifiedEditPassword(editPasswordInput);
      setShowEditPrompt(false);
      setIsEditing(true);
    } catch (err: any) {
      const code = err.code ?? "";
      if (code === "INVALID_EDIT_PASSWORD" || err.status === 401) {
        setEditPasswordError("Incorrect edit password.");
      } else if (code === "PASTE_NOT_EDITABLE" || err.status === 403) {
        setEditPasswordError("This paste cannot be edited.");
        setShowEditPrompt(false);
      } else {
        setEditPasswordError(err.message || "Verification failed.");
      }
    } finally {
      setVerifyingEditPw(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!id || !paste) return;
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }
    if (!verifiedEditPassword) {
      toast.error("Edit session expired. Please re-authenticate.");
      setIsEditing(false);
      setShowEditPrompt(true);
      return;
    }
    setSavingEdit(true);

    try {
      const updated = await pastesApi.update(id, {
        title: editTitle,
        content: editContent,
        language: editLanguage,
        editPassword: verifiedEditPassword,
      });
      setPaste(updated);
      setEditTitle(updated.title);
      setEditContent(updated.content);
      setEditLanguage(updated.language);
      setIsEditing(false);
      setVerifiedEditPassword(null);
      toast.success("Changes saved successfully!");
    } catch (err: any) {
      const code = err.code ?? "";
      if (code === "INVALID_EDIT_PASSWORD" || err.status === 401) {
        toast.error("Edit password rejected by server. Please re-authenticate.");
        setIsEditing(false);
        setVerifiedEditPassword(null);
        setShowEditPrompt(true);
      } else {
        toast.error(err.message || "Failed to save changes");
      }
    } finally {
      setSavingEdit(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setVerifiedEditPassword(null);
    if (paste) {
      setEditTitle(paste.title);
      setEditContent(paste.content);
      setEditLanguage(paste.language);
    }
  };

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

  if (needsViewPassword) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh", padding: "24px" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card"
          style={{ width: "100%", maxWidth: "400px", padding: "32px", textAlign: "center" }}
        >
          <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(193,81,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
            <Lock size={24} style={{ color: "#C1512D" }} />
          </div>
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>Password Protected</h2>
          <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "24px", lineHeight: 1.6 }}>
            This paste requires a password to view its contents.
          </p>
          <form onSubmit={handleVerifyViewPassword}>
            <div style={{ position: "relative", marginBottom: "12px" }}>
              <input
                id="view-password-unlock-input"
                type={showViewPasswordText ? "text" : "password"}
                placeholder="Enter view password"
                value={viewPasswordInput}
                onChange={(e) => setViewPasswordInput(e.target.value)}
                autoFocus
                className="input-field"
                style={{ paddingRight: "44px", textAlign: "left" }}
              />
              <button
                type="button"
                onClick={() => setShowViewPasswordText(!showViewPasswordText)}
                style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B6560", display: "flex", alignItems: "center" }}
              >
                {showViewPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {viewPasswordError && (
              <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "12px", textAlign: "left" }}>
                {viewPasswordError}
              </p>
            )}
            <button
              type="submit"
              disabled={verifyingViewPw || !viewPasswordInput.trim()}
              className="btn-primary"
              style={{ width: "100%", justifyContent: "center" }}
            >
              {verifyingViewPw ? <><Loader2 size={14} className="animate-spin" /> Verifying...</> : "Unlock Paste"}
            </button>
          </form>
        </motion.div>
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
            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="input-field"
                style={{ fontSize: "24px", fontWeight: 800, marginBottom: "8px", maxWidth: "400px" }}
              />
            ) : (
              <h1 style={{ fontSize: "clamp(18px, 3vw, 28px)", fontWeight: 800, color: "#111111", letterSpacing: "-0.02em", marginBottom: "8px" }}>
                {paste.title}
              </h1>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
              {isEditing ? (
                <select
                  value={editLanguage}
                  onChange={(e) => setEditLanguage(e.target.value)}
                  className="select-field"
                  style={{ width: "150px", fontSize: "13px", padding: "4px 8px", height: "auto" }}
                >
                  {Object.keys(monacoLangMap).map((lang) => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
              ) : (
                <LanguageBadge language={paste.language} />
              )}
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
          {isEditing ? (
            <>
              <button onClick={handleSaveEdit} disabled={savingEdit} className="btn-primary" style={{ fontSize: "13px", padding: "8px 14px" }}>
                {savingEdit ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} Save Changes
              </button>
              <button onClick={handleCancelEdit} className="btn-ghost" style={{ fontSize: "13px", padding: "8px 14px" }}>
                <X size={13} /> Cancel
              </button>
            </>
          ) : (
            <>
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
              {paste.hasEditPassword && (
                <button id="edit-paste-btn" onClick={handleOpenEditPrompt} className="btn-ghost" style={{ fontSize: "13px", padding: "8px 14px" }}>
                  <Edit2 size={13} /> Edit
                </button>
              )}
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
            </>
          )}
        </div>

        {showEditPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="card"
            style={{ maxWidth: "400px", margin: "0 0 20px", padding: "24px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "8px", backgroundColor: "rgba(193,81,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Lock size={16} style={{ color: "#C1512D" }} />
              </div>
              <div>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111111", margin: 0 }}>Verify Edit Password</h3>
                <p style={{ fontSize: "12px", color: "#6B6560", margin: 0, marginTop: "2px" }}>Password is verified server-side before editing is enabled.</p>
              </div>
            </div>
            <form onSubmit={handleVerifyEditPassword}>
              <div style={{ position: "relative", marginBottom: "12px" }}>
                <input
                  id="edit-password-verify-input"
                  type={showEditPasswordText ? "text" : "password"}
                  placeholder="Edit password"
                  value={editPasswordInput}
                  onChange={(e) => setEditPasswordInput(e.target.value)}
                  autoFocus
                  className="input-field"
                  style={{ paddingRight: "44px" }}
                />
                <button
                  type="button"
                  onClick={() => setShowEditPasswordText(!showEditPasswordText)}
                  style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B6560", display: "flex", alignItems: "center" }}
                >
                  {showEditPasswordText ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {editPasswordError && (
                <p style={{ fontSize: "13px", color: "#ef4444", marginBottom: "12px" }}>{editPasswordError}</p>
              )}
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  type="submit"
                  disabled={verifyingEditPw || !editPasswordInput.trim()}
                  className="btn-primary"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  {verifyingEditPw ? <><Loader2 size={13} className="animate-spin" /> Verifying...</> : "Unlock Editor"}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEditPrompt(false); setEditPasswordError(null); }}
                  className="btn-ghost"
                  style={{ flex: 1, justifyContent: "center" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E1D8" }}>
          {showRaw && !isEditing ? (
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
                  {isEditing ? "Editing — " : ""}{paste.title}
                </span>
              </div>
              <Editor
                height="520px"
                language={monacoLangMap[isEditing ? editLanguage : paste.language] ?? "plaintext"}
                value={isEditing ? editContent : paste.content}
                onChange={(val) => { if (isEditing) setEditContent(val ?? ""); }}
                theme="vs"
                options={{
                  readOnly: !isEditing,
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  padding: { top: 16, bottom: 16 },
                  renderLineHighlight: "none",
                  overviewRulerBorder: false,
                  domReadOnly: !isEditing,
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
