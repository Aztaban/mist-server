import { Response } from 'express';
import { AuthRequest } from '../middleware/verifyJWT';
import Stripe from 'stripe';
import OrderModel from '../models/Order';

const stripe = new Stripe(process.env.STRIPE_API_SECRET!);

export const createPaymentIntent = async (req: AuthRequest, res: Response) => {
  try {
    if (!process.env.STRIPE_API_SECRET) {
      throw new Error('Stripe API Secret key is not set in environment variables');
    }

    const orderId: string = req.params.id;
    const order = await OrderModel.findById(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (order.isPaid) {
      return res.status(400).json({ error: 'Order already paid' });
    }

    if (!order.totalPrice || typeof order.totalPrice !== 'number') {
      return res.status(400).json({ error: 'Invalid order total price' });
    }
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalPrice,
      currency: 'EUR',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: { orderId: order.id.toString() }
    } as const);

    console.log(paymentIntent)
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
};
