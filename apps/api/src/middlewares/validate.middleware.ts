import { type NextFunction, type Request, type Response } from "express";
import { type AnyZodObject } from "zod";

import { AppError } from "@repo/models";

const validate = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
  try {
    const safeParse = schema.safeParse({
      query: req.query,
      params: req.params,
      body: req.body,
      headers: req.headers,
    });

    if (!safeParse.success) {
      const errorMessages = safeParse.error.issues.map((issue) => issue.message);
      throw new AppError({
        code: "BAD_REQUEST",
        messages: errorMessages,
      });
    }

    next();
  } catch (e: unknown) {
    return res.status(400).send(e);
  }
};

export default validate;
