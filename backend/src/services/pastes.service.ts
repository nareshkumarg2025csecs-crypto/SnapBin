import { nanoid } from "nanoid";
import bcrypt from "bcryptjs";
import { prisma } from "../prisma/client";
import { createError } from "../middleware/errorHandler";
import { CreatePasteInput, ListPastesInput, UpdatePasteInput } from "../utils/schemas";
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

  const viewPasswordHash = input.viewPassword ? await bcrypt.hash(input.viewPassword, 10) : null;
  const hasViewPassword = !!input.viewPassword;
  const editPasswordHash = input.editPassword ? await bcrypt.hash(input.editPassword, 10) : null;
  const hasEditPassword = !!input.editPassword;

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
      viewPasswordHash,
      editPasswordHash,
      hasViewPassword,
      hasEditPassword,
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
    hasViewPassword: paste.hasViewPassword,
    hasEditPassword: paste.hasEditPassword,
    deleteToken,
  };
}

export async function getPasteById(id: string, viewPassword?: string) {
  logger.info({ id }, "Querying paste from database");

  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    logger.warn({ id }, "Paste not found in database");
    throw createError("Paste not found", 404, "PASTE_NOT_FOUND");
  }

  if (paste.hasViewPassword) {
    if (!viewPassword) {
      throw createError("View password required", 401, "VIEW_PASSWORD_REQUIRED");
    }
    const match = await bcrypt.compare(viewPassword, paste.viewPasswordHash || "");
    if (!match) {
      throw createError("Incorrect view password", 401, "INVALID_VIEW_PASSWORD");
    }
  }

  if (paste.expiresAt && paste.expiresAt < new Date()) {
    logger.info({ id }, "Paste expired, removing from database");
    await prisma.paste.delete({ where: { id } });
    throw createError("Paste has expired", 410, "PASTE_EXPIRED");
  }

  const responseData = {
    paste: {
      id: paste.id,
      title: paste.title,
      content: paste.content,
      language: paste.language,
      createdAt: paste.createdAt,
      expiresAt: paste.expiresAt,
      viewCount: paste.viewCount,
      burnAfterRead: paste.burnAfterRead,
      visibility: paste.visibility as "public" | "unlisted",
      hasViewPassword: paste.hasViewPassword,
      hasEditPassword: paste.hasEditPassword,
    },
    burned: paste.burnAfterRead,
  };

  if (paste.burnAfterRead) {
    logger.info({ id }, "Burn-after-read paste accessed, removing from database");
    await prisma.paste.delete({ where: { id } });
  } else {
    await prisma.paste.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return responseData;
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
        hasViewPassword: true,
        hasEditPassword: true,
      },
    }),
    prisma.paste.count({ where }),
  ]);

  return {
    pastes,
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

export async function updatePaste(id: string, input: UpdatePasteInput) {
  const paste = await prisma.paste.findUnique({ where: { id } });

  if (!paste) {
    throw createError("Paste not found", 404, "PASTE_NOT_FOUND");
  }

  if (!paste.hasEditPassword) {
    throw createError("This paste is not editable", 403, "PASTE_NOT_EDITABLE");
  }

  const match = await bcrypt.compare(input.editPassword, paste.editPasswordHash || "");
  if (!match) {
    throw createError("Incorrect edit password", 401, "INVALID_EDIT_PASSWORD");
  }

  const updated = await prisma.paste.update({
    where: { id },
    data: {
      title: input.title !== undefined ? (input.title || "Untitled Paste") : undefined,
      content: input.content,
      language: input.language,
    },
  });

  return {
    id: updated.id,
    title: updated.title,
    content: updated.content,
    language: updated.language,
    createdAt: updated.createdAt,
    expiresAt: updated.expiresAt,
    viewCount: updated.viewCount,
    burnAfterRead: updated.burnAfterRead,
    visibility: updated.visibility as "public" | "unlisted",
    hasViewPassword: updated.hasViewPassword,
    hasEditPassword: updated.hasEditPassword,
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
