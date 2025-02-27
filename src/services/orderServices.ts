import { startSession } from 'mongoose';
import OrderModel, { Order, OrderItem, ShippingAddress } from '../models/Order';
import ProductModel from '../models/Product';
import { ShippingMethod } from '../config/shippingMethod';
import { generateOrderNumber } from '../utils/orderNumberGenerator';
import { OrderStatus } from '../config/orderStatus';
import { calculateItemsPrice, calculateShippingPrice } from '../utils/utils';
import { Types } from 'mongoose';
import { ROLES_LIST } from '../config/roles_list';

/**
 * Retrieves all orders from the database.
 *
 * @returns {Promise<Order[]>} A promise that resolves to an array of all orders.
 */
export const getAllOrdersService = async (): Promise<Order[]> => {
  const orders: Order[] = await OrderModel.find().exec();
  return orders;
};

/**
 * Retrieves an order by its ID and ensures access control based on user roles.
 *
 * @param {string} orderId - The ID of the order to retrieve.
 * @param {Types.ObjectId} requesterId - The ID of the user making the request.
 * @param {number[]} requesterRoles - An array of roles associated with the requester.
 *
 * @returns {Promise<Order | null>} A promise that resolves to the order if found and accessible by the requester, or null if not found.
 *
 * @throws {Error} Throws an error if the requester does not have permission to access the order.
 */
export const getOrderByIdService = async (
  orderId: string,
  requesterId: Types.ObjectId,
  requesterRoles: number[]
): Promise<Order | null> => {
  const order: Order | null = await OrderModel.findById(orderId).exec();
  if (!order) return null;

  const isAdminOrEditor =
    requesterRoles.includes(ROLES_LIST.Admin) ||
    requesterRoles.includes(ROLES_LIST.Editor);

  // If not admin/editor, ensure the order belongs to the requester.
  if (!isAdminOrEditor && order.user.id.toString() !== requesterId.toString()) {
    throw new Error('Forbidden: You do not have access to this order.');
  }

  return order;
};

/**
 * Retrieves all orders for a specific user.
 *
 * @param {Types.ObjectId} userId - The ID of the user whose orders should be retrieved.
 *
 * @returns {Promise<Order[]>} A promise that resolves to an array of orders belonging to the given user.
 */
export const getOrdersForUserService = async (
  userId: Types.ObjectId
): Promise<Order[]> => {
  const userOrders: Order[] = await OrderModel.find({ user: userId }).exec();
  return userOrders;
};

/**
 * Creates a new order and updates the stock for the ordered products.
 *
 * @param {Types.ObjectId} user - The ID of the user placing the order.
 * @param {OrderItem[]} products - An array of order items, each containing product details and quantity.
 * @param {ShippingAddress} shippingAddress - The shipping address for the order.
 * @param {ShippingMethod} shippingMethod - The method of shipping chosen for the order.
 *
 * @returns {Promise<Order>} A promise that resolves to the created order.
 *
 * @throws {Error} Throws an error if order creation or stock update fails.
 */
export const createOrder = async (
  user: Types.ObjectId,
  products: OrderItem[],
  shippingAddress: ShippingAddress,
  shippingMethod: ShippingMethod
): Promise<Order> => {
  const session = await startSession();
  session.startTransaction();

  try {
    const orderNo = await generateOrderNumber();
    const itemsPrice = calculateItemsPrice(products);
    const shippingPrice = calculateShippingPrice(shippingMethod);
    const totalPrice = itemsPrice + shippingPrice;

    await Promise.all(
      products.map(({ product, quantity }) => {
        return ProductModel.updateOne(
          { _id: product },
          { $inc: { countInStock: -quantity, unitsSold: +quantity } },
          { session }
        );
      })
    );

    const newOrder: Order = new OrderModel({
      orderNo,
      user,
      products: products,
      shippingAddress,
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
      throw new Error(
        `Failed to create order and update stock: ${error.message}`
      );
    } else {
      throw new Error(
        'Failed to create order and update stock due to an unknown error.'
      );
    }
  }
};

/**
 * Deletes an order by its ID.
 *
 * @param {string} orderId - The ID of the order to delete.
 *
 * @returns {Promise<boolean>} A promise that resolves to `true` if the order was successfully deleted, `false` otherwise.
 */
export const deleteOrderService = async (orderId: string): Promise<boolean> => {
  const deletedOrder: Order | null = await OrderModel.findByIdAndDelete(
    orderId
  ).exec();
  return !!deletedOrder;
};

/**
 * Updates an order by its ID with the provided fields.
 *
 * @param {string} orderId - The ID of the order to update.
 * @param {Partial<Order>} updates - An object containing the fields to update.
 *
 * @returns {Promise<Order | null>} A promise that resolves to the updated order or `null` if not found.
 *
 * @throws {Error} Throws an error if the update operation fails.
 */
export const updateOrderService = async (
  orderId: string,
  updates: Partial<Order>
): Promise<Order | null> => {
  return await OrderModel.findByIdAndUpdate(
    orderId,
    { $set: updates },
    { new: true }
  ).exec();
};

/**
 * Marks an order as paid and updates its status.
 *
 * @param {string} orderId - The ID of the order to update.
 *
 * @returns {Promise<Order | null>} A promise that resolves to the updated order, or `null` if the order is not found.
 *
 * @throws {Error} Throws an error if the update operation fails.
 */
export const updateOrderPaidService = async (
  orderId: string
): Promise<Order | null> => {
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
