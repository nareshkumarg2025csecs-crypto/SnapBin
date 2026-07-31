import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Zap, Link2, Flame, Code2, ArrowRight, Terminal, Share2, Eye,
} from "lucide-react";
import Footer from "../components/Footer";

const features = [
  {
    icon: <Code2 size={20} />,
    title: "Syntax Highlighting",
    description: "24+ languages supported via Monaco Editor — the same engine powering VS Code.",
  },
  {
    icon: <Link2 size={20} />,
    title: "Instant Share Links",
    description: "Every paste gets a unique URL. Share anywhere — no login, no friction.",
  },
  {
    icon: <Flame size={20} />,
    title: "Burn After Read",
    description: "Self-destructing pastes that disappear on first view. Perfect for secrets.",
  },
  {
    icon: <Zap size={20} />,
    title: "Flexible Expiry",
    description: "10 minutes, an hour, a day, a week, or never. Your paste, your rules.",
  },
];

const steps = [
  {
    icon: <Terminal size={18} />,
    step: "01",
    title: "Write your paste",
    description: "Drop in code or text. Pick a language for full syntax highlighting.",
  },
  {
    icon: <Share2 size={18} />,
    step: "02",
    title: "Configure & share",
    description: "Set visibility, expiry, and burn-after-read. Get an instant shareable URL.",
  },
  {
    icon: <Eye size={18} />,
    step: "03",
    title: "Anyone can view",
    description: "Recipients see your paste with full syntax highlighting — no login needed.",
  },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export default function Home() {
  return (
    <div style={{ backgroundColor: "#F7F5F1", overflowX: "hidden" }}>
      <section style={{ paddingTop: "clamp(48px, 8vw, 96px)", paddingBottom: "clamp(48px, 8vw, 80px)" }}>
        <div className="container-app">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: "760px" }}
          >
            <div style={{ marginBottom: "24px" }}>
              <span style={{
                display: "inline-flex", alignItems: "center",
                fontSize: "12px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em",
                padding: "6px 14px", borderRadius: "100px",
                color: "#C1512D", backgroundColor: "rgba(193,81,45,0.1)", border: "1px solid rgba(193,81,45,0.2)",
              }}>
                Open Source · No Login Required
              </span>
            </div>

            <h1 style={{
              fontSize: "clamp(40px, 7vw, 80px)",
              fontWeight: 900,
              lineHeight: 1.0,
              letterSpacing: "-0.045em",
              color: "#111111",
              marginBottom: "24px",
            }}>
              Share code.
              <br />
              <span style={{ color: "#C1512D" }}>Instantly.</span>
            </h1>

            <p style={{
              fontSize: "clamp(16px, 2.5vw, 20px)",
              color: "#6B6560",
              lineHeight: 1.65,
              marginBottom: "40px",
              maxWidth: "520px",
            }}>
              SnapBin is a developer-first pastebin with syntax highlighting,
              flexible expiry, burn-after-read, and shareable links — no account needed.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              <Link to="/create" className="btn-primary" style={{ fontSize: "15px", padding: "14px 28px" }}>
                Create a Paste <ArrowRight size={16} />
              </Link>
              <Link to="/browse" className="btn-ghost" style={{ fontSize: "15px", padding: "14px 28px" }}>
                Explore Public Pastes
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.55 }}
            style={{ marginTop: "56px", borderRadius: "16px", overflow: "hidden", border: "1px solid #E5E1D8", maxWidth: "840px" }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 20px", backgroundColor: "#F0ECE5", borderBottom: "1px solid #E5E1D8" }}>
              {["#FF5F57", "#FFBD2E", "#28CA42"].map((c) => (
                <div key={c} style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: c }} />
              ))}
              <span style={{ fontSize: "13px", fontFamily: "'JetBrains Mono', monospace", color: "#6B6560", marginLeft: "8px" }}>
                hello.ts
              </span>
            </div>
            <div style={{ padding: "24px", backgroundColor: "#FFFFFF", overflowX: "auto" }}>
              <pre style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "14px", lineHeight: 1.7, margin: 0 }}>
                <span style={{ color: "#C1512D" }}>const</span>
                {" "}
                <span style={{ color: "#111111" }}>greet</span>
                {" "}
                <span style={{ color: "#C1512D" }}>=</span>
                {" "}
                <span style={{ color: "#6B6560" }}>(</span>
                <span style={{ color: "#111111" }}>name</span>
                <span style={{ color: "#6B6560" }}>: </span>
                <span style={{ color: "#1d7ab9" }}>string</span>
                <span style={{ color: "#6B6560" }}>) =&gt; {"{"}</span>
                {"\n"}
                {"  "}
                <span style={{ color: "#C1512D" }}>return</span>
                {" "}
                <span style={{ color: "#1a7a3e" }}>{"`Hello, ${name}! Welcome to SnapBin.`"}</span>
                {";"}
                {"\n"}
                <span style={{ color: "#6B6560" }}>{"}"}</span>
                {";"}
                {"\n\n"}
                <span style={{ color: "#aaa" }}>{`// Share this snippet instantly → snapbin.dev/abc123`}</span>
                {"\n"}
                <span style={{ color: "#111111" }}>console</span>
                <span style={{ color: "#6B6560" }}>.</span>
                <span style={{ color: "#1d7ab9" }}>log</span>
                <span style={{ color: "#6B6560" }}>(</span>
                <span style={{ color: "#111111" }}>greet</span>
                <span style={{ color: "#6B6560" }}>(</span>
                <span style={{ color: "#1a7a3e" }}>"world"</span>
                <span style={{ color: "#6B6560" }}>));</span>
              </pre>
            </div>
          </motion.div>
        </div>
      </section>

      <section style={{ paddingTop: "clamp(48px, 6vw, 80px)", paddingBottom: "clamp(48px, 6vw, 80px)" }}>
        <div className="container-app">
          <div style={{ height: "1px", backgroundColor: "#E5E1D8", marginBottom: "clamp(40px, 6vw, 64px)" }} />
          <FadeIn>
            <div style={{ marginBottom: "40px" }}>
              <span className="section-label">Features</span>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#111111", letterSpacing: "-0.035em", marginTop: "10px" }}>
                Everything you need, nothing you don&apos;t.
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px" }}>
            {features.map((f, i) => (
              <FadeIn key={f.title} delay={i * 0.08}>
                <div
                  className="card"
                  style={{ padding: "24px", height: "100%", transition: "border-color 0.2s, box-shadow 0.2s" }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#C1512D";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(193,81,45,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E1D8";
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "10px", backgroundColor: "rgba(193,81,45,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#C1512D", marginBottom: "16px" }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>{f.title}</h3>
                  <p style={{ fontSize: "14px", color: "#6B6560", lineHeight: 1.6 }}>{f.description}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section style={{ backgroundColor: "#F0ECE5", paddingTop: "clamp(48px, 6vw, 80px)", paddingBottom: "clamp(48px, 6vw, 80px)" }}>
        <div className="container-app">
          <FadeIn>
            <div style={{ marginBottom: "48px" }}>
              <span className="section-label">How it works</span>
              <h2 style={{ fontSize: "clamp(24px, 4vw, 40px)", fontWeight: 900, color: "#111111", letterSpacing: "-0.035em", marginTop: "10px" }}>
                Three steps to share.
              </h2>
            </div>
          </FadeIn>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "40px" }}>
            {steps.map((s, i) => (
              <FadeIn key={s.step} delay={i * 0.12}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#C1512D", display: "flex", alignItems: "center", justifyContent: "center", color: "white", flexShrink: 0 }}>
                      {s.icon}
                    </div>
                    <span style={{ fontSize: "32px", fontWeight: 900, color: "#E5E1D8", letterSpacing: "-0.04em" }}>{s.step}</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#111111", marginBottom: "6px" }}>{s.title}</h3>
                    <p style={{ fontSize: "14px", color: "#6B6560", lineHeight: 1.6 }}>{s.description}</p>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section style={{ paddingTop: "clamp(48px, 6vw, 80px)", paddingBottom: "clamp(48px, 6vw, 80px)" }}>
        <div className="container-app">
          <FadeIn>
            <div style={{
              borderRadius: "20px",
              padding: "clamp(40px, 6vw, 72px)",
              textAlign: "center",
              background: "linear-gradient(135deg, #C1512D 0%, #8B3520 100%)",
            }}>
              <h2 style={{ fontSize: "clamp(28px, 5vw, 52px)", fontWeight: 900, color: "white", letterSpacing: "-0.04em", marginBottom: "16px" }}>
                Ready to share?
              </h2>
              <p style={{ fontSize: "clamp(14px, 2vw, 18px)", color: "rgba(255,255,255,0.75)", marginBottom: "36px" }}>
                Create your first paste in seconds. No registration. No email.
              </p>
              <Link
                to="/create"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "14px 32px",
                  backgroundColor: "white",
                  color: "#C1512D",
                  borderRadius: "12px",
                  fontWeight: 700,
                  fontSize: "15px",
                  textDecoration: "none",
                  transition: "opacity 0.2s",
                }}
              >
                Create a Paste <ArrowRight size={16} />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      <Footer />
    </div>
  );
}
