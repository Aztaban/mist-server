/**
 * Request/Events logging utilities.
 *
 * - By default writes logs to `<outDir>/logs` (e.g. `build/logs` at runtime).
 *   Override with env: `LOG_DIR=/app/logs`.
 * - Each line: `DD.MM.YYYY<TAB>HH:mm:ss<TAB>UUIDv4<TAB>message`.
 * - `logger` logs every request method, origin, and URL.
 *
 * Usage:
 *   app.use(logger); // logs to reqLog.log
 *   await logEvents('Something', 'custom.log');
 */
import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import { promises as fsp } from 'fs';
import path from 'path';
import type { Request, Response, NextFunction } from 'express';

const LOG_DIR = process.env.LOG_DIR ?? path.join(__dirname, '..', 'logs');

/**
 * Append a single log line to a file inside the logs directory.
 * @param message - The message to write (single line).
 * @param logName - Target filename (e.g., "reqLog.log", "errLog.log").
 */
export const logEvents = async (message: string, logName: string): Promise<void> => {
  const dateTime = format(new Date(), 'dd.MM.yyyy\tHH:mm:ss');
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  // echo to console for quick debugging
  // eslint-disable-next-line no-console
  console.log(logItem);

  try {
    await fsp.mkdir(LOG_DIR, { recursive: true }); // idempotent
    await fsp.appendFile(path.join(LOG_DIR, logName), logItem, 'utf8');
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('logEvents failed:', err);
  }
};

/**
 * Express middleware: logs each incoming request.
 * Writes to "reqLog.log" using the same format as `logEvents`.
 */
export const logger = (req: Request, _res: Response, next: NextFunction): void => {
  const origin = (req.headers.origin as string | undefined) ?? '';
  void logEvents(`${req.method}\t${origin}\t${req.url}`, 'reqLog.log');

  // concise console line
  // eslint-disable-next-line no-console
  console.log(`${req.method} ${req.path}`);

  next();
};
