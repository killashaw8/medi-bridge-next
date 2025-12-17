import { ProductCollection, ProductStatus, ProductType } from "@/libs/enums/product.enum";


export interface ProductUpdate {
  _id: string;
  productType?: ProductType;
  productCollection?: ProductCollection;
  productStatus?: ProductStatus;
  productCount?: number;
  productTitle?: string;
  productPrice?: number;
  productImages?: string[];
  productDesc?: string;

}
