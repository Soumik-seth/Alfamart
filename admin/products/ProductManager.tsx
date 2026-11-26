
"use client";

import { useCallback, useEffect, useState } from "react";
import ProductForm from "./ProductForm";
import styles from "@/admin/styles/Products.module.css";

type Category = {
  id: string;
  name: string;
};

type ProductImage = {
  id: string;
  imageUrl: string;
  publicId: string;
  sortOrder: number;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  sku: string | null;
  description: string;
  shortDescription: string | null;
  price: number | string;
  originalPrice: number | string | null;
  stock: number;

  // Weight fields
  weight: number | string | null;
  weightUnit: string | null;

  isActive: boolean;
  isFeatured: boolean;
  category: Category;
  images: ProductImage[];
  createdAt: string;
};

export default function ProductManager() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/admin/products", {
        method: "GET",
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to load products"
        );
      }

      const productList = Array.isArray(data)
        ? data
        : data.products || [];

      setProducts(productList);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while loading products."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Delete product
  async function handleDelete(id: string, name: string) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );

    if (!confirmed) return;

    try {
      setDeletingId(id);
      setError("");

      const response = await fetch(
        `/api/admin/products/${id}`,
        {
          method: "DELETE",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || data.error || "Failed to delete product"
        );
      }

      setProducts((previous) =>
        previous.filter((product) => product.id !== id)
      );

      alert("Product deleted successfully!");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to delete product."
      );
    } finally {
      setDeletingId(null);
    }
  }

  // Format price
  function formatPrice(price: number | string) {
    return Number(price).toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    });
  }

  // Format weight
  function formatWeight(
    weight: number | string | null,
    unit: string | null
  ) {
    if (weight === null || !unit) {
      return "—";
    }

    return `${Number(weight).toLocaleString("en-IN", {
      maximumFractionDigits: 3,
    })} ${unit}`;
  }

  return (
    <div className={styles.container}>
      {/* Page Header */}
      <div className={styles.header}>
        <div className={styles.heading}>
          <h1>Products</h1>
          <p>Manage all your AlfaMart products here.</p>
        </div>

        <button
          type="button"
          className={styles.addButton}
          onClick={() => setShowForm(true)}
        >
          <span>+</span> Add Product
        </button>
      </div>

      {/* Product Count */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ color: "#718071", fontSize: "14px" }}>
          Total Products: <strong>{products.length}</strong>
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            marginBottom: "20px",
            background: "#fce9e7",
            color: "#b42318",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className={styles.message}>
          Loading products...
        </div>
      ) : products.length === 0 ? (
        <div className={styles.tableWrapper}>
          <div className={styles.emptyState}>
            <h3>No Products Found</h3>
            <p>
              You have not added any products yet.
              Click Add Product to get started.
            </p>
          </div>
        </div>
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Weight</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  {/* Product */}
                  <td>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        minWidth: "180px",
                      }}
                    >
                      {product.images?.[0]?.imageUrl ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.name}
                          style={{
                            width: "48px",
                            height: "48px",
                            objectFit: "cover",
                            borderRadius: "7px",
                            border: "1px solid #e7e1d2",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "48px",
                            height: "48px",
                            borderRadius: "7px",
                            background: "#edf3e9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#246b3b",
                            fontSize: "20px",
                          }}
                        >
                          🌿
                        </div>
                      )}

                      <div>
                        <div className={styles.productName}>
                          {product.name}
                        </div>

                        {product.sku && (
                          <small style={{ color: "#718071" }}>
                            SKU: {product.sku}
                          </small>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td>
                    {product.category?.name || "Uncategorized"}
                  </td>

                  {/* Price */}
                  <td>
                    <span className={styles.price}>
                      {formatPrice(product.price)}
                    </span>
                  </td>

                  {/* Weight */}
                  <td>
                    <strong>
                      {formatWeight(
                        product.weight,
                        product.weightUnit
                      )}
                    </strong>
                  </td>

                  {/* Stock */}
                  <td>{product.stock}</td>

                  {/* Status */}
                  <td>
                    <span
                      className={
                        product.isActive
                          ? styles.activeStatus
                          : styles.inactiveStatus
                      }
                    >
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  {/* Featured */}
                  <td>
                    {product.isFeatured ? "Yes" : "No"}
                  </td>

                  {/* Actions */}
                  <td>
                    <div className={styles.actionButtons}>
                      <button
                        type="button"
                        className={styles.deleteButton}
                        disabled={deletingId === product.id}
                        onClick={() =>
                          handleDelete(product.id, product.name)
                        }
                      >
                        {deletingId === product.id
                          ? "Deleting..."
                          : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Form */}
      {showForm && (
        <ProductForm
          onClose={() => setShowForm(false)}
          onCreated={fetchProducts}
        />
      )}
    </div>
  );
}
