import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import Category from '../../models/Category';
import { updateProductById } from '../../services/productService';
import { buildImageUrl } from '../../utils/urlBuilder';

/**
 * Update a product by id.
 *
 * Route: PATCH /products/:id
 *
 * - Validates `:id`.
 * - If `category` is present in body, validates its ObjectId and existence.
 * - Delegates stock-delta rules to the service (maps "Stock cannot be negative" → 400).
 *
 * Responses:
 * - 200 OK:   `{ message, updatedProduct }`
 * - 400 Bad Request: invalid product/category id, non-existent category, or negative resulting stock
 * - 404 Not Found:    product not found
 * - 5xx: delegated to global error handler
 */
export const updateProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id: productId } = req.params;

    if (!productId || !mongoose.isValidObjectId(productId)) {
      const err = new Error('Invalid product id');
      (err as any).status = 400;
      throw err;
    }

    const updatedData = req.body as any;

    // If category is being changed, validate shape + existence
    if (updatedData?.category) {
      if (!mongoose.isValidObjectId(updatedData.category)) {
        const err = new Error('Invalid category id');
        (err as any).status = 400;
        throw err;
      }
      const catExists = await Category.exists({ _id: updatedData.category });
      if (!catExists) {
        const err = new Error('Category does not exist');
        (err as any).status = 400;
        throw err;
      }
    }

    const updatedProduct = await updateProductById(productId, updatedData);
    if (!updatedProduct) {
      const err = new Error('Product not found or failed to update');
      (err as any).status = 404;
      throw err;
    }

    res.json({
      message: 'Product updated successfully',
      updatedProduct: {
        ...updatedProduct.toJSON(),
        imageUrl: updatedProduct.image ? buildImageUrl(req, updatedProduct.image) : null,
      },
    });
  } catch (error: any) {
    // Map known business rule from the service to 400
    if (error?.message === 'Stock cannot be negative') {
      (error as any).status = 400;
    }
    next(error);
  }
};
