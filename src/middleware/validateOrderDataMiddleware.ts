import { Request, Response, NextFunction } from 'express';
import { OrderItem } from '../models/Order';
import ProductModel from '../models/Product';
import { Address } from '../models/User';
import { ShippingMethod } from '../config/shippingMethod';

/**
 * Validate that every requested product exists and has sufficient stock.
 *
 * @param products - Array of order items `{ product, quantity }`.
 * @throws Error If any product does not exist or has insufficient stock.
 */
const validateProducts = async (products: OrderItem[]): Promise<void> => {
  for (const { product, quantity } of products) {
    const productDoc = await ProductModel.findById(product);
    if (!productDoc) {
      throw new Error(`Product not found: ${product}`);
    }
    if (productDoc.countInStock < quantity) {
      throw new Error(`Insufficient stock for product: ${product} (have ${productDoc.countInStock}, need ${quantity})`);
    }
  }
};

/**
 * Middleware: validate order payload (products, shipping address, shipping method).
 *
 * Expects `req.body` to contain:
 * - `products`: `OrderItem[]` (non-empty)
 * - `shippingAddress`: `Address`
 * - `shippingMethod`: `ShippingMethod`
 *
 * On success, calls `next()`. On failure, responds with `400` and a message.
 *
 * @param req - Express request (body must include the fields above).
 * @param res - Express response.
 * @param next - Next middleware.
 */
export const validateOrderDataMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { products, shippingAddress, shippingMethod } = req.body as {
      products: OrderItem[];
      shippingAddress: Address;
      shippingMethod: ShippingMethod;
    };

    // Validate products array
    if (!Array.isArray(products) || products.length === 0) {
      res.status(400).json({ message: 'Products array is required and cannot be empty.' });
      return;
    }

    // Validate each product/stock
    await validateProducts(products);

    // Validate shipping address
    if (!shippingAddress) {
      res.status(400).json({ message: 'Shipping address is required.' });
      return;
    }

    // Validate shipping method
    if (!shippingMethod) {
      res.status(400).json({ message: 'Shipping method is required.' });
      return;
    }

    // Optional: make validated data available to downstream handlers
    // res.locals.orderInput = { products, shippingAddress, shippingMethod };

    next();
  } catch (error) {
    res.status(400).json({
      message: error instanceof Error ? error.message : 'Unknown error during order data validation.',
    });
  }
};
