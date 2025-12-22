import { Direction } from "@/libs/enums/common.enum";
import { OrderStatus } from "@/libs/enums/order.enum";

export interface OrderItemInput {
  productId: string;
  itemPrice: number;
  itemQuantity: number;
  orderId?: string;
}

export interface OrderUpdateInput {
  orderId: string;
  orderStatus: OrderStatus;
}

export interface OrderInquiry {
  page: number;
  limit: number;
  orderStatus?: OrderStatus;
  sort?: string;
  direction?: Direction | string;
}
