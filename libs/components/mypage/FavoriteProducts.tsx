import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_FAVORITES, LIKE_TARGET_PRODUCT } from "@/apollo/user/query";
import { OrdinaryInquiry } from "@/libs/types/product/product.input";
import { Product } from "@/libs/types/product/product";
import { CircularProgress, Box, Typography, Grid, Stack, Button } from "@mui/material";
import ProductCard from "@/libs/components/common/ProductCard";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";

const FavoriteProducts: React.FC = () => {
  const [page, setPage] = useState(1);
  const limit = 12;

  const input: OrdinaryInquiry = {
    page,
    limit,
  };

  const { data, loading, error, refetch } = useQuery(GET_FAVORITES, {
    variables: { input },
    fetchPolicy: "cache-and-network",
  });
  const [likeProduct] = useMutation(LIKE_TARGET_PRODUCT);

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

  const handleLike = async (productId: string) => {
    try {
      await likeProduct({ variables: { input: productId } });
      await refetch();
      await sweetMixinSuccessAlert("Updated favorites");
    } catch (err: any) {
      console.error("Favorite product like error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to update favorite");
    }
  };

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
          <Button
            type="button" 
            href="/products"
            variant="contained"
          >
            Browse Products
          </Button>
        </div>
      ) : (
        <Stack className="products-grid">
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={4}>
                <ProductCard
                  product={product}
                  showActions="like"
                  likeActive={!!product.meLiked?.some((like) => like.myFavorite)}
                  onLike={handleLike}
                />
              </Grid>
            ))}
          </Grid>
        </Stack>
      )}
    </div>
  );
};

export default FavoriteProducts;
