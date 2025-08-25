import { Response } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import * as paymentService from '../../services/paymentService';

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    if (!paymentService.paymentsEnabled) {
      return res.status(503).json({ message: 'Payments are disabled' });
    }

    const orderId: string = req.params.id;
    const paymentResponse = await paymentService.generatePaymentIntent(orderId);
    return res.json(paymentResponse);
  } catch (error: any) {
    const status = error?.status || 500;
    const message = error?.message || 'Failed to create payment intent';
    console.error('Payment Intent Error:', error);
    return res.status(status).json({ error: message });
  }
};
