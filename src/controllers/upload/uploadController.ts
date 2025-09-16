import { Response } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import * as uploadService from '../../services/uploadServices';
import { buildImageUrl } from '../../utils/urlBuilder';
import ProductModel from '../../models/Product';

/**
 * Upload a single image and return its stored filename.
 *
 * Route: POST /uploads/images   (example)
 * Auth:  requires a valid access token (uses `AuthRequest`)
 * Middleware: must be preceded by Multer `.single('image')`
 *
 * Request:
 * - Body/FormData: field "image" (file)
 *
 * Responses:
 * - 201 Created: `{ image: string }` (the stored filename)
 * - 400 Bad Request: no file provided
 * - 500 Internal Server Error: unexpected failure
 *
 * Notes:
 * - This assumes your Multer storage writes the file to disk and sets `req.file.filename`.
 */
export const handleImageUpload = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filename = await uploadService.saveFile(req.file);
    return res.status(201).json({
      image: filename,
      imageUrl: buildImageUrl(req, filename),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Upload Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unexpected error occurred';
    return res.status(500).json({ error: errorMessage });
  }
};

/**
 * Replace a product's image: deletes the old file (best-effort) and saves the new one.
 *
 * Route: PATCH /products/:id/image   (example)
 * Auth:  requires a valid access token (uses `AuthRequest`)
 * Middleware: must be preceded by Multer `.single('image')`
 *
 * Request:
 * - Params: `{ id: string }` (product id)
 * - Body/FormData: field "image" (file)
 *
 * Responses:
 * - 200 OK: `{ image: string }` (the new stored filename)
 * - 400 Bad Request: no file provided
 * - 404 Not Found: product does not exist
 * - 500 Internal Server Error: unexpected failure
 */
export const handleProductImageUpdate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filename = await uploadService.updateProductImage(req.params.id, req.file!);

    const product = await ProductModel.findById(req.params.id).exec();
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.status(200).json({
      ...product.toJSON(),
      imageUrl: buildImageUrl(req, filename),
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating product image:', error);
    const msg = error instanceof Error ? error.message : 'Unexpected error';

    if (msg === 'Product not found') {
      return res.status(404).json({ error: msg });
    }
    return res.status(500).json({ error: msg });
  }
};
