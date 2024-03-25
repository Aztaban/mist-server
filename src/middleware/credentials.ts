import whitelist from "../config/whitelist";
import { Request, Response, NextFunction } from "express";

const credentials = (req: Request, res: Response, next: NextFunction) => {
  const origin: string | undefined = req.headers.origin;
  if (origin && whitelist.includes(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
  }
  next();
};

export default credentials;
