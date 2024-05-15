import { Router } from "express";

import { socketController } from "../controllers/socket.controller";
import { authenticate } from "../middlewares/auth.middleware";

export const socketRouter = Router({ mergeParams: true });

/**
 * @method GET @url /socket/token @desc get's the current authenticated user
 */
socketRouter.get("/token", authenticate, socketController.getToken);
