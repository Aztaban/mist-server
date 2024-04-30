import { logEvents } from "./logEvents";
import { Request, Response,NextFunction } from "express";

const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logEvents(`${err.name}: ${err.message}`, 'errLog.log');
  console.error(err.stack);
  res.status(500).send(err.message);
}

export default errorHandler;