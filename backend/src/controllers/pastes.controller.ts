import { Request, Response, NextFunction } from "express";
import * as pastesService from "../services/pastes.service";
import { CreatePasteInput, ListPastesInput } from "../utils/schemas";
import { logger } from "../utils/logger";

export async function createPaste(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.body as CreatePasteInput;

    logger.info({
      payload: {
        title: input.title,
        language: input.language,
        expiration: input.expiration,
        visibility: input.visibility,
        burnAfterRead: input.burnAfterRead,
      },
    }, "Paste creation request payload");

    const result = await pastesService.createPaste(input);

    logger.info({ id: result.id }, "Paste created successfully");

    res.status(201).json(result);
  } catch (err) {
    logger.error({ err }, "Failed to create paste");
    next(err);
  }
}

export async function getPaste(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    logger.info({ id }, "Paste retrieval request");

    const result = await pastesService.getPasteById(id);

    logger.info({ id, burned: result.burned, viewCount: result.paste.viewCount }, "Paste retrieved successfully");

    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (err) {
    logger.error({ err, id: req.params.id }, "Failed to retrieve paste");
    next(err);
  }
}

export async function listPastes(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = req.query as unknown as ListPastesInput;
    const result = await pastesService.listPublicPastes(input);
    res.status(200).json({
      status: "ok",
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function deletePaste(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params;
    const deleteToken = req.headers["x-delete-token"] as string;

    logger.info({ id }, "Paste deletion request");

    if (!deleteToken) {
      res.status(400).json({
        status: "error",
        message: "Delete token required in X-Delete-Token header",
        code: "MISSING_DELETE_TOKEN",
      });
      return;
    }

    await pastesService.deletePaste(id, deleteToken);

    logger.info({ id }, "Paste deleted successfully");

    res.status(200).json({
      status: "ok",
      message: "Paste deleted successfully",
    });
  } catch (err) {
    logger.error({ err, id: req.params.id }, "Failed to delete paste");
    next(err);
  }
}
