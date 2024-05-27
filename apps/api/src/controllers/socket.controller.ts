import { type NextFunction, type Request, type RequestHandler, type Response } from "express";

import { ably } from "@repo/lib";

class SocketController {
  public getToken: RequestHandler = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenRes = await ably.auth.createTokenRequest({
        clientId: req.user.id,
      });

      res.status(200).json(tokenRes);
    } catch (error) {
      next(error);
    }
  };
}

export const socketController = new SocketController();
