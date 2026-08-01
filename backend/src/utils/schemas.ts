import { z } from "zod";

export const SUPPORTED_LANGUAGES = [
  "plaintext",
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "go",
  "rust",
  "ruby",
  "php",
  "swift",
  "kotlin",
  "html",
  "css",
  "json",
  "yaml",
  "toml",
  "markdown",
  "sql",
  "bash",
  "dockerfile",
  "xml",
] as const;

export const EXPIRATION_VALUES = [
  "10m",
  "1h",
  "1d",
  "1w",
  "never",
] as const;

export const createPasteSchema = z.object({
  title: z.string().max(200).default("Untitled Paste"),
  content: z.string().min(1, "Content cannot be empty").max(500000, "Content exceeds 500KB limit"),
  language: z
    .enum(SUPPORTED_LANGUAGES)
    .default("plaintext"),
  expiration: z.enum(EXPIRATION_VALUES).default("never"),
  visibility: z.enum(["public", "unlisted"]).default("public"),
  burnAfterRead: z.boolean().default(false),
});

export const listPastesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["newest", "most_viewed"]).default("newest"),
  search: z.string().optional(),
});

export type CreatePasteInput = z.infer<typeof createPasteSchema>;
export type ListPastesInput = z.infer<typeof listPastesSchema>;
