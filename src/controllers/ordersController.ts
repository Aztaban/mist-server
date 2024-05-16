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
    const orders: Order[] = await OrderModel.find().exec();
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

    const foundUser: User | null = await UserModel.findOne({ username });

    if (!foundUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const newOrder: Order = new OrderModel({
      orderNo,
      user: foundUser._id,
      products,
      status: OrderStatus.PENDING,
      paid: false,
      created_at: new Date(),
      updated_at: new Date(),
    });

    const order: Order = await OrderModel.create(newOrder);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating new order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc Update order by ID
// @route PUT /orders/:id
// @access Private
const updateOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }
  try {
    const { products, status, paid }: Partial<Order> = req.body;

    const updatedFields: Partial<Order> = {};

    if (products) updatedFields.products = products;
    if (status) updatedFields.status = status;
    if (paid !== undefined) updatedFields.paid = paid;

    const updatedOrder: Order | null = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: updatedFields },
      { new: true }
    ).exec();

    if (!updatedOrder) {
      res.status(404).json({ message: `No Order found with ID ${orderId}` });
      return;
    }
    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc Delete order
// @route DELETE /orders/:id
// @access Private
const deleteOrder = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }
  const deletedOrder: Order | null = await OrderModel.findByIdAndDelete(
    orderId
  ).exec();
  if (!deletedOrder) {
    res.status(404).json({ message: `No Order found with ID ${orderId}` });
    return;
  } else {
    res.json({ message: 'Post deleted successfully', deletedOrder });
  }
};

// @desc Update order status by ID
// @route PUT /orders/:id/status
// @access Private
const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }

  try {
    const { status }: { status: OrderStatus } = req.body;

    if (!status) {
      res.status(400).json({ message: `Status field is required` });
      return;
    }

    const updatedOrder: Order | null = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: { status } },
      { new: true }
    ).exec();

    if (!updatedOrder) {
      res.status(404).json({ message: `No Order found with ID ${orderId}` });
      return;
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// @desc Update pay status by ID
// @route PUT /orders/:id/pay
// @access Private
const updateOrderPaid = async (req: Request, res: Response): Promise<void> => {
  const orderId = req.params.id;
  if (!orderId) {
    res.status(400).json({ message: `Order ID required` });
    return;
  }

  try {
    const updatedOrder: Order | null = await OrderModel.findByIdAndUpdate(
      orderId,
      { $set: { paid: true } },
      { new: true }
    ).exec();

    if (!updatedOrder) {
      res.status(404).json({ message: `No Order found with ID ${orderId}` });
      return;
    }

    res.json(updatedOrder);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const ordersController = {
  getAllOrders,
  getOrderById,
  createNewOrder,
  deleteOrder,
  updateOrder,
  updateOrderStatus,
  updateOrderPaid
};

export default ordersController;
