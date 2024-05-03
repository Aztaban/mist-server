import { Request, Response, NextFunction } from "express";
import rateLimit, { RateLimitRequestHandler, Options } from "express-rate-limit";
import { logEvents } from "./logEvents";

const loginLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again after a 60 second',
  handler: (req: Request, res: Response, next: NextFunction, optionsUsed: Options ) => {
    const ipAdress = req.socket.remoteAddress;
    logEvents(`Too Many Requests: Login Attempts\t${req.method}\t${req.url}\t${req.headers.origin}\t${ipAdress}`, 'logLimit.log');
    res.status(optionsUsed.statusCode || 429).send(optionsUsed.message);
  },
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false
})

export default loginLimiter;