import { OrderStatus } from "@/libs/enums/order.enum";
import { Product } from "@/libs/types/product/product";

export interface OrderItem {
  _id: string;
  itemQuantity: number;
  itemPrice: number;
  orderId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  _id: string;
  orderTotal: number;
  orderDelivery: number;
  orderAddress: string;
  orderStatus: OrderStatus;
  memberId: string;
  createdAt: Date;
  updatedAt: Date;
  orderItems?: OrderItem[] | string;
  productData?: Product[] | string;
}

export interface Orders {
  list: Order[];
  total: number;
}
