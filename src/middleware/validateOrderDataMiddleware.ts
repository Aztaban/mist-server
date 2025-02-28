import { Request, Response, NextFunction } from 'express';
import { OrderItem } from '../models/Order';
import ProductModel from '../models/Product';
import { Address } from '../models/User';
import { ShippingMethod } from '../config/shippingMethod';

/**
 * Validates that each product in the order exists and has sufficient stock.
 * @param products - An array of OrderItem objects.
 * @throws Error if any product does not exist or lacks sufficient stock.
 */
const validateProducts = async (products: OrderItem[]): Promise<void> => {
  for (const { product, quantity } of products) {
    const productDoc = await ProductModel.findById(product);
    if (!productDoc) {
      throw new Error(`Product not found: ${product}`);
    }
    if (productDoc.countInStock < quantity) {
      throw new Error(`Insufficient stock for product: ${product}`);
    }
  }
};

/**
 * Middleware that validates order data including products, shipping address, and shipping method.
 */
export const validateOrderDataMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { products, shippingAddress, shippingMethod } = req.body as {
      products: OrderItem[];
      shippingAddress: Address; 
      shippingMethod: ShippingMethod; 
    };

    // Validate that products array exists and is not empty
    if (!products || !Array.isArray(products) || products.length === 0) {
      res.status(400).json({ message: 'Products array is required and cannot be empty.' });
      return;
    }

    // Validate products using the helper function
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

    next();
  } catch (error) {
    res.status(400).json({
      message:
        error instanceof Error
          ? error.message
          : 'Unknown error during order data validation.',
    });
  }
};
