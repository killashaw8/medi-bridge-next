import React, { useState, useEffect, useRef } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { IMAGE_UPLOADER, UPDATE_PRODUCT } from "@/apollo/user/mutation";
import { GET_PRODUCT } from "@/apollo/user/query";
import { ProductUpdate } from "@/libs/types/product/product.update";
import { ProductType, ProductCollection, ProductStatus } from "@/libs/enums/product.enum";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { getImageUrl } from "@/libs/imageHelper";
import { Box, Typography, Grid, Stack, IconButton, Button } from "@mui/material";
import Skeleton from "@mui/material/Skeleton";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

interface EditProductProps {
  productId: string;
  onSuccess?: () => void;
}

const EditProduct: React.FC<EditProductProps> = ({ productId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    productType: ProductType.DEVICE,
    productCollection: ProductCollection.MASSAGER,
    productStatus: ProductStatus.ACTIVE,
    productTitle: "",
    productPrice: 0,
    productCount: 0,
    productImages: [] as string[],
    productDesc: "",
  });
  const [productImages, setProductImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const formatCollectionLabel = (collection: ProductCollection) =>
    collection.replace(/_/g, " ");

  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCT, {
    variables: { productId },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (productData?.getProduct) {
      const product = productData.getProduct;
      const images = product.productImages || [];
      setFormData({
        productType: product.productType,
        productCollection: product.productCollection,
        productStatus: product.productStatus,
        productTitle: product.productTitle,
        productPrice: product.productPrice || 0,
        productCount: product.productCount || 0,
        productImages: images,
        productDesc: product.productDesc || "",
      });
      setProductImages(images);
    }
  }, [productData]);

  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [uploadImage] = useMutation(IMAGE_UPLOADER);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productPrice" ? parseFloat(value) || 0 : value,
      [name]: name === "productCount" ? parseFloat(value) || 0 : value,
    }));
  };

  const triggerUpload = (slot: number) => {
    setActiveSlot(slot);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || activeSlot === null) return;
    try {
      setUploadingImage(true);
      const result = await uploadImage({
        variables: { file, target: "product" },
      });
      const uploadedPath = result?.data?.imageUploader;
      if (!uploadedPath) throw new Error("Upload failed");

      setProductImages((prev) => {
        const next = [...prev];
        next[activeSlot] = uploadedPath;
        return next;
      });
      setFormData((prev) => ({
        ...prev,
        productImages: (() => {
          const next = [...prev.productImages];
          next[activeSlot] = uploadedPath;
          return next;
        })(),
      }));
    } catch (err: any) {
      console.error("Upload error:", err);
      await sweetMixinErrorAlert(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
      setActiveSlot(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleImageRemove = (index: number) => {
    setProductImages((prev) => prev.filter((_, i) => i !== index));
    setFormData((prev) => ({
      ...prev,
      productImages: prev.productImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updateInput: ProductUpdate = {
        _id: productId,
        productType: formData.productType as ProductType,
        productCollection: formData.productCollection as ProductCollection,
        productStatus: formData.productStatus as ProductStatus,
        productTitle: formData.productTitle.trim(),
        productPrice: Number(formData.productPrice) || 0,
        productCount: Number(formData.productCount) || 0,
        productImages: productImages.filter(Boolean),
        productDesc: formData.productDesc.trim() || undefined,
      };

      await updateProduct({
        variables: { input: updateInput },
      });

      await sweetMixinSuccessAlert("Product updated successfully!");
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error: any) {
      console.error("Product update error:", error);
      await sweetMixinErrorAlert(
        error.message || "Failed to update product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (productLoading) {
    return (
      <Box sx={{ padding: "40px" }}>
        <Skeleton variant="text" width="30%" height={32} />
        <Skeleton variant="text" width="45%" height={24} />
        <Skeleton variant="rectangular" height={240} sx={{ mt: 3, borderRadius: 2 }} />
      </Box>
    );
  }

  return (
    <div className="mypage-section">
      <div className="section-header">
        <h2>Edit Product</h2>
        <p>Update your product information</p>
      </div>

      <form onSubmit={handleSubmit} className="product-form">
        <Box sx={{ p: { xs: 2, md: 3 }, border: "1px solid #EEF1F6", borderRadius: 2, background: "#fff" }}>
          <div className="row">

            <div className="col-md-6">
              <div className="form-group">
                <label>Product Type</label>
                <select
                  name="productType"
                  className="form-control form-select"
                  value={formData.productType}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {Object.values(ProductType).map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Product Collection</label>
                <select
                  name="productCollection"
                  className="form-control form-select"
                  value={formData.productCollection}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  {Object.values(ProductCollection).map((collection) => (
                    <option key={collection} value={collection}>
                      {formatCollectionLabel(collection)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label>Product Title</label>
                <input
                  type="text"
                  name="productTitle"
                  className="form-control"
                  value={formData.productTitle}
                  onChange={handleChange}
                  placeholder="Enter product title"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Product Status</label>
                <select
                  name="productStatus"
                  className="form-control form-select"
                  value={formData.productStatus}
                  onChange={handleChange}
                  disabled={loading}
                >
                  {Object.values(ProductStatus).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="productPrice"
                  className="form-control"
                  value={formData.productPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="form-group">
                <label>Stock Count</label>
                <input
                  type="number"
                  name="productCount"
                  className="form-control"
                  value={formData.productCount}
                  onChange={handleChange}
                  placeholder="0"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label>Product Images</label>
                <Typography variant="body2" sx={{ color: "#5A6A85", marginBottom: "12px" }}>
                  Up to 4 images. Click a tile to upload or replace. Use the red bin to remove.
                </Typography>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="u-hidden"
                  onChange={handleFileChange}
                  disabled={uploadingImage}
                />
                <Grid container spacing={2}>
                  {Array.from({ length: 4 }).map((_, index) => {
                    const rawImg = productImages[index];
                    const img = rawImg ? getImageUrl(rawImg) : "";
                    return (
                      <Grid item xs={6} sm={3} key={index}>
                        <Box
                          sx={{
                            position: "relative",
                            width: "100%",
                            pt: "100%",
                            border: "1px dashed #D8DDE6",
                            borderRadius: "12px",
                            overflow: "hidden",
                            backgroundColor: "#FAFBFE",
                            cursor: "pointer",
                          }}
                          onClick={() => triggerUpload(index)}
                        >
                          {img ? (
                            <>
                              <Box
                                sx={{
                                  position: "absolute",
                                  inset: 0,
                                  backgroundImage: `url(${img})`,
                                  backgroundSize: "cover",
                                  backgroundPosition: "center",
                                }}
                              />
                              <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleImageRemove(index);
                                }}
                                sx={{ position: "absolute", top: 6, right: 6, background: "#fff" }}
                              >
                                <DeleteForeverIcon fontSize="small" />
                              </IconButton>
                            </>
                          ) : (
                            <Stack
                              direction="column"
                              alignItems="center"
                              justifyContent="center"
                              sx={{
                                position: "absolute",
                                inset: 0,
                                color: "#5A6A85",
                                gap: 1,
                              }}
                            >
                              <CloudUploadIcon />
                              <Typography variant="caption">
                                {uploadingImage && activeSlot === index ? "Uploading..." : "Upload"}
                              </Typography>
                            </Stack>
                          )}
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </div>
            </div>

            <div className="col-md-12">
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="productDesc"
                  className="form-control"
                  rows={5}
                  value={formData.productDesc}
                  onChange={handleChange}
                  placeholder="Enter product description..."
                  disabled={loading}
                ></textarea>
              </div>
            </div>
          </div>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button type="submit" variant="contained" color="primary" disabled={loading}>
              {loading ? "Updating..." : "Update Product"}
            </Button>
          </Stack>
        </Box>
      </form>
    </div>
  );
};

export default EditProduct;
