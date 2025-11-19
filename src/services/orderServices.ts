import { startSession } from 'mongoose';
import OrderModel, { Order, OrderItem } from '../models/Order';
import { Address } from '../models/User';
import ProductModel from '../models/Product';
import { ShippingMethod } from '../config/shippingMethod';
import { generateOrderNumber } from '../utils/orderNumberGenerator';
import { OrderStatus } from '../config/orderStatus';
import { calculateItemsPrice, calculateShippingPrice } from '../utils/utils';
import { Types } from 'mongoose';
import { ROLES_LIST } from '../config/roles_list';

/**
 * Retrieve all orders.
 * @returns Promise resolving to every order (unfiltered).
 * @remarks Consider adding pagination/filters for production, and limiting to admins.
 */
export const getAllOrdersService = async (): Promise<Order[]> => {
  const orders = await OrderModel.find().exec();
  return orders;
};

/**
 * Retrieve a single order by id with access control.
 *
 * @param orderId - Target order id
 * @param requesterId - Requesting user's id (string form of ObjectId)
 * @param requesterRoles - Role codes for the requester
 * @returns The order if found and authorized, otherwise `null` if not found
 * @throws Error if the requester is not authorized to access the order
 */
export const getOrderByIdService = async (
  orderId: string,
  requesterId: string,
  requesterRoles: number[]
): Promise<Order | null> => {
  const order = await OrderModel.findById(orderId).exec();
  if (!order) return null;

  const isAdminOrEditor = requesterRoles.includes(ROLES_LIST.Admin) || requesterRoles.includes(ROLES_LIST.Editor);

  const userField = order.user as any;

  const ownerId = userField instanceof Types.ObjectId ? userField.toString() : userField?._id?.toString(); // populated case

  // If not admin/editor, ensure the order belongs to the requester
  const belongsToRequester = ownerId === requesterId.toString();

  if (!isAdminOrEditor && !belongsToRequester) {
    throw new Error('Forbidden: You do not have access to this order.');
  }

  return order;
};

/**
 * Retrieve all orders for a given user.
 * @param userId - Owner's user id
 * @returns Array of that user’s orders
 */
export const getOrdersForUserService = async (userId: string): Promise<Order[]> => {
  const userOrders = await OrderModel.find({ user: userId }).exec();
  return userOrders;
};

/**
 * Create a new order and update stock atomically (transaction).
 *
 * @param user - User id placing the order
 * @param products - Line items (product id + quantity)
 * @param shippingAddress - Destination address
 * @param shippingMethod - Chosen shipping method
 * @param phoneNumber - Optional contact phone
 * @returns The newly created order
 * @throws Error if a product is missing/understocked, or if the transaction fails
 *
 * @remarks
 * Requires MongoDB transactions (replica set). Ensure your Mongo is running as a replica set.
 */
export const createOrderService = async (
  user: string,
  products: OrderItem[],
  shippingAddress: Address,
  shippingMethod: ShippingMethod,
  phoneNumber?: string
): Promise<Order> => {
  const session = await startSession();
  session.startTransaction();

  try {
    const orderNo = await generateOrderNumber();
    const itemsPrice = calculateItemsPrice(products);
    const shippingPrice = calculateShippingPrice(shippingMethod);
    const totalPrice = itemsPrice + shippingPrice;

    // Validate stock and existence within the transaction/session
    for (const { product, quantity } of products) {
      const productDoc = await ProductModel.findById(product).session(session);
      if (!productDoc) {
        throw new Error(`Product not found: ${product}`);
      }
      if (productDoc.countInStock < quantity) {
        throw new Error(`Insufficient stock for product ${product}`);
      }

      // Decrement stock / increment unitsSold
      const res = await ProductModel.updateOne(
        { _id: product },
        { $inc: { countInStock: -quantity, unitsSold: +quantity } },
        { session }
      );
      // Optional: ensure an actual doc was modified
      if (res.modifiedCount !== 1) {
        throw new Error(`Failed to update stock for product ${product}`);
      }
    }

    const newOrder = new OrderModel({
      orderNo,
      user,
      products,
      shippingAddress,
      phoneNumber,
      status: OrderStatus.PENDING,
      shippingMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      isPaid: false,
    });

    await newOrder.save({ session });
    await session.commitTransaction();
    session.endSession();
    return newOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    if (error instanceof Error) {
      throw new Error(`Failed to create order and update stock: ${error.message}`);
    }
    throw new Error('Failed to create order and update stock due to an unknown error.');
  }
};

/**
 * Delete an order by id.
 * @param orderId - Target order id
 * @returns `true` if deleted, `false` if not found
 */
export const deleteOrderService = async (orderId: string): Promise<boolean> => {
  const deletedOrder = await OrderModel.findByIdAndDelete(orderId).exec();
  return !!deletedOrder;
};

/**
 * Partially update an order document.
 * @param orderId - Target order id
 * @param updates - Fields to set on the order
 * @returns Updated order, or `null` if not found
 * @throws Error if the update fails
 */
export const updateOrderService = async (orderId: string, updates: Partial<Order>): Promise<Order | null> => {
  return await OrderModel.findByIdAndUpdate(orderId, { $set: updates }, { new: true }).exec();
};

/**
 * Mark an order as paid and move it to PROCESSING.
 * @param orderId - Target order id
 * @returns Updated order, or `null` if not found
 */
export const updateOrderPaidService = async (orderId: string): Promise<Order | null> => {
  return await OrderModel.findByIdAndUpdate(
    orderId,
    {
      $set: {
        status: OrderStatus.PROCESSING,
        isPaid: true,
        paidAt: new Date(),
      },
    },
    { new: true }
  ).exec();
};
