import { Request, Response, NextFunction } from "express";
import { AnyZodObject, ZodError } from "zod";
import { ApiError } from "../utils/ApiError";

interface ValidationSchemas {
  body?: AnyZodObject;
  query?: AnyZodObject;
  params?: AnyZodObject;
}

export const validate =
  (schemas: ValidationSchemas) =>
    (req: Request, _res: Response, next: NextFunction) => {
      try {
        if (schemas.body) {
          req.body = schemas.body.parse(req.body);
        }

        if (schemas.query) {
          (req as Request & { query: unknown }).query =
            schemas.query.parse(req.query);
        }

        if (schemas.params) {
          (req as Request & { params: unknown }).params =
            schemas.params.parse(req.params);
        }

        next();
      } catch (error) {
        if (error instanceof ZodError) {
          return next(
            ApiError.badRequest(
              "Validation failed",
              error.flatten().fieldErrors
            )
          );
        }

        next(error);
      }
    };