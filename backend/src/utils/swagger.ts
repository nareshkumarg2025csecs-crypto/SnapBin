import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SnapBin API",
      version: "1.0.0",
      description:
        "REST API for SnapBin — a production-grade pastebin service. Create, share, and manage code snippets with expiry, burn-after-read, and syntax highlighting.",
      contact: {
        name: "SnapBin - Website",
        url: "https://snapbin.vercel.app/",
      },
    },
    servers: [
      {
        url: "/api",
        description: "API base path",
      },
    ],
    components: {
      schemas: {
        Paste: {
          type: "object",
          properties: {
            id: { type: "string", example: "V1StGXR8_Z5jdHi6B" },
            title: { type: "string", example: "My Snippet" },
            content: { type: "string", example: "console.log('hello');" },
            language: { type: "string", example: "javascript" },
            createdAt: { type: "string", format: "date-time" },
            expiresAt: { type: "string", format: "date-time", nullable: true },
            viewCount: { type: "integer", example: 42 },
            burnAfterRead: { type: "boolean", example: false },
            visibility: { type: "string", enum: ["public", "unlisted"] },
          },
        },
        CreatePasteRequest: {
          type: "object",
          required: ["content"],
          properties: {
            title: { type: "string", default: "Untitled Paste" },
            content: { type: "string" },
            language: { type: "string", default: "plaintext" },
            expiration: {
              type: "string",
              enum: ["10m", "1h", "1d", "1w", "never"],
              default: "never",
            },
            visibility: {
              type: "string",
              enum: ["public", "unlisted"],
              default: "public",
            },
            burnAfterRead: { type: "boolean", default: false },
          },
        },
        CreatePasteResponse: {
          type: "object",
          properties: {
            paste: { $ref: "#/components/schemas/Paste" },
            deleteToken: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            status: { type: "string", example: "error" },
            message: { type: "string" },
            code: { type: "string" },
          },
        },
      },
    },
  },
  apis: [
    "./src/routes/**/*.ts",
    "./dist/routes/**/*.js",
    "./src/controllers/**/*.ts",
    "./dist/controllers/**/*.js"
  ],
};

export const swaggerSpec = swaggerJsdoc(options);
