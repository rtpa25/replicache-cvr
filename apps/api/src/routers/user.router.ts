import { Router } from "express";

import { userController } from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import validate from "../middlewares/validate.middleware";
import { userCreateSchema } from "../schemas/user.schema";

export const userRouter = Router({ mergeParams: true });

/**
 * @method POST @url /users @desc create a new user and authenticate
 */
userRouter.post("/", validate(userCreateSchema), userController.createUser);

/**
 * @method GET @url /users @desc get's the current authenticated user
 */
userRouter.get("/", authenticate, userController.getCurrentUser);

/**
 * @method DELETE @url /users @desc delete the current authenticated user and logout
 */
userRouter.delete("/", authenticate, userController.deleteCurrentUser);
