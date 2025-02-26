import { Request, Response } from "express";
import { updateOrderService, updateOrderPaidService } from "../../services/orderServices";
import { Order } from "../../models/Order";

/**
 * Handles updating an existing order.
 *
 * @param {Request} req - The Express request object containing order ID and update data.
 * @param {Response} res - The Express response object.
 *
 * @returns {Object} 200 - The updated order object.
 * @returns {Object} 400 - Bad request if the order ID is missing.
 * @returns {Object} 404 - Not found if no matching order exists.
 * @returns {Object} 500 - Internal server error.
 */

export const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }
  try {
    const updates = req.body as Partial<Order>;
    const updatedOrder = await updateOrderService(orderId, updates);

    if (!updatedOrder) {
      res.status(404).json({ message: `No Order found with ID ${orderId}` });
      return;
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

/**
 * Marks an order as paid.
 *
 * @param {Request} req - The Express request object containing the order ID.
 * @param {Response} res - The Express response object.
 *
 * @returns {Object} 200 - The updated order object.
 * @returns {Object} 400 - Bad request if the order ID is missing.
 * @returns {Object} 404 - Not found if no matching order exists.
 * @returns {Object} 500 - Internal server error.
 */
export const updateOrderPaid = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;

  if (!orderId) {
    res.status(400).json({ message: 'Order ID required' });
    return;
  }

  try {
    const updatedOrder = await updateOrderPaidService(orderId);

    if (!updatedOrder) {
      res.status(404).json({ message: `No Order found with ID ${orderId}` });
      return;
    }

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error('Error updating order payment status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
