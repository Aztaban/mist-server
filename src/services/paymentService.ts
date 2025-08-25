import Stripe from 'stripe';
import OrderModel from '../models/Order';

const KEY = process.env.STRIPE_API_SECRET || '';
const stripe = KEY ? new Stripe(KEY) : null;

export const paymentsEnabled = Boolean(stripe);

export const generatePaymentIntent = async (orderId: string) => {
  if (!stripe) {
    const err: any = new Error('Payments are disabled (no STRIPE_API_SECRET set)');
    err.status = 503;
    throw err;
  }

  const order = await OrderModel.findById(orderId);
  if (!order) throw new Error('Order not found');
  if (order.isPaid) throw new Error('Order already paid');

  const total = Number(order.totalPrice);
  if (!Number.isFinite(total) || total <= 0) throw new Error('Invalid order total price');

  const paymentIntent = await stripe.paymentIntents.create({
    amount: Math.round(total * 100), // cents
    currency: 'EUR',
    automatic_payment_methods: { enabled: true },
    metadata: { orderId: order.id.toString() },
  });

  return {
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
  };
};
