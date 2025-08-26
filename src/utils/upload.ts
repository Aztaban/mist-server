/**
 * Multer configuration for single image uploads.
 *
 * - Stores files on disk under `<outDir>/public/uploads/images` by default.
 *   Override with env: `UPLOAD_DIR=/app/public/uploads/images`.
 * - Accepts: JPEG/JPG, PNG, GIF, WebP.
 * - Max size: 2 MiB.
 *
 * Usage in a route:
 *   import { singleFileUpload } from '../middleware/upload';
 *   router.post('/upload', singleFileUpload, (req, res) => {
 *     // file is at req.file
 *     res.json({ file: req.file });
 *   });
 */

import multer from 'multer';
import path from 'path';
import { mkdirSync } from 'fs';
import type { Request } from 'express';

/** Destination directory for uploads (ensure it exists on module load). */
const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(__dirname, '../../public/uploads/images');
mkdirSync(UPLOAD_DIR, { recursive: true });

/** Basic filename sanitizer: keep letters/numbers/._- and cap length. */
function sanitizeFilename(original: string): string {
  const base = path.basename(original); // prevent path traversal
  const cleaned = base.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  // Avoid empty/too-long names
  return (cleaned || 'file').slice(0, 100);
}

/**
 * Disk storage: places files in UPLOAD_DIR and prefixes a unique suffix.
 * Example final name: `1714159012345-123456789-orig.png`
 */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safe = sanitizeFilename(file.originalname);
    cb(null, `${uniqueSuffix}-${safe}`);
  },
});

/**
 * Only allow common image types by extension *and* MIME.
 * Reject with a helpful error message otherwise.
 */
const fileFilter: multer.Options['fileFilter'] = (_req: Request, file: Express.Multer.File, cb) => {
  const allowed = /^(image\/jpeg|image\/png|image\/gif|image\/webp)$/;
  const extOK = /\.(jpe?g|png|gif|webp)$/i.test(file.originalname);
  const mimeOK = allowed.test(file.mimetype);

  if (extOK && mimeOK) return cb(null, true);

  cb(new Error('Invalid file type. Only JPEG, JPG, PNG, GIF, and WebP files are allowed.'));
};

/**
 * Multer instance with size limits and our filter/storage.
 * - `fileSize`: 2 MiB per file
 */
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

/** Middleware to handle a single file field named "image". */
export const singleFileUpload = upload.single('image');
