"use client";

import React, { useMemo, useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { Box, CircularProgress, Pagination, Stack, Typography } from "@mui/material";
import ShoppingSidebar from "./ShoppingSidebar";
import ShoppingCard from "./ShoppingCard";
import { GET_PRODUCTS } from "@/apollo/user/query";
import { LIKE_TARGET_PRODUCT } from "@/apollo/user/mutation";
import { ProductsInquiry } from "@/libs/types/product/product.input";
import { Direction } from "@/libs/enums/common.enum";
import { ProductCollection, ProductType } from "@/libs/enums/product.enum";
import { Product } from "@/libs/types/product/product";

const Shopping = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [selectedCollection, setSelectedCollection] = useState<ProductCollection | "">("");
  const [selectedType, setSelectedType] = useState<ProductType | "">("");
  const limit = 9;

  const productsInput = useMemo<ProductsInquiry>(() => {
    return {
      page: currentPage,
      limit,
      sort: "createdAt",
      direction: "DESC",
      search: {
        text: searchValue || undefined,
        collectionList: selectedCollection ? [selectedCollection] : undefined,
        typeList: selectedType ? [selectedType] : undefined,
      },
    };
  }, [currentPage, searchValue, selectedCollection, selectedType]);

  const { data, loading, refetch } = useQuery(GET_PRODUCTS, {
    variables: { input: productsInput },
    fetchPolicy: "cache-and-network",
  });
  const [likeTargetProduct] = useMutation(LIKE_TARGET_PRODUCT);

  const products: Product[] = data?.getProducts?.list || [];
  const total = data?.getProducts?.metaCounter?.[0]?.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="doctors-area wrap-style2 ptb-140">
      <div className="container">
        <div className="row justify-content-center g-4">
          <div className="col-xl-3 col-md-12">
            <ShoppingSidebar
              searchValue={searchValue}
              selectedCollection={selectedCollection}
              selectedType={selectedType}
              onSearchChange={(value) => {
                setSearchValue(value);
                setCurrentPage(1);
              }}
              onCollectionChange={(value) => {
                setSelectedCollection(value);
                setCurrentPage(1);
              }}
              onTypeChange={(value) => {
                setSelectedType(value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col-xl-9 col-md-12">
            {loading ? (
              <Box sx={{ textAlign: "center", padding: "40px" }}>
                <CircularProgress />
                <Typography sx={{ marginTop: 2 }}>Loading products...</Typography>
              </Box>
            ) : products.length === 0 ? (
              <Box sx={{ textAlign: "center", padding: "40px" }}>
                <Typography>No products found.</Typography>
              </Box>
            ) : (
              <div className="row justify-content-center g-4">
                {products.map((product) => (
                  <div className="col-lg-4 col-md-6" key={product._id}>
                    <ShoppingCard
                      product={product}
                      onLike={async (id) => {
                        try {
                          await likeTargetProduct({ variables: { input: id } });
                          await refetch();
                        } catch (error) {
                          console.error("Like product error:", error);
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <div className="col-lg-12 col-md-12">
                <Stack className="mypage-pagination">
                  <Stack direction="row" justifyContent="center" sx={{ mt: 3 }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      shape="rounded"
                      variant="outlined"
                      size="large"
                      color="primary"
                      onChange={handlePageChange}
                      sx={{ "& .MuiPaginationItem-root": { marginX: "6px" } }}
                    />
                  </Stack>
                </Stack>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shopping;
