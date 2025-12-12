import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_CLINIC_PRODUCTS } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { ClinicProductsInquiry } from "@/libs/types/product/product.input";
import { Product } from "@/libs/types/product/product";
import { ProductStatus } from "@/libs/enums/product.enum";
import { getImageUrl } from "@/libs/imageHelper";
import { CircularProgress, Box, Typography } from "@mui/material";

interface MyProductsProps {
  onEdit?: (productId: string) => void;
}

const MyProducts: React.FC<MyProductsProps> = ({ onEdit }) => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const limit = 12;

  const input: ClinicProductsInquiry = {
    page,
    limit,
    sort: "createdAt",
    direction: "DESC",
    search: {
      productStatus: ProductStatus.ACTIVE,
    },
  };

  const { data, loading, error, refetch } = useQuery(GET_CLINIC_PRODUCTS, {
    variables: { input },
    skip: !user?._id,
    fetchPolicy: "cache-and-network",
  });

  const products: Product[] = data?.getClinicProducts?.list || [];
  const total = data?.getClinicProducts?.metaCounter?.[0]?.total || 0;

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading your products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading products</Typography>
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h2>My Products</h2>
            <p>Your products for sale ({total})</p>
          </div>
          <Link href="/mypage?section=add-product" className="default-btn">
            <i className="ri-add-line"></i> Add New Product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <i className="ri-shopping-bag-line" style={{ fontSize: "48px", color: "#ccc" }}></i>
          <p>You haven't added any products yet</p>
          <Link href="/mypage?section=add-product" className="default-btn">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          <div className="row">
            {products.map((product) => (
              <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
                <div className="product-card">
                  <div className="product-image">
                    <Image
                      src={
                        product.productImages?.[0]
                          ? getImageUrl(product.productImages[0])
                          : "/images/products/default.jpg"
                      }
                      alt={product.productTitle}
                      width={300}
                      height={300}
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div className="product-info">
                    <h3>{product.productTitle}</h3>
                    <div className="product-price">${product.productPrice?.toFixed(2)}</div>
                    <div className="product-meta">
                      <span>Stock: {product.productCount}</span>
                      <span className="badge">{product.productStatus}</span>
                    </div>
                    {onEdit && (
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => onEdit(product._id)}
                        style={{ width: "100%" }}
                      >
                        <i className="ri-edit-line"></i> Edit Product
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProducts;

