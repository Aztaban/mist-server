/**
 * Conditionally enables credentialed CORS responses.
 *
 * If the request's `Origin` is allowed by our CORS policy,
 * add `Access-Control-Allow-Credentials: true` so browsers
 * may send/receive cookies (`credentials: 'include'`).
 *
 * This should run **before** `cors(corsOptions)`.
 */
import type { Request, Response, NextFunction } from 'express';
import { isOriginAllowed } from '../config/corsOptions';

export default function credentials(req: Request, res: Response, next: NextFunction) {
  const origin = req.headers.origin as string | undefined;
  if (isOriginAllowed(origin)) {
    res.header('Access-Control-Allow-Credentials', 'true');
    // Helpful for caches/proxies so responses vary by Origin
    res.header('Vary', 'Origin');
  }
  next();
}
