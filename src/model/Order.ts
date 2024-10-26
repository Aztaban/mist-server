import mongoose, { Schema, Document, Types } from 'mongoose';
import { OrderStatus } from '../config/orderStatus';
import { ShippingMethod } from '../config/shippingMethod';

export interface OrderItem {
  product: Types.ObjectId; // Reference to Product
  name: string;
  quantity: number;
  price: number;
}

const orderItemSchema: Schema = new Schema({
  product: {
    type: Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: false,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode: string;
  country: string;
}

const shippingAddressSchema: Schema = new Schema({
  address: { type: String, required: true },
  city: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

export interface Order extends Document {
  orderNo: number;
  user: Types.ObjectId; // Reference to User
  products: OrderItem[];
  shippingAdress: ShippingAddress;
  status: OrderStatus;
  shippingMethod: ShippingMethod;
  itemsPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date | null;
  created_at?: Date | null;
  updated_at?: Date | null;
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
    products: [orderItemSchema],
    shippingAddress: {
      type: shippingAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      required: true,
    },
    shippingMethod: {
      type: String,
      enum: Object.values(ShippingMethod),
      required: true,
    },
    itemsPrice: {
      type: Number,
      required: true,
    },
    shippingPrice: {
      type: Number,
      required: true,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: null,
    },
    created_at: {
      type: Date,
      default: null,
    },
    updated_at: {
      type: Date,
      default: null
    },
    closed_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

orderSchema.pre<Order>(['find', 'findOne'], function (next) {
  this.populate({
    path: 'user',
    select: 'username _id',
  });
  this.populate({
    path: 'products.product',
    model: 'Product',
    select: 'name image',
  });
  next();
});

const OrderModel = mongoose.model<Order>('Order', orderSchema);

export default OrderModel;
