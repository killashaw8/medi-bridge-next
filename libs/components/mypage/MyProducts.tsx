import React, { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation } from "@apollo/client";
import { GET_CLINIC_PRODUCTS } from "@/apollo/user/query";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { ClinicProductsInquiry } from "@/libs/types/product/product.input";
import { Product } from "@/libs/types/product/product";
import { ProductStatus } from "@/libs/enums/product.enum";
import { CircularProgress, Box, Typography, Grid, Stack, Pagination, Button } from "@mui/material";
import ProductCard from "@/libs/components/common/ProductCard";
import { UPDATE_PRODUCT } from "@/apollo/user/mutation";
import { sweetMixinErrorAlert, sweetMixinSuccessAlert } from "@/libs/sweetAlert";

interface MyProductsProps {
  onEdit?: (productId: string) => void;
}

const MyProducts: React.FC<MyProductsProps> = ({ onEdit }) => {
  const user = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const limit = 6;

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
  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  const products: Product[] = data?.getClinicProducts?.list || [];
  const total = data?.getClinicProducts?.metaCounter?.[0]?.total || 0;
  const pageCount = Math.ceil(total / limit);

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
          <Link href="/mypage?section=add-product">
            <Button variant="contained" color="primary" startIcon={<i className="ri-add-line"></i>}>
              Add New Product
            </Button>
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
        <Stack className="products-grid" spacing={3}>
          <Grid container spacing={3}>
            {products.map((product) => (
              <Grid item key={product._id} xs={12} sm={6} md={4} lg={4}>
                <ProductCard
                  product={product}
                  showActions="manage"
                  canManage
                  onEdit={onEdit}
                  onDelete={async (id: string) => {
                    try {
                      await updateProduct({
                        variables: { input: { _id: id, productStatus: ProductStatus.DELETE } },
                      });
                      await sweetMixinSuccessAlert("Product deleted");
                      refetch();
                    } catch (err: any) {
                      console.error("Delete product error:", err);
                      await sweetMixinErrorAlert(err.message || "Failed to delete product");
                    }
                  }}
                />
              </Grid>
            ))}
          </Grid>
          {pageCount > 0 && (
            <Stack className="mypage-pagination" direction="row" justifyContent="center">
              <Pagination
                count={pageCount}
                page={page}
                shape="rounded"
                variant="outlined"
                size="large"
                color="primary"
                onChange={(_, value) => setPage(value)}
              />
            </Stack>
          )}
        </Stack>
      )}
    </div>
  );
};

export default MyProducts;
