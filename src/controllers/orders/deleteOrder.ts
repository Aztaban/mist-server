import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { deleteOrderService } from '../../services/orderServices';

/**
 * Delete an order by id.
 *
 * Route: DELETE /orders/:id
 *
 * Responses:
 * - 204 No Content: deleted successfully
 * - 400 Bad Request: missing/invalid id
 * - 404 Not Found: no order with that id
 * - 5xx: delegated to global error handler
 */
export const deleteOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.isValidObjectId(id)) {
      const err = new Error('Invalid order id');
      (err as any).status = 400;
      throw err;
    }

    const deleted = await deleteOrderService(id);
    if (!deleted) {
      const err = new Error(`No order found with id ${id}`);
      (err as any).status = 404;
      throw err;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};
