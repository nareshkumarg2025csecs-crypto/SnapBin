import { Link } from "react-router-dom";
import { Eye, Clock, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { PasteListItem } from "../lib/api";
import { timeAgo, getTimeUntilExpiry } from "../lib/utils";
import LanguageBadge from "./LanguageBadge";

interface PasteCardProps {
  paste: PasteListItem;
  index?: number;
}

export default function PasteCard({ paste, index = 0 }: PasteCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
    >
      <Link
        to={`/paste/${paste.id}`}
        style={{ textDecoration: "none", display: "block" }}
      >
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid #E5E1D8",
            borderRadius: "12px",
            padding: "20px",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#C1512D";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(193,81,45,0.08)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E1D8";
            (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
            <h3 style={{ fontWeight: 600, fontSize: "14px", color: "#111111", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
              {paste.title || "Untitled Paste"}
            </h3>
            {paste.burnAfterRead && (
              <span style={{
                flexShrink: 0,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "6px",
                color: "#C1512D",
                backgroundColor: "rgba(193,81,45,0.1)",
                border: "1px solid rgba(193,81,45,0.2)",
              }}>
                <Flame size={10} /> Burn
              </span>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <LanguageBadge language={paste.language} />
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B6560" }}>
              <Eye size={11} /> {paste.viewCount.toLocaleString()}
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#6B6560" }}>
              <Clock size={11} /> {timeAgo(paste.createdAt)}
            </span>
            {paste.expiresAt && (
              <span style={{ fontSize: "12px", color: "#6B6560" }}>
                Expires {getTimeUntilExpiry(paste.expiresAt)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
