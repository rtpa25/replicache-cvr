import { Router } from "express";

import { socketController } from "../controllers/socket.controller";

export const socketRouter = Router({ mergeParams: true });

/**
 * @method GET @url /socket/token @desc get's the current authenticated user
 */
socketRouter.get("/token", socketController.getToken);
