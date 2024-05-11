import { type NextFunction, type Request, type RequestHandler, type Response } from "express";

import { AppError } from "@repo/models";

import { logger, verifyToken } from "@repo/lib";

import { cookieService } from "../services/cookie.service";

export const authenticate: RequestHandler = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = cookieService.getTokenCookie({ req });
    if (!token || typeof token !== "string") {
      throw new AppError({
        code: "UNAUTHORIZED",
        message: "No token provided",
      });
    }

    const res = await verifyToken(token);
    if (res.isExpired) {
      throw new AppError({
        code: "FORBIDDEN",
        message: "Token expired",
      });
    }

    req.user = {
      id: res.uid,
    };
  } catch (error) {
    logger.error(error);
    next(error);
  }
};
