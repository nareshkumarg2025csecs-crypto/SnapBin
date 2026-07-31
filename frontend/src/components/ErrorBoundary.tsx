import { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught React Error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container-app" style={{ paddingTop: "80px", paddingBottom: "80px", textAlign: "center" }}>
          <div style={{ maxWidth: "480px", margin: "0 auto", padding: "32px", borderRadius: "16px", backgroundColor: "#FFFFFF", border: "1px solid #E5E1D8" }}>
            <div style={{ width: "56px", height: "56px", borderRadius: "14px", backgroundColor: "rgba(193,81,45,0.1)", color: "#C1512D", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
              <AlertTriangle size={28} />
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 800, color: "#111111", marginBottom: "8px" }}>
              Something went wrong
            </h2>
            <p style={{ fontSize: "14px", color: "#6B6560", marginBottom: "24px", lineHeight: 1.6 }}>
              {this.state.error?.message || "An unexpected error occurred in the application component."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
              style={{ fontSize: "14px" }}
            >
              <RefreshCw size={14} /> Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
