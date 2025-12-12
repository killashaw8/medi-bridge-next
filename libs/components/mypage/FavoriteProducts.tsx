import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@apollo/client";
import { GET_FAVORITES } from "@/apollo/user/query";
import { OrdinaryInquiry } from "@/libs/types/product/product.input";
import { Product } from "@/libs/types/product/product";
import { getImageUrl } from "@/libs/imageHelper";
import { CircularProgress, Box, Typography, Grid } from "@mui/material";

const FavoriteProducts: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 12;

  const input: OrdinaryInquiry = {
    page,
    limit,
  };

  const { data, loading, error } = useQuery(GET_FAVORITES, {
    variables: { input },
    fetchPolicy: "cache-and-network",
  });

  const products: Product[] = data?.getFavorites?.list || [];
  const total = data?.getFavorites?.metaCounter?.[0]?.total || 0;

  if (loading) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading favorite products...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <Typography color="error">Error loading favorite products</Typography>
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Favorite Products</h2>
        <p>Your favorite products ({total})</p>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <i className="ri-heart-line" style={{ fontSize: "48px", color: "#ccc" }}></i>
          <p>No favorite products yet</p>
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
                  <Link href={`/products/${product._id}`}>
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

export default FavoriteProducts;

