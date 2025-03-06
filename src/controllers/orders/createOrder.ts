import { Response, Request } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import { createOrderService } from '../../services/orderServices';
import { OrderItem } from '../../models/Order';
import { Address } from '../../models/User';
import { ShippingMethod } from '../../config/shippingMethod';

/**
 * Handles the creation of a new order.
 * 
 * Validates the request, processes the order, and updates product stock.
 *
 * @param {AuthRequest} req - The Express request object containing the authenticated user and order details.
 * @param {Response} res - The Express response object.
 *
 * @returns {Object} 201 - Successfully created order with `{ orderId: string }`.
 * @returns {Object} 400 - Bad request if required fields (`products`, `shippingAddress`, or `shippingMethod`) are missing.
 * @returns {Object} 500 - Internal server error with an error message.
 */
export const createNewOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const {products, shippingAddress, shippingMethod, phoneNumber } = req.body as {
      products: OrderItem[];
      shippingAddress: Address;
      shippingMethod: ShippingMethod;
      phoneNumber?: string;
    };

    const user = req.user;

    if (!user) {
      res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
      return;
    }

    if (
      !products ||
      products.length === 0 ||
      !shippingAddress ||
      !shippingMethod
    ) {
      res
        .status(400)
        .json({ error: 'Products and shipping address are required' });
      return;
    }

    const order = await createOrderService(
      user,
      products,
      shippingAddress,
      shippingMethod,
      phoneNumber
    );
    res.status(201).json(order._id);
  } catch (error: any) {
    console.error('Error in createOrderController:', error);
    res.status(500).json({ message: error.message || 'Internal Server Error' });
  }
};
