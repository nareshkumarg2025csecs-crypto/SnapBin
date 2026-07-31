import { Link, useLocation } from "react-router-dom";
import { Menu, X, Github, ExternalLink } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function Navbar() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/create", label: "Create Paste" },
    { to: "/browse", label: "Browse" },
    { to: "/api/docs", label: "API Docs", external: true },
    { to: "https://github.com", label: "GitHub", external: true, icon: <Github size={15} /> },
  ];

  return (
    <header
      style={{
        backgroundColor: "#F7F5F1",
        borderBottom: "1px solid #E5E1D8",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        className="container-app"
        style={{
          height: "72px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          className="logoContainer"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2rem",
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
            <img
              src="/copy.png"
              alt="SnapBin Logo"
              className="navbar-logo"
              style={{
                objectFit: "contain",
                display: "block",
              }}
            />
          </Link>

          <nav
            className="navigation hidden lg:flex"
            style={{
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            {navLinks.map((link) =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.to}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: "#111111",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#C1512D")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#111111")}
                >
                  {link.icon}
                  {link.label}
                  {link.label === "API Docs" && <ExternalLink size={11} />}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.to}
                  style={{
                    fontSize: "14px",
                    fontWeight: 600,
                    color: location.pathname === link.to ? "#C1512D" : "#111111",
                    textDecoration: "none",
                    transition: "color 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (location.pathname !== link.to) e.currentTarget.style.color = "#C1512D";
                  }}
                  onMouseLeave={(e) => {
                    if (location.pathname !== link.to) e.currentTarget.style.color = "#111111";
                  }}
                >
                  {link.label}
                </Link>
              )
            )}
          </nav>
        </div>

        <div
          className="actions hidden lg:flex"
          style={{
            alignItems: "center",
            gap: "10px",
          }}
        >
          <Link
            to="/create"
            className="btn-primary createButton"
            style={{
              fontSize: "14px",
              marginLeft: "15px",
              padding: "10px 20px",
            }}
          >
            Create a Paste
          </Link>
        </div>

        <div className="flex lg:hidden" style={{ alignItems: "center", gap: "12px" }}>
          <Link to="/create" className="btn-primary" style={{ fontSize: "13px", padding: "6px 14px" }}>
            Create
          </Link>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            style={{
              width: "40px",
              height: "40px",
              border: "1px solid #E5E1D8",
              borderRadius: "10px",
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#111111",
            }}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden"
            style={{
              backgroundColor: "#F7F5F1",
              borderTop: "1px solid #E5E1D8",
              overflow: "hidden",
            }}
          >
            <div style={{ padding: "16px 2rem", display: "flex", flexDirection: "column", gap: "6px" }}>
              {navLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.label}
                    href={link.to}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "10px 12px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: "#111111",
                      textDecoration: "none",
                      borderRadius: "8px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.icon}
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    style={{
                      padding: "10px 12px",
                      fontSize: "15px",
                      fontWeight: 600,
                      color: location.pathname === link.to ? "#C1512D" : "#111111",
                      textDecoration: "none",
                      borderRadius: "8px",
                      backgroundColor: location.pathname === link.to ? "rgba(193,81,45,0.08)" : "transparent",
                    }}
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .navbar-logo {
          height: 54px;
          width: 54px;
        }
        @media (max-width: 1023px) and (min-width: 768px) {
          .navbar-logo {
            height: 48px;
            width: 48px;
          }
        }
        @media (max-width: 767px) {
          .navbar-logo {
            height: 40px;
            width: 40px;
          }
        }
      `}</style>
    </header>
  );
}
