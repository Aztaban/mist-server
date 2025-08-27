import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { updateOrderService, updateOrderPaidService } from '../../services/orderServices';
import { Order } from '../../models/Order';

/**
 * Partially update an order by id.
 *
 * Route: PATCH /orders/:id
 *
 * Request:
 * - Params: { id: string }
 * - Body:   Partial<Order> (fields to update)
 *
 * Responses:
 * - 200 OK:   updated order document
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found:    order not found
 * - 5xx: delegated to global error handler
 */
export const updateOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid order id');
      (err as any).status = 400;
      throw err;
    }

    const updates = req.body as Partial<Order>;
    const updated = await updateOrderService(id, updates);

    if (!updated) {
      const err = new Error(`No order found with id ${id}`);
      (err as any).status = 404;
      throw err;
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

/**
 * Mark an order as paid and move it to PROCESSING.
 *
 * Route: PATCH /orders/:id/paid
 *
 * Request:
 * - Params: { id: string }
 *
 * Responses:
 * - 200 OK:   updated order document
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found:    order not found
 * - 5xx: delegated to global error handler
 */
export const updateOrderPaid = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid order id');
      (err as any).status = 400;
      throw err;
    }

    const updated = await updateOrderPaidService(id);
    if (!updated) {
      const err = new Error(`No order found with id ${id}`);
      (err as any).status = 404;
      throw err;
    }

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};
