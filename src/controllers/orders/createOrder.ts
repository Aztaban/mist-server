import { Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import { createOrderService } from '../../services/orderServices';
import { OrderItem } from '../../models/Order';
import { Address } from '../../models/User';
import { ShippingMethod } from '../../config/shippingMethod';

/**
 * Create a new order for the authenticated user.
 *
 * Route: POST /orders
 * Auth: requires a valid access token (sets `req.user` via verifyJWT)
 *
 * Request body:
 * - `products`        OrderItem[] (non-empty; each item has `product` id + `quantity`)
 * - `shippingAddress` Address
 * - `shippingMethod`  ShippingMethod
 * - `phoneNumber?`    string (optional)
 *
 * Behavior:
 * - Validates presence/shape of required fields.
 * - Throws 401 if no authenticated user is present on the request.
 * - Calls `createOrderService`, which performs transactional stock checks/updates.
 *
 * Responses:
 * - 201 Created: returns the new order id (currently the raw `_id`)
 * - 400 Bad Request: missing/invalid body fields
 * - 401 Unauthorized: user not authenticated
 * - 5xx: delegated to the global error handler
 *
 * Notes:
 * - We throw `Error` objects with a `status` property; the global error handler
 *   uses `err.status` to choose the HTTP status code.
 */
export const createNewOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Narrow `req.body` to the expected shape
    const { products, shippingAddress, shippingMethod, phoneNumber } = req.body as {
      products: OrderItem[];
      shippingAddress: Address;
      shippingMethod: ShippingMethod;
      phoneNumber?: string;
    };

    // Ensure the user is authenticated
    if (!req.user) {
      const err = new Error('Unauthorized: User not authenticated.');
      (err as any).status = 401;
      throw err;
    }

    // Basic payload validation
    if (!Array.isArray(products) || products.length === 0 || !shippingAddress || !shippingMethod) {
      const err = new Error('Products and shipping address are required');
      (err as any).status = 400;
      throw err;
    }

    // Create order (service handles transactional stock updates)
    const order = await createOrderService(req.user, products, shippingAddress, shippingMethod, phoneNumber);

    res.status(201).json(order._id);
  } catch (error) {
    // Delegate formatting to the global error handler
    next(error);
  }
};
