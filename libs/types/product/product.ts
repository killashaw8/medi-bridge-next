import { ProductCollection, ProductStatus, ProductType } from "@/libs/enums/product.enum";
import { Member, TotalCounter } from "../member/member";
import { MeLiked } from "../like/like";

 
export interface Product {
	_id: string;
	productType: ProductType;
	productCollection: ProductCollection;
	productStatus: ProductStatus;
	productTitle: string;
	productPrice: number;
	productCount: number;
	productViews: number;
	productLikes: number;
	productComments: number;
	productImages: string[];
	productDesc?: string;
	memberId: string;
	soldAt?: Date;
	deletedAt?: Date;
	createdAt: Date;
	updatedAt: Date;
	memberData?: Member;
	meLiked?: MeLiked[];
}

export interface Products {
	list: Product[];
	metaCounter: TotalCounter[];
}