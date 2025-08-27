import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Category from '../../models/Category';
import { createProductService } from '../../services/productService';

/**
 * Create a new product.
 *
 * Route: POST /products
 *
 * Request body (required):
 * - `name`: string
 * - `category`: string (ObjectId)
 * - `image`: string
 * - `details.author`: string
 * - `price`: number
 *
 * Responses:
 * - 201 Created: returns the created product document
 * - 400 Bad Request: missing/invalid fields or non-existent category
 * - 5xx: delegated to global error handler
 *
 * Notes:
 * - This controller validates category existence; the service also validates it.
 *   You can remove one of these checks to avoid duplication.
 */
export const createNewProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const newProduct = req.body as {
      name?: string;
      category?: string;
      image?: string;
      details?: { author?: string };
      price?: number;
      // ...any other fields your model supports
    };

    // Required fields check
    if (
      !newProduct.name ||
      !newProduct.category ||
      !newProduct.image ||
      !newProduct.details?.author ||
      newProduct.price == null
    ) {
      const err = new Error('Missing: name, category, image, details.author, price');
      (err as any).status = 400;
      throw err;
    }

    // Category id shape
    if (!mongoose.isValidObjectId(newProduct.category)) {
      const err = new Error('Invalid category id');
      (err as any).status = 400;
      throw err;
    }

    // Ensure category exists
    const categoryExist = await Category.findById(newProduct.category).lean().exec();
    if (!categoryExist) {
      const err = new Error('Category does not exist');
      (err as any).status = 400;
      throw err;
    }

    const createdProduct = await createProductService(newProduct as any);
    res.status(201).json(createdProduct);
  } catch (error) {
    next(error);
  }
};
