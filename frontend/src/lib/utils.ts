import { formatDistanceToNow, format, isAfter } from "date-fns";

export function timeAgo(dateStr: string): string {
  return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "MMM d, yyyy 'at' HH:mm");
}

export function isExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return false;
  return !isAfter(new Date(expiresAt), new Date());
}

export function getTimeUntilExpiry(expiresAt: string | null): string {
  if (!expiresAt) return "Never";
  const expiry = new Date(expiresAt);
  if (!isAfter(expiry, new Date())) return "Expired";
  return formatDistanceToNow(expiry, { addSuffix: true });
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text);
}

export function downloadAsFile(content: string, filename: string, language: string): void {
  const extensionMap: Record<string, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    go: "go",
    rust: "rs",
    ruby: "rb",
    php: "php",
    swift: "swift",
    kotlin: "kt",
    html: "html",
    css: "css",
    json: "json",
    yaml: "yml",
    toml: "toml",
    markdown: "md",
    sql: "sql",
    bash: "sh",
    dockerfile: "dockerfile",
    xml: "xml",
    plaintext: "txt",
  };

  const ext = extensionMap[language] ?? "txt";
  const safeName = filename.replace(/[^a-z0-9_\-. ]/gi, "_").slice(0, 80);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safeName || "paste"}.${ext}`;
  a.click();
  URL.revokeObjectURL(url);
}

const DELETE_TOKEN_PREFIX = "snapbin_dt_";

export function saveDeleteToken(pasteId: string, token: string): void {
  try {
    localStorage.setItem(`${DELETE_TOKEN_PREFIX}${pasteId}`, token);
  } catch { /* localStorage unavailable (private mode) */ }
}

export function getDeleteToken(pasteId: string): string | null {
  try {
    return localStorage.getItem(`${DELETE_TOKEN_PREFIX}${pasteId}`);
  } catch {
    return null;
  }
}

export function removeDeleteToken(pasteId: string): void {
  try {
    localStorage.removeItem(`${DELETE_TOKEN_PREFIX}${pasteId}`);
  } catch { /* localStorage unavailable (private mode) */ }
}

export const LANGUAGE_LABELS: Record<string, string> = {
  plaintext: "Plain Text",
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  go: "Go",
  rust: "Rust",
  ruby: "Ruby",
  php: "PHP",
  swift: "Swift",
  kotlin: "Kotlin",
  html: "HTML",
  css: "CSS",
  json: "JSON",
  yaml: "YAML",
  toml: "TOML",
  markdown: "Markdown",
  sql: "SQL",
  bash: "Bash",
  dockerfile: "Dockerfile",
  xml: "XML",
};

export const LANGUAGE_COLORS: Record<string, string> = {
  javascript: "#F7DF1E",
  typescript: "#3178C6",
  python: "#3776AB",
  java: "#ED8B00",
  c: "#A8B9CC",
  cpp: "#00599C",
  csharp: "#239120",
  go: "#00ADD8",
  rust: "#DEA584",
  ruby: "#CC342D",
  php: "#777BB4",
  swift: "#FA7343",
  kotlin: "#7F52FF",
  html: "#E34F26",
  css: "#1572B6",
  json: "#292929",
  yaml: "#CB171E",
  sql: "#336791",
  bash: "#4EAA25",
  markdown: "#083FA1",
  dockerfile: "#2496ED",
  plaintext: "#7A756F",
  toml: "#9C4221",
  xml: "#0060AC",
};
