import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_VIEWED } from "@/apollo/user/query";
import { OrdinaryInquiry } from "@/libs/types/product/product.input";
import { Product } from "@/libs/types/product/product";
import { getImageUrl } from "@/libs/imageHelper";
import { Box, Typography } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";

const RecentlyVisited: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 12;

  const input: OrdinaryInquiry = {
    page,
    limit,
  };

  const { data, loading, error } = useQuery(GET_VIEWED, {
    variables: { input },
    fetchPolicy: "cache-and-network",
  });

  const products: Product[] = data?.getViewed?.list || [];
  const total = data?.getViewed?.metaCounter?.[0]?.total || 0;

  if (loading) {
    return (
      <div className="mypage-section">
        <div className="section-header">
          <Skeleton variant="text" height={32} width="35%" />
          <Skeleton variant="text" width="45%" />
        </div>
        <div className="products-grid">
          <div className="row">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((index) => (
              <div key={`visited-skeleton-${index}`} className="col-lg-3 col-md-4 col-sm-6">
                <Box sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef1f6" }}>
                  <Skeleton variant="rectangular" height={180} />
                  <Box sx={{ p: 2 }}>
                    <Skeleton variant="text" width="70%" />
                    <Skeleton variant="text" width="40%" />
                  </Box>
                </Box>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading recently visited products</Typography>
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Recently Visited Products</h2>
        <p>Products you've recently viewed ({total})</p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <i className="ri-history-line u-icon-48"></i>
          <p>No recently visited products</p>
          <Link href="/products" className="default-btn">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          <div className="row">
            {products.map((product) => (
              <div key={product._id} className="col-lg-3 col-md-4 col-sm-6">
                <div className="product-card">
                  <Link href={`/products/details?${product._id}`}>
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
                        className="u-img-cover"
                      />
                    </div>
                    <div className="product-info">
                      <h3>{product.productTitle}</h3>
                      <div className="product-price">
                        ${product.productPrice?.toFixed(2)}
                      </div>
                    </div>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentlyVisited;
