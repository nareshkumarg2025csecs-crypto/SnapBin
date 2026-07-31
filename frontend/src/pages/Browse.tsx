import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Loader2, TrendingUp, Clock, LayoutGrid } from "lucide-react";
import { pastesApi, PasteListItem, PaginationMeta } from "../lib/api";
import PasteCard from "../components/PasteCard";

type SortOption = "newest" | "most_viewed";

export default function Browse() {
  const [pastes, setPastes] = useState<PasteListItem[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<SortOption>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    setLoading(true);
    setError(null);

    pastesApi
      .list({ page, limit: 20, sort })
      .then(({ pastes: p, pagination: pg }) => {
        if (cancelledRef.current) return;
        setPastes(p);
        setPagination(pg);
      })
      .catch((err: Error) => {
        if (cancelledRef.current) return;
        setError(err.message);
      })
      .finally(() => {
        if (!cancelledRef.current) setLoading(false);
      });

    return () => {
      cancelledRef.current = true;
    };
  }, [page, sort]);

  const handleSortChange = (newSort: SortOption) => {
    if (newSort === sort) return;
    setSort(newSort);
    setPage(1);
  };

  return (
    <div className="container-app" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", marginBottom: "32px" }}>
          <div>
            <span className="section-label">Public Pastes</span>
            <h1 style={{ fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 900, color: "#111111", letterSpacing: "-0.03em", marginTop: "8px" }}>
              Explore
            </h1>
            {pagination && (
              <p style={{ fontSize: "14px", color: "#6B6560", marginTop: "4px" }}>
                {pagination.total.toLocaleString()} public pastes
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            {(
              [
                { value: "newest", label: "Newest", icon: <Clock size={13} /> },
                { value: "most_viewed", label: "Most Viewed", icon: <TrendingUp size={13} /> },
              ] as { value: SortOption; label: string; icon: React.ReactNode }[]
            ).map((option) => (
              <button
                key={option.value}
                id={`sort-${option.value}`}
                onClick={() => handleSortChange(option.value)}
                className="btn-ghost"
                style={{
                  fontSize: "13px",
                  padding: "8px 14px",
                  ...(sort === option.value ? { borderColor: "#C1512D", color: "#C1512D", backgroundColor: "rgba(193,81,45,0.08)" } : {}),
                }}
              >
                {option.icon} {option.label}
              </button>
            ))}
          </div>
        </div>

        {loading && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "80px 0" }}>
            <Loader2 size={28} className="animate-spin" style={{ color: "#C1512D" }} />
          </div>
        )}

        {error && (
          <div style={{ borderRadius: "12px", padding: "24px", textAlign: "center", border: "1px solid #E5E1D8", backgroundColor: "#FFFFFF" }}>
            <p style={{ fontSize: "14px", color: "#6B6560" }}>{error}</p>
          </div>
        )}

        {!loading && !error && pastes.length === 0 && (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "16px", backgroundColor: "#F0ECE5", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <LayoutGrid size={28} style={{ color: "#6B6560" }} />
            </div>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#111111", marginBottom: "8px" }}>No public pastes yet</h2>
            <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "24px" }}>Be the first to share something.</p>
            <Link to="/create" className="btn-primary">Create the First Paste</Link>
          </div>
        )}

        {!loading && !error && pastes.length > 0 && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px", marginBottom: "32px" }}>
              {pastes.map((paste, i) => (
                <PasteCard key={paste.id} paste={paste} index={i} />
              ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", flexWrap: "wrap" }}>
                <button
                  id="prev-page-btn"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                  className="btn-ghost"
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  Previous
                </button>
                <div style={{ display: "flex", gap: "4px" }}>
                  {Array.from({ length: Math.min(pagination.totalPages, 7) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        id={`page-${pageNum}-btn`}
                        onClick={() => setPage(pageNum)}
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          fontSize: "13px",
                          fontWeight: 500,
                          cursor: "pointer",
                          border: "1px solid",
                          transition: "all 0.15s",
                          borderColor: page === pageNum ? "#C1512D" : "#E5E1D8",
                          color: page === pageNum ? "#C1512D" : "#6B6560",
                          backgroundColor: page === pageNum ? "rgba(193,81,45,0.08)" : "transparent",
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  id="next-page-btn"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="btn-ghost"
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
