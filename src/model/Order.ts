import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus } from '../config/orderStatus';

interface OrderItem {
  product: Types.ObjectId; // Reference to Product
  quantity: number;
  price: number;
}

export interface Order extends Document {
  orderNo: number;
  user: Types.ObjectId; // Reference to User
  products: OrderItem[];
  status: OrderStatus;
  paid: boolean;
  created_at: Date;
  updated_at: Date;
  closed_at?: Date | null;
}

const orderSchema: Schema = new Schema(
  {
    orderNo: {
      type: Number,
      required: true,
      unique: true,
    },
    user: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
    },
    products: [
      {
        product: {
          type: Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
    },
    paid: {
      type: Boolean,
      default: false,
    },
    created_at: {
      type: Date,
      required: true,
      default: Date.now,
    },
    closed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { updatedAt: 'updated_at' },
  }
);

const OrderModel = mongoose.model<Order>('Order', orderSchema);

export default OrderModel;
