import { Request, Response, NextFunction } from 'express';
import { getAllProductsService, getProductById } from '../../services/productService';
import mongoose from 'mongoose';

/**
 * List all products (with category name populated).
 *
 * Route: GET /products
 *
 * Responses:
 * - 200 OK: array of products (may be empty [])
 * - 500 Internal Server Error: unexpected failure
 *
 * @remarks Returning 200 with an empty array is client-friendly (vs 204).
 */
export const getAllProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await getAllProductsService();
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single product by id (with category name populated).
 *
 * Route: GET /products/:id
 *
 * Responses:
 * - 200 OK: the product document
 * - 400 Bad Request: invalid ObjectId
 * - 404 Not Found: no product with that id
 * - 500 Internal Server Error: unexpected failure
 */
export const getProduct = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Validate ObjectId shape early
    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({ message: 'Invalid product id' });
      return;
    }

    const product = await getProductById(id);
    if (!product) {
      res.status(404).json({ message: `No product found with ID ${id}` });
      return;
    }

    res.json(product);
  } catch (error) {
    next(error);
  }
};
