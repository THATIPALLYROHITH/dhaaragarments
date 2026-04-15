import { CartItem } from "./product";

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  shippingInfo: {
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    pincode: string;
  };
  paymentMethod: string;
  orderDate: string;
  status: "placed" | "processing" | "shipped" | "delivered";
}
