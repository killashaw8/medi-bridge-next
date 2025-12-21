"use client";

import React from "react";
import { ProductCollection, ProductType } from "@/libs/enums/product.enum";

interface ShoppingSidebarProps {
  searchValue: string;
  selectedCollection: ProductCollection | "";
  selectedType: ProductType | "";
  onSearchChange: (value: string) => void;
  onCollectionChange: (value: ProductCollection | "") => void;
  onTypeChange: (value: ProductType | "") => void;
}

const ShoppingSidebar: React.FC<ShoppingSidebarProps> = ({
  searchValue,
  selectedCollection,
  selectedType,
  onSearchChange,
  onCollectionChange,
  onTypeChange,
}) => {
  const collectionOptions = Object.values(ProductCollection);
  const typeOptions = Object.values(ProductType);

  return (
    <div className="widget-area">
      <div className="widget widget_search">
        <h3 className="widget-title">Search Products</h3>
        <input
          type="text"
          className="form-control"
          placeholder="Search products"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="widget widget_search">
        <h3 className="widget-title">Filter by Type</h3>
        <select
          className="form-control form-select"
          value={selectedType}
          onChange={(event) =>
            onTypeChange(event.target.value as ProductType | "")
          }
        >
          <option value="">All Types</option>
          {typeOptions.map((type) => (
            <option key={type} value={type}>
              {type.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

      <div className="widget widget_search">
        <h3 className="widget-title">Filter by Collection</h3>
        <select
          className="form-control form-select"
          value={selectedCollection}
          onChange={(event) =>
            onCollectionChange(event.target.value as ProductCollection | "")
          }
        >
          <option value="">All Collections</option>
          {collectionOptions.map((collection) => (
            <option key={collection} value={collection}>
              {collection.replace(/_/g, " ")}
            </option>
          ))}
        </select>
      </div>

    </div>
  );
};

export default ShoppingSidebar;
