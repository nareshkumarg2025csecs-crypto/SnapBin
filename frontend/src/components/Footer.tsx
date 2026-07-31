import { Link } from "react-router-dom";
import { Zap, Github, ExternalLink } from "lucide-react";

const apiDocsUrl = `${(import.meta.env.VITE_API_URL as string || "").replace(/\/api$/, "")}/api/docs`;

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid #E5E1D8", backgroundColor: "#F7F5F1" }}>
      <div className="container-app" style={{ paddingTop: "48px", paddingBottom: "48px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "40px" }}>
          <div style={{ gridColumn: "span 2", minWidth: 0 }}>
            <Link to="/" style={{ display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "16px", textDecoration: "none" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "6px", backgroundColor: "#C1512D", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Zap size={14} color="white" strokeWidth={2.5} />
              </div>
              <span style={{ fontWeight: 800, color: "#111111", letterSpacing: "-0.03em" }}>SnapBin</span>
            </Link>
            <p style={{ fontSize: "14px", color: "#6B6560", lineHeight: 1.6, maxWidth: "280px" }}>
              Share code snippets instantly with syntax highlighting, expiry, and burn-after-read. No account required.
            </p>
          </div>

          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C1512D", marginBottom: "16px" }}>
              Product
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              {[
                { to: "/create", label: "Create Paste" },
                { to: "/browse", label: "Explore" },
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.to} style={{ fontSize: "14px", color: "#6B6560", textDecoration: "none" }}>
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <a href={apiDocsUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#6B6560", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  API Docs <ExternalLink size={10} />
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C1512D", marginBottom: "16px" }}>
              Open Source
            </p>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "10px" }}>
              <li>
                <a href="https://github.com/nareshkumarg2025csecs-crypto/SnapBin" target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#6B6560", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                  <Github size={13} /> GitHub
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: "40px", paddingTop: "24px", borderTop: "1px solid #E5E1D8", display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontSize: "12px", color: "#6B6560" }}>
            © {new Date().getFullYear()} SnapBin. Built for college DevOps club evaluation.
          </p>
          <p style={{ fontSize: "12px", color: "#6B6560" }}>
            Node.js · PostgreSQL · React · Docker
          </p>
        </div>
      </div>
    </footer>
  );
}
