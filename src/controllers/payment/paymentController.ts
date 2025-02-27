import { Response } from 'express';
import { AuthRequest } from '../../middleware/verifyJWT';
import * as paymentService from '../../services/paymentService';

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    const orderId: string = req.params.id;
    const paymentResponse = await paymentService.generatePaymentIntent(orderId);
    
    res.json(paymentResponse);
  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};
