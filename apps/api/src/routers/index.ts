import { type Express, type NextFunction, type Request, type Response } from "express";

import { AppError } from "@repo/models";

import { logger } from "@repo/lib";

import { replicacheRouter } from "./replicache.router";
import { userRouter } from "./user.router";

export const createRouter = (app: Express) => {
  app.get("/health", (_req, res) => {
    res.send("healthy");
  });

  app.use("/users", userRouter);
  app.use("/replicache", replicacheRouter);

  app.use((err: Error, _: Request, res: Response, _next: NextFunction) => {
    if (err instanceof AppError) {
      return res.status(err.getStatusFromCode()).json({
        message: err.message,
      });
    }
    logger.error(err);
    return res.status(500).json({
      message: "Internal server error",
    });
  });

  app.use((_req, res) => {
    res.status(404).send("Not Found");
  });
};
