import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import { Order } from '../../models/Order';
import { getAllOrdersService, getOrdersForUserService, getOrderByIdService } from '../../services/orderServices';
import mongoose from 'mongoose';

/**
 * List all orders (unfiltered).
 *
 * Route: GET /orders
 *
 * Responses:
 * - 200 OK: JSON array of orders (may be empty [])
 * - 5xx: delegated to global error handler
 *
 * @remarks
 * Returning 200 with an empty array is friendlier for clients than 204.
 */
export const getAllOrders = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders: Order[] = await getAllOrdersService();
    res.status(200).json(orders); // [] if none
  } catch (err) {
    next(err);
  }
};

/**
 * Get a single order by id, enforcing access control.
 *
 * Route: GET /orders/:id
 * Auth: requires access token (verifyJWT sets `req.user`, `req.roles`)
 *
 * Responses:
 * - 200 OK: the order document
 * - 400 Bad Request: missing id
 * - 403 Forbidden: requester not allowed to view this order
 * - 404 Not Found: order does not exist
 * - 5xx: delegated to global error handler
 */
export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId || !mongoose.isValidObjectId(orderId)) {
    res.status(400).json({ message: 'Invalid order ID' });
    return;
  }
  if (!req.user || !req.roles) {
    // unauthenticated/role-less request; verifyJWT should normally prevent this
    res.status(403).json({ message: 'User not found' });
    return;
  }

  try {
    const order: Order | null = await getOrderByIdService(orderId, req.user, req.roles);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    res.status(200).json(order);
  } catch (error: any) {
    // service throws a "Forbidden" error when the user isn't allowed
    if (typeof error?.message === 'string' && error.message.includes('Forbidden')) {
      res.status(403).json({ message: error.message });
      return;
    }
    next(error);
  }
};

/**
 * List orders for the authenticated user.
 *
 * Route: GET /orders/my
 * Auth: requires access token (verifyJWT sets `req.user`)
 *
 * Responses:
 * - 200 OK: JSON array of orders for the user (may be empty [])
 * - 401 Unauthorized: no authenticated user
 * - 5xx: delegated to global error handler
 */
export const getOrdersForUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthorized: User not authenticated.' });
    return;
  }

  try {
    const userOrders: Order[] = await getOrdersForUserService(req.user);
    res.status(200).json(userOrders);
  } catch (err) {
    next(err);
  }
};
