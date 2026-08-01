import { nanoid } from "nanoid";
import { prisma } from "../prisma/client";
import { createError } from "../middleware/errorHandler";
import { CreatePasteInput, ListPastesInput } from "../utils/schemas";
import { logger } from "../utils/logger";

function computeExpiresAt(expiration: string): Date | null {
  const now = new Date();
  switch (expiration) {
    case "10m":
      return new Date(now.getTime() + 10 * 60 * 1000);
    case "1h":
      return new Date(now.getTime() + 60 * 60 * 1000);
    case "1d":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    case "1w":
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    case "never":
      return null;
    default:
      return null;
  }
}

export async function createPaste(input: CreatePasteInput) {
  const id = nanoid(16);
  const deleteToken = nanoid(32);
  const expiresAt = computeExpiresAt(input.expiration ?? "never");

  logger.info({ id, language: input.language, expiresAt, burnAfterRead: input.burnAfterRead }, "Inserting paste into database");

  const paste = await prisma.paste.create({
    data: {
      id,
      title: input.title || "Untitled Paste",
      content: input.content,
      language: input.language || "plaintext",
      expiresAt,
      burnAfterRead: input.burnAfterRead === true,
      visibility: input.visibility || "public",
      deleteToken,
    },
  });

  logger.info({ id: paste.id, status: "SUCCESS" }, "Database insertion status: SUCCESS");

  return {
    id: paste.id,
    title: paste.title,
    content: paste.content,
    language: paste.language,
    createdAt: paste.createdAt,
    expiresAt: paste.expiresAt,
    viewCount: paste.viewCount,
    burnAfterRead: paste.burnAfterRead,
    visibility: paste.visibility as "public" | "unlisted",
    deleteToken,
  };
}

type RawPasteRow = {
  id: string;
  title: string;
  content: string;
  language: string;
  createdAt: Date;
  expiresAt: Date | null;
  viewCount: number;
  burnAfterRead: boolean;
  visibility: string;
};

export async function getPasteById(id: string) {
  logger.info({ id }, "Querying paste from database");

  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    logger.warn({ id }, "Paste not found in database");
    throw createError("Paste not found", 404, "PASTE_NOT_FOUND");
  }

  if (paste.expiresAt && paste.expiresAt < new Date()) {
    logger.info({ id }, "Paste expired, removing from database");
    await prisma.paste.delete({ where: { id } });
    throw createError("Paste has expired", 410, "PASTE_EXPIRED");
  }

  if (paste.burnAfterRead) {
    logger.info({ id }, "Burn-after-read paste accessed, attempting atomic read-and-delete");

    const rows = await prisma.$queryRaw<RawPasteRow[]>`
      DELETE FROM "Paste"
      WHERE id = ${id} AND "burnAfterRead" = true
      RETURNING
        id,
        title,
        content,
        language,
        "createdAt",
        "expiresAt",
        "viewCount",
        "burnAfterRead",
        visibility
    `;

    if (rows.length === 0) {
      logger.warn({ id }, "Burn-after-read paste already consumed by concurrent request");
      throw createError("Paste already consumed", 410, "PASTE_ALREADY_CONSUMED");
    }

    const row = rows[0];

    logger.info({ id }, "Burn-after-read paste consumed and deleted");

    return {
      paste: {
        id: row.id,
        title: row.title,
        content: row.content,
        language: row.language,
        createdAt: row.createdAt,
        expiresAt: row.expiresAt,
        viewCount: row.viewCount,
        burnAfterRead: true,
        visibility: row.visibility as "public" | "unlisted",
      },
      burned: true,
    };
  }

  const updated = await prisma.paste.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
    select: { viewCount: true },
  });

  logger.info({ id, viewCount: updated.viewCount }, "Paste retrieved and view count incremented");

  return {
    paste: {
      id: paste.id,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      viewCount: updated.viewCount,
      burnAfterRead: false,
      visibility: paste.visibility as "public" | "unlisted",
    },
    burned: false,
  };
}


export async function listPublicPastes(input: ListPastesInput) {
  const { page, limit, sort } = input;
  const skip = (page - 1) * limit;

  const orderBy =
    sort === "most_viewed"
      ? { viewCount: "desc" as const }
      : { createdAt: "desc" as const };

  const where = {
    visibility: "public",
    OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
  };

  const [pastes, total] = await Promise.all([
    prisma.paste.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        title: true,
        language: true,
        createdAt: true,
        expiresAt: true,
        viewCount: true,
        visibility: true,
        burnAfterRead: true,
      },
    }),
    prisma.paste.count({ where }),
  ]);

  return {
    pastes: pastes.map(p => ({
      ...p,
      visibility: p.visibility as "public" | "unlisted",
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  };
}

export async function deletePaste(id: string, deleteToken: string) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw createError("Paste not found", 404, "PASTE_NOT_FOUND");
  }

  if (paste.deleteToken !== deleteToken) {
    throw createError("Invalid delete token", 403, "INVALID_DELETE_TOKEN");
  }

  await prisma.paste.delete({ where: { id } });
  logger.info({ id }, "Paste deleted from database");
}
