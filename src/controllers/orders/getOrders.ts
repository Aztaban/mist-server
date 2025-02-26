import e, { Request, Response } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import { Order } from '../../models/Order';
import {
  getAllOrdersService,
  getOrdersForUserService,
  getOrderByIdService,
} from '../../services/orderServices';
import { Types } from 'mongoose';

/**
 * Retrieves all orders from the database.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 *
 * @returns {Object} 200 - JSON array of orders.
 * @returns {Object} 204 - No content if there are no orders.
 * @returns {Object} 500 - Internal server error.
 */
export const getAllOrders = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const orders: Order[] = await getAllOrdersService();
    if (orders.length === 0) {
      res.status(204).json({ message: 'No products found' });
    } else {
      res.status(200).json(orders);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Retrieves an order by its ID.
 *
 * Ensures that the requester is authorized to access the order.
 *
 * @param {AuthRequest} req - The Express request object containing the order ID.
 * @param {Response} res - The Express response object.
 *
 * @returns {Object} 200 - JSON object containing the order details.
 * @returns {Object} 400 - Bad request if the order ID is missing.
 * @returns {Object} 403 - Forbidden if the requester does not have permission to access the order.
 * @returns {Object} 404 - Not found if the order does not exist.
 * @returns {Object} 500 - Internal server error.
 */
export const getOrderById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }

  if (!req.user || !req.roles) {
    res.status(403).json({ message: 'User not found' });
    return;
  }

  try {
    const order: Order | null = await getOrderByIdService(
      orderId,
      req.user,
      req.roles
    );
    res.status(200).json(order);
  } catch (error: any) {
    if (error.message.includes('Forbidden')) {
      res.status(403).json({ message: error.message });
    } else {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};

/**
 * Retrieves all orders for a given user.
 *
 * @param {AuthRequest} req - The Express request object containing the authenticated user.
 * @param {Response} res - The Express response object.
 *
 * @returns {Object} 200 - JSON array of orders for the authenticated user.
 * @returns {Object} 204 - No content if no orders are found for the user.
 * @returns {Object} 401 - Unauthorized if the user is not authenticated.
 * @returns {Object} 500 - Internal server error.
 */
export const getOrdersForUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
    return;
  }

  try {
    const userOrders: Order[] = await getOrdersForUserService(req.user);
    if (userOrders.length === 0) {
      res.status(204).json({ message: 'No orders found for this user' });
    } else {
      res.status(200).json(userOrders);
    }
  } catch (error) {
    console.error('Error getting orders for user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
