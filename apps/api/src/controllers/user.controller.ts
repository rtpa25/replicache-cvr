import { type NextFunction, type Request, type RequestHandler, type Response } from "express";

import { generateEncryptedToken, logger } from "@repo/lib";

import { type UserCreateType } from "../schemas/user.schema";
import { cookieService } from "../services/cookie.service";
import { userService } from "../services/user.service";

class UserController {
  createUser: RequestHandler = async (
    req: Request<object, object, UserCreateType["body"]>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const user = await userService.createUser(req.body.email);
      logger.info(`User created: ${user.id}`);

      const { token } = await generateEncryptedToken({
        uid: user.id,
      });

      cookieService.setTokenCookie({ res, token });

      res.status(201).send(user);
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  deleteCurrentUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      await userService.deleteUser(user.id);
      cookieService.clearTokenCookie({ res });
      res.status(204).send();
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  getCurrentUser: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      res.status(200).send({
        userId: user.id,
      });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };
}

export const userController = new UserController();
