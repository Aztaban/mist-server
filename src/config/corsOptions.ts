/**
 * CORS configuration for the API.
 *
 * - Reads additional allowed origins from the env var `CORS_ORIGINS`
 *   (comma-separated list). Example:
 *     CORS_ORIGINS=https://mist-gate.vercel.app,https://app.example.com
 *
 * - Always allows common dev origins:
 *     http://localhost:5173, http://127.0.0.1:5173
 *
 * - Also allows Cloudflare Quick Tunnel hosts (`*.trycloudflare.com`)
 *   so you can swap tunnels without changing code.
 *
 * - `credentials: true` is enabled so cookies (httpOnly refresh token)
 *   work cross-site. Make sure you set your cookie with
 *   `sameSite: 'none'` and `secure: true` when using HTTPS.
 */
import type { CorsOptions } from 'cors';

/** Parse comma-separated env list into a set of origins. */
function parseOrigins(env: string | undefined): Set<string> {
  return new Set(
    (env ?? '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  );
}

const defaultDevOrigins = new Set(['http://localhost:5173', 'http://127.0.0.1:5173']);

const envOrigins = parseOrigins(process.env.CORS_ORIGINS);
const allowSet = new Set([...defaultDevOrigins, ...envOrigins]);

/** Accept rotating Cloudflare Quick Tunnel URLs. */
const allowTryCloudflare = /^https:\/\/[a-z0-9-]+\.trycloudflare\.com$/;

/** True if the given origin is allowed by our policy. */
export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true;
  return allowSet.has(origin) || allowTryCloudflare.test(origin);
}

const corsOptions: CorsOptions = {
  origin(origin, cb) {
    if (isOriginAllowed(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

export default corsOptions;
