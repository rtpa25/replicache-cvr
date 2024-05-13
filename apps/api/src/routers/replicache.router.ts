import { Router } from "express";

import { pushRequestSchema } from "@repo/models";

import { replicacheController } from "../controllers/replicache.controller";
import { authenticate } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";

export const replicacheRouter = Router({ mergeParams: true });

/**
 * @method POST @url /replicache/push @desc push mutations to the server
 */
replicacheRouter.post(
  "/push",
  validate(pushRequestSchema),
  authenticate,
  replicacheController.push,
);

/**
 * @method POST @url /replicache/pull @desc pull diff from the server
 */
replicacheRouter.get("/pull", authenticate, replicacheController.pull);
