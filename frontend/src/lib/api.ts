import axios from "axios";

export const SUPPORTED_LANGUAGES = [
  "plaintext", "javascript", "typescript", "python", "java", "c", "cpp", "csharp",
  "go", "rust", "ruby", "php", "swift", "kotlin", "html", "css", "json", "yaml",
  "toml", "markdown", "sql", "bash", "dockerfile", "xml",
] as const;

const baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ?? error.message ?? "Something went wrong";
    const code = error.response?.data?.code ?? "UNKNOWN_ERROR";
    const status = error.response?.status ?? 0;
    const err = new Error(message) as Error & { code: string; status: number };
    err.code = code;
    err.status = status;
    return Promise.reject(err);
  }
);

export interface Paste {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
  burnAfterRead: boolean;
  visibility: "public" | "unlisted";
  hasViewPassword: boolean;
  hasEditPassword: boolean;
}

export interface PasteListItem {
  id: string;
  title: string;
  language: string;
  createdAt: string;
  expiresAt: string | null;
  viewCount: number;
  burnAfterRead: boolean;
  visibility: "public" | "unlisted";
  hasViewPassword: boolean;
  hasEditPassword: boolean;
}

export interface CreatePastePayload {
  title?: string;
  content: string;
  language?: string;
  expiration?: "10m" | "1h" | "1d" | "1w" | "never";
  visibility?: "public" | "unlisted";
  burnAfterRead?: boolean;
  viewPassword?: string;
  editPassword?: string;
}

export interface CreatePasteResult extends Paste {
  deleteToken: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export const pastesApi = {
  create: async (payload: CreatePastePayload): Promise<CreatePasteResult> => {
    const response = await api.post<CreatePasteResult>("/pastes", payload);
    return response.data;
  },

  getById: async (id: string, viewPassword?: string): Promise<{ paste: Paste; burned: boolean }> => {
    const headers: Record<string, string> = {};
    if (viewPassword) {
      headers["X-View-Password"] = viewPassword;
    }
    const response = await api.get<{
      status: string;
      data: { paste: Paste; burned: boolean };
    }>(`/pastes/${id}`, { headers });
    return response.data.data;
  },

  list: async (params: { page?: number; limit?: number; sort?: "newest" | "most_viewed"; search?: string }) => {
    const response = await api.get<{
      status: string;
      data: { pastes: PasteListItem[]; pagination: PaginationMeta };
    }>("/pastes", { params });
    return response.data.data;
  },

  delete: async (id: string, deleteToken: string) => {
    await api.delete(`/pastes/${id}`, {
      headers: { "X-Delete-Token": deleteToken },
    });
  },

  update: async (
    id: string,
    payload: { editPassword: string; title?: string; content?: string; language?: string }
  ): Promise<Paste> => {
    const response = await api.put<Paste>(`/pastes/${id}`, payload);
    return response.data;
  },

  health: async () => {
    const response = await api.get<{ status: string; db: string; uptime: number }>("/health");
    return response.data;
  },
};
