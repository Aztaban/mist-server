/**
 * Global Express error handler.
 *
 * Logs the error and sends a JSON response. If the error includes a
 * `status` or `statusCode` property (common for app/HTTP errors),
 * that becomes the HTTP status; otherwise 500 is used.
 *
 * In production (`NODE_ENV=production`) stack traces are hidden for 5xx
 * to avoid leaking internals.
 *
 * Place this **after all routes** as the last `app.use(...)`.
 *
 * @param err - The thrown/rejected error captured by Express.
 * @param req - Incoming request.
 * @param res - Outgoing response.
 * @param next - Next middleware (unused; required by Express signature).
 */
import type { ErrorRequestHandler } from 'express';
import { logEvents } from './logEvents';

type HttpishError = Error & {
  status?: number;
  statusCode?: number;
  code?: string;
  details?: unknown;
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  const e = err as HttpishError;
  const status = e.statusCode ?? e.status ?? 500;
  const isProd = process.env.NODE_ENV === 'production';

  try {
    logEvents(`${status} ${req.method} ${req.originalUrl} :: ${e.name}: ${e.message}`, 'errLog.log');
    if (!isProd) console.error(e.stack);
  } catch {
    /* ignore logging failures */
  }

  // If headers already sent, delegate to Express’ default handler
  if (res.headersSent) return next(err);

  // Build safe response body
  const payload: Record<string, unknown> = {
    error: isProd && status >= 500 ? 'Internal Server Error' : e.message,
  };
  if (!isProd) {
    if (e.code) payload.code = e.code;
    if (e.details) payload.details = e.details;
    payload.stack = e.stack;
  }

  res.status(status).json(payload);
};

export default errorHandler;
