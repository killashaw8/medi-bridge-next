import React, { useState, useEffect } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { UPDATE_PRODUCT } from "@/apollo/user/mutation";
import { GET_PRODUCT } from "@/apollo/user/query";
import { ProductUpdate } from "@/libs/types/product/product.update";
import { ProductType, ProductCollection, ProductStatus } from "@/libs/enums/product.enum";
import { sweetMixinSuccessAlert, sweetMixinErrorAlert } from "@/libs/sweetAlert";
import { CircularProgress, Box, Typography } from "@mui/material";

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
    productImages: [] as string[],
    productDesc: "",
  });

  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCT, {
    variables: { productId },
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (productData?.getProduct) {
      const product = productData.getProduct;
      setFormData({
        productType: product.productType,
        productCollection: product.productCollection,
        productStatus: product.productStatus,
        productTitle: product.productTitle,
        productPrice: product.productPrice || 0,
        productImages: product.productImages || [],
        productDesc: product.productDesc || "",
      });
    }
  }, [productData]);

  const [updateProduct] = useMutation(UPDATE_PRODUCT);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "productPrice" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleImageUrlAdd = () => {
    const url = prompt("Enter image URL:");
    if (url) {
      setFormData((prev) => ({
        ...prev,
        productImages: [...prev.productImages, url],
      }));
    }
  };

  const handleImageRemove = (index: number) => {
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
        productPrice: formData.productPrice,
        productImages: formData.productImages,
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
      <Box sx={{ textAlign: "center", padding: "40px" }}>
        <CircularProgress />
        <Typography sx={{ marginTop: 2 }}>Loading product...</Typography>
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
        <div className="row">
          <div className="col-md-6">
            <div className="form-group">
              <label>Product Type <span>*</span></label>
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
              <label>Product Collection <span>*</span></label>
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
                    {collection}
                  </option>
                ))}
              </select>
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
              <label>Price <span>*</span></label>
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

          <div className="col-md-12">
            <div className="form-group">
              <label>Product Title <span>*</span></label>
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

          <div className="col-md-12">
            <div className="form-group">
              <label>Product Images</label>
              <div className="image-urls-list">
                {formData.productImages.map((url, index) => (
                  <div key={index} className="image-url-item">
                    <input
                      type="text"
                      className="form-control"
                      value={url}
                      readOnly
                    />
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={() => handleImageRemove(index)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-sm btn-secondary"
                  onClick={handleImageUrlAdd}
                >
                  <i className="ri-add-line"></i> Add Image URL
                </button>
              </div>
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

        <div className="form-actions">
          <button type="submit" className="default-btn" disabled={loading}>
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;

