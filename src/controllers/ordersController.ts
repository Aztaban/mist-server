import OrderModel, { Order, OrderItem } from '../model/Order';
import { Request, Response } from 'express';
import UserModel from '../model/User';
import { OrderStatus } from '../config/orderStatus';
import { generateOrderNumber } from '../utils/orderNumberGenerator';
import { AuthRequest } from '../middleware/verifyJWT';
import { User } from '../model/User';

// @desc Get all orders
// @route GET /orders
// @access Private
const getAllOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const orders: Order[] = await OrderModel.find();
    if (orders.length === 0) {
      res.status(204).json({ message: 'No products found' });
    } else {
      res.status(200).json(orders);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc Get order by ID
// @route GET /orders/:id
// @access Private
const getOrderById = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }
  try {
    const order: Order | null = await OrderModel.findById(orderId).exec();
    if (!order) {
      res.status(404).json({ message: `No Order matches ID${orderId}` });
      return;
    } else {
      res.json(order);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc Create new order
// @route POST /orders
// @access Private
const createNewOrder = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const orderNo: number = await generateOrderNumber();
    const username = req.user;
    const { products }: { products: OrderItem[] } = req.body;

    const user: User | null = await UserModel.findOne({ username });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newOrder: Order = new OrderModel({
      orderNo,
      user,
      products,
      status: OrderStatus.PENDING,
      paid: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const order: Order = await OrderModel.create(newOrder);
    res.status(201).json(order);
  } catch {}
};

const ordersController = {
  getAllOrders,
  getOrderById,
  createNewOrder
};

export default ordersController;
