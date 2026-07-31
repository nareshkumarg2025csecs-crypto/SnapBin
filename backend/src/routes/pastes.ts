import { Router } from "express";
import { createPaste, getPaste, listPastes, deletePaste, updatePaste } from "../controllers/pastes.controller";
import { validate } from "../middleware/validate";
import { createPasteRateLimiter } from "../middleware/rateLimiter";
import { createPasteSchema, listPastesSchema, updatePasteSchema } from "../utils/schemas";

const router = Router();

/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", createPasteRateLimiter, validate(createPasteSchema), createPaste);

/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: object
 *                   properties:
 *                     pastes:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Paste'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page: { type: integer, example: 1 }
 *                         limit: { type: integer, example: 20 }
 *                         total: { type: integer, example: 100 }
 *                         totalPages: { type: integer, example: 5 }
 *                         hasNext: { type: boolean, example: true }
 *                         hasPrev: { type: boolean, example: false }
 */
router.get("/", validate(listPastesSchema, "query"), listPastes);

/**
 * @swagger
 * /pastes/{id}:
 *   get:
 *     summary: Get a paste by ID
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *       - in: header
 *         name: X-View-Password
 *         schema: { type: string }
 *         description: Optional view password if paste is protected
 *     responses:
 *       200:
 *         description: Paste retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 data:
 *                   type: object
 *                   properties:
 *                     paste:
 *                       $ref: '#/components/schemas/Paste'
 *                     burned:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: View password required or incorrect
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Paste not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       410:
 *         description: Paste expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getPaste);

/**
 * @swagger
 * /pastes/{id}:
 *   put:
 *     summary: Update a paste in place using edit password
 *     tags: [Pastes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [editPassword]
 *             properties:
 *               title: { type: string }
 *               content: { type: string }
 *               language: { type: string }
 *               editPassword: { type: string }
 *     responses:
 *       200:
 *         description: Paste updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 data:
 *                   $ref: '#/components/schemas/Paste'
 *       401:
 *         description: Incorrect edit password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Paste is not editable
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Paste not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/:id", validate(updatePasteSchema), updatePaste);

/**
 * @swagger
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: ok }
 *                 message: { type: string, example: Paste deleted successfully }
 *       400:
 *         description: Missing delete token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid delete token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Paste not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete("/:id", deletePaste);

export default router;
