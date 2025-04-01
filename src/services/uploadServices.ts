import fs from 'fs';
import path from 'path';
import ProductModel from '../models/Product';

const IMAGES_DIR = path.join(__dirname, '../../public/uploads/images');

/**
 * Saves a file and returns the filename.
 * @param file - Uploaded file object.
 * @returns File name.
 */
export const saveFile = async (file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  return file.filename;
};

/**
 * Updates a product's image and deletes the old one.
 * @param productId - ID of the product.
 * @param file - Uploaded file object.
 * @returns Updated image filename.
 */
export const updateProductImage = async (productId: string, file: Express.Multer.File): Promise<string> => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const product = await ProductModel.findById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  // Delete old image if it exists
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
