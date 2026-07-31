import { Router } from "express";
import { createPaste, getPaste, listPastes, deletePaste } from "../controllers/pastes.controller";
import { validate } from "../middleware/validate";
import { createPasteRateLimiter } from "../middleware/rateLimiter";
import { createPasteSchema, listPastesSchema } from "../utils/schemas";

const router = Router();

/**
 * @openapi
 * /pastes:
 *   post:
 *     summary: Create a new paste
 *     tags: [Pastes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePasteRequest'
 *     responses:
 *       201:
 *         description: Paste created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreatePasteResponse'
 *       422:
 *         description: Validation error
 *       429:
 *         description: Rate limit exceeded
 */
router.post("/", createPasteRateLimiter, validate(createPasteSchema), createPaste);

/**
 * @openapi
 * /pastes:
 *   get:
 *     summary: List public pastes
 *     tags: [Pastes]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20, maximum: 50 }
 *       - in: query
 *         name: sort
 *         schema: { type: string, enum: [newest, most_viewed], default: newest }
 *     responses:
 *       200:
 *         description: Paginated list of public pastes
 */
router.get("/", validate(listPastesSchema, "query"), listPastes);

/**
 * @openapi
 * /pastes/{id}:
 *   get:
 *     summary: Get a paste by ID
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paste retrieved
 *       404:
 *         description: Paste not found
 *       410:
 *         description: Paste expired
 */
router.get("/:id", getPaste);

/**
 * @openapi
 * /pastes/{id}:
 *   delete:
 *     summary: Delete a paste using delete token
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: header
 *         name: X-Delete-Token
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Paste deleted
 *       403:
 *         description: Invalid delete token
 *       404:
 *         description: Paste not found
 */
router.delete("/:id", deletePaste);

export default router;
