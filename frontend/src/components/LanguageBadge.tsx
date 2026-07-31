import { LANGUAGE_COLORS, LANGUAGE_LABELS } from "../lib/utils";

interface LanguageBadgeProps {
  language: string;
  size?: "sm" | "md";
}

export default function LanguageBadge({ language, size = "sm" }: LanguageBadgeProps) {
  const color = LANGUAGE_COLORS[language] ?? "#6B6560";
  const label = LANGUAGE_LABELS[language] ?? language;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        borderRadius: "6px",
        backgroundColor: "#F0ECE5",
        color: "#6B6560",
        border: "1px solid #E5E1D8",
        fontSize: size === "sm" ? "11px" : "13px",
        padding: size === "sm" ? "2px 8px" : "4px 10px",
      }}
    >
      <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: color, flexShrink: 0, display: "inline-block" }} />
      {label}
    </span>
  );
}
