import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

type ValidateTarget = "body" | "query" | "params";

export function validate(schema: ZodSchema, target: ValidateTarget = "body") {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      res.status(422).json({
        status: "error",
        message: "Validation failed",
        code: "VALIDATION_ERROR",
        errors: (result.error as ZodError).errors.map((e) => ({
          field: e.path.join("."),
          message: e.message,
        })),
      });
      return;
    }
    req[target] = result.data;
    next();
  };
}
