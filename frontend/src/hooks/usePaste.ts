import { useState, useCallback } from "react";
import { pastesApi, CreatePastePayload, CreatePasteResult } from "../lib/api";
import { saveDeleteToken } from "../lib/utils";

export function useCreatePaste() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const create = useCallback(async (payload: CreatePastePayload): Promise<CreatePasteResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await pastesApi.create(payload);
      if (!response || !response.id) {
        throw new Error("Paste creation failed.");
      }
      console.log("[useCreatePaste] Generated ID:", response.id);
      saveDeleteToken(response.id, response.deleteToken);
      return response;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to create paste";
      setError(msg);
      console.error("[useCreatePaste] Error:", err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, error };
}

export function useDeletePaste() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const remove = useCallback(async (id: string, token: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await pastesApi.delete(id, token);
      return true;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to delete paste";
      setError(msg);
      console.error("[useDeletePaste] Error:", err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { remove, loading, error };
}
