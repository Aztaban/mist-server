import fs from 'fs';
import path from 'path';
import ProductModel from '../models/Product';

const IMAGES_DIR = process.env.UPLOAD_DIR ?? path.join(__dirname, '../../public/uploads/images');

/**
 * Persist an uploaded file and return its stored filename.
 *
 * Assumes Multer has already written the file to disk and populated:
 * - `file.filename`  (sanitized, unique name from your Multer storage config)
 *
 * @param file - Uploaded file object from Multer.
 * @returns The stored filename (string).
 * @throws Error if no file was provided.
 */
export const saveFile = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new Error('No file uploaded');
  }
  return file.filename;
};

/**
 * Replace a product's image:
 * - Loads the product
 * - Deletes the old image file if it exists (best-effort; non-blocking)
 * - Saves the new filename on the product and persists it
 *
 * @param productId - The product's id.
 * @param file - Uploaded file object from Multer.
 * @returns The new image filename.
 * @throws Error if no file was provided or the product does not exist.
 *
 * @remarks
 * - Old file deletion is done with a non-awaited callback for best effort; failures are logged.
 *   If you prefer strict cleanup, switch to `await fs.promises.unlink(...)` and handle ENOENT.
 */
export const updateProductImage = async (productId: string, file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Delete old image if present (best-effort)
  if (product.image) {
    const imagePath = path.join(IMAGES_DIR, product.image);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, (err) => {
        if (err) console.error('Error deleting old image:', err);
      });
    }
  }

  // Save new image filename
  product.image = file.filename;
  await product.save();

  return file.filename;
};
