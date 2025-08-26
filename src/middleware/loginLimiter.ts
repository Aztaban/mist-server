/**
 * Rate limiter for the login endpoint.
 *
 * - Window: 60 seconds
 * - Max: 5 attempts per IP
 * - Logs bursts to "logLimit.log"
 *
 * Notes:
 * - If you’re behind a proxy/tunnel (NGINX/Cloudflare), enable:
 *     app.set('trust proxy', 1)
 *   so `req.ip` reflects the real client IP.
 *
 * Usage:
 *   router.post('/auth/login', loginLimiter, handleLogin);
 */
import type { Request, Response, NextFunction } from 'express';
import rateLimit, { type RateLimitRequestHandler, type Options } from 'express-rate-limit';
import { logEvents } from './logEvents';

const loginLimiter: RateLimitRequestHandler = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: 'Too many login attempts from this IP, please try again after 60 seconds.',
  statusCode: 429,
  standardHeaders: true,
  legacyHeaders: false,

  handler: (req: Request, res: Response, _next: NextFunction, options: Options) => {
    const ipAddress = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    void logEvents(
      `Too Many Requests: Login Attempts\t${req.method}\t${req.originalUrl}\t${req.headers.origin ?? ''}\t${ipAddress}`,
      'logLimit.log'
    );

    res
      .status(options.statusCode ?? 429)
      .json({ error: typeof options.message === 'string' ? options.message : 'Too Many Requests' });
  },

  // rate-limit per (IP + username)
  keyGenerator: (req) => `${req.ip}:${(req.body?.username ?? '').toLowerCase()}`,
});

export default loginLimiter;
