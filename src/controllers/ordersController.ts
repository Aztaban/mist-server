import OrderModel, { Order, OrderItem, ShippingAddress } from '../model/Order';
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
    const {
      products,
      shippingAddress,
      shippingPrice,
    }: {
      products: OrderItem[];
      shippingAddress: ShippingAddress;
      shippingPrice: number;
    } = req.body;

    const itemsPrice = products.reduce((total, item) => total + item.price * item.quantity, 0);
    const totalPrice = itemsPrice + shippingPrice;

    const foundUser: User | null = await UserModel.findOne({ username });

    // User validation
    if (!foundUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // products and address validation
    if (!products || products.length === 0 || !shippingAddress) {
      res.status(400).json({ error: 'Products and shipping address are required' });
      return;
    }

    const newOrder: Order = new OrderModel({
      orderNo,
      user: foundUser._id,
      products,
      shippingAddress,
      status: OrderStatus.PENDING,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
    });

    const order: Order = await newOrder.save();

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
    const { products, status, isPaid }: Partial<Order> = req.body;

    const updatedFields: Partial<Order> = {};

    if (products) updatedFields.products = products;
    if (status) updatedFields.status = status;
    if (isPaid !== undefined) updatedFields.isPaid = isPaid;

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
      { $set: { isPaid: true } },
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

// @desc get orders for user
// @route GET /orders/user
// @access Private
const getOrdersForUser = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  const username: string | undefined = req.user;

  try {
    // Check if username exists
    if (!username) {
      res.status(400).json({ error: 'User is not authenticated' });
      return;
    }

    const foundUser: User | null = await UserModel.findOne({ username }).exec();

    if (!foundUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const userOrders: Order[] = await OrderModel.find({
      user: foundUser._id,
    }).exec();

    if (userOrders.length === 0) {
      console.log(`No orders found for user: ${foundUser._id}`);
      res.status(204).json({ message: 'No orders found for this user' });
    } else {
      console.log(
        `Found ${userOrders.length} orders for user: ${foundUser._id}`
      );
      res.status(200).json(userOrders);
    }
  } catch (error) {
    // Log the error details
    console.error('Error getting orders for user:', error);
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
  updateOrderPaid,
  getOrdersForUser,
};

export default ordersController;
