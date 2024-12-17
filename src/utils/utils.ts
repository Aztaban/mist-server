import { OrderItem } from "../model/Order";
import { ShippingMethod, ShippingPrices} from "../config/shippingMethod";

export const calculateItemsPrice = (cart: OrderItem[]): number => {
  return parseFloat(
    cart
      .reduce((total, item) => total + item.price * item.quantity, 0)
      .toFixed(2)
  );
};

export const calculateShippingPrice = (method: ShippingMethod): number => {
  return ShippingPrices[method] || 0;
};