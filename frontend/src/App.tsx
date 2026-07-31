import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CreatePaste from "./pages/CreatePaste";
import ViewPaste from "./pages/ViewPaste";
import Browse from "./pages/Browse";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div style={{ minHeight: "100vh", backgroundColor: "#F7F5F1" }}>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreatePaste />} />
              <Route path="/paste/:id" element={<ViewPaste />} />
              <Route path="/browse" element={<Browse />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#FFFFFF",
              color: "#111111",
              border: "1px solid #E5E1D8",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "Inter, sans-serif",
            },
            success: {
              iconTheme: { primary: "#C1512D", secondary: "#fff" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#fff" },
            },
          }}
        />
      </BrowserRouter>
    </ErrorBoundary>
  );
}
