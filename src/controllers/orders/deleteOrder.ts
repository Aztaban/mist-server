import { Request, Response } from 'express';
import { deleteOrderService } from '../../services/orderServices';

/**
 * Deletes an order by its ID.
 * 
 * Ensures that the order exists before attempting deletion.
 *
 * @param {Request} req - The Express request object containing the order ID in `req.params.id`.
 * @param {Response} res - The Express response object used to send status and response messages.
 *
 * @returns {Object} 200 - Order successfully deleted.
 * @returns {Object} 400 - Bad request if the order ID is missing.
 * @returns {Object} 404 - Not found if no order exists with the provided ID.
 * @returns {Object} 500 - Internal server error with an error message.
 */
export const deleteOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  const orderId = req.params.id;

  if (!orderId) {
    res.status(400).json({ message: 'Order ID required' });
    return;
  }

  try {
    const isDeleted: boolean = await deleteOrderService(orderId);

    if (!isDeleted) {
      res.status(404).json({ message: `No Order found with ID ${orderId}` });
      return;
    }

    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
