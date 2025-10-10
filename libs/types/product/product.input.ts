import { Direction } from "@/libs/enums/common.enum";
import { ProductCollection, ProductStatus, ProductType } from "@/libs/enums/product.enum";


export interface ProductInput{
  productType: ProductType;
  productCollection: ProductCollection;
  productTitle: string;
  productPrice: number;
  productCount: number;
  productImages: string[];
  productDesc?: string;
}

export interface PricesRange {
  start: number;
  end: number;
}

interface PISearch {
  typeList?: ProductType[];
  collectionList?: ProductCollection[];
  pricesRange?: PricesRange;
  text?: string;  
}


export interface ProductsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: PISearch;
}

interface APISearch {
  productStatus: ProductStatus;
}

export interface ClinicProductsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search: APISearch;
}

class ALPISearch {
  productStatus?: ProductStatus;
}

export interface AllProductsInquiry {
  page: number;
  sort?: string;
  direction?: Direction;
  search: ALPISearch;
}

export interface OrdinaryInquiry {
  page: number;
  limit: number;
}