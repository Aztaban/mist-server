import Stripe from 'stripe';
import OrderModel from '../models/Order';

const stripe = new Stripe(process.env.STRIPE_API_SECRET!);

export const generatePaymentIntent = async (orderId: string) => {
  if (!process.env.STRIPE_API_SECRET) {
    throw new Error('Stripe API Secret key is not set in environment variables');
  }

  const order = await OrderModel.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }

  if (order.isPaid) {
    throw new Error('Order already paid');
  }

  if (!order.totalPrice || typeof order.totalPrice !== 'number') {
    throw new Error('Invalid order total price');
  }

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(order.totalPrice * 100), // Convert to cents
    currency: 'EUR',
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: { orderId: order.id.toString() }
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};
