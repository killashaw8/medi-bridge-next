import { Product } from "@/libs/types/product/product";

export interface CartItem {
  product: Product;
  quantity: number;
  orderId?: string;
}
