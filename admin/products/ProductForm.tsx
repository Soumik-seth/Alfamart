
"use client";

import { useEffect, useState, FormEvent } from "react";
import styles from "@/admin/styles/ProductForm.module.css";

type Category = {
  id: string;
  name: string;
  isActive: boolean;
};

type UploadedFile = {
  url: string;
  publicId: string;
  fileName: string;
  fileType: string;
};

type Props = {
  onClose: () => void;
  onCreated: () => void;
};

export default function ProductForm({
  onClose,
  onCreated,
}: Props) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [stock, setStock] = useState("0");

  // Weight states
  const [weight, setWeight] = useState("");
  const [weightUnit, setWeightUnit] = useState("g");

  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const response = await fetch("/api/admin/categories");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || data.error || "Could not load categories"
          );
        }

        const list = Array.isArray(data)
          ? data
          : data.categories || [];

        const activeCategories = list.filter(
          (category: Category) => category.isActive
        );

        setCategories(activeCategories);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Category loading failed"
        );
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  function handleImages(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);
    const allowed = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    const invalid = selected.find(
      (file) => !allowed.includes(file.type)
    );

    if (invalid) {
      setError("Only JPG, JPEG, PNG and WebP images are allowed.");
      return;
    }

    const tooLarge = selected.find(
      (file) => file.size > 5 * 1024 * 1024
    );

    if (tooLarge) {
      setError("Each image must be smaller than 5MB.");
      return;
    }

    setError("");

    setImageFiles((previous) => [...previous, ...selected]);

    selected.forEach((file) => {
      const reader = new FileReader();

      reader.onload = () => {
        setImagePreviews((previous) => [
          ...previous,
          String(reader.result),
        ]);
      };

      reader.readAsDataURL(file);
    });
  }

  function removeImage(index: number) {
    setImageFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );

    setImagePreviews((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  function handlePdfs(files: FileList | null) {
    if (!files) return;

    const selected = Array.from(files);

    if (
      selected.some(
        (file) => file.type !== "application/pdf"
      )
    ) {
      setError("Only PDF documents are allowed.");
      return;
    }

    if (
      selected.some(
        (file) => file.size > 10 * 1024 * 1024
      )
    ) {
      setError("Each PDF must be smaller than 10MB.");
      return;
    }

    setError("");

    setPdfFiles((previous) => [...previous, ...selected]);
  }

  function removePdf(index: number) {
    setPdfFiles((previous) =>
      previous.filter((_, i) => i !== index)
    );
  }

  async function uploadFile(file: File): Promise<UploadedFile> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Upload failed: ${file.name}`
      );
    }

    const uploaded = data.file || data;

    if (!uploaded.url || !uploaded.publicId) {
      throw new Error(
        `Invalid upload response for ${file.name}`
      );
    }

    return {
      url: uploaded.url,
      publicId: uploaded.publicId,
      fileName: uploaded.fileName || file.name,
      fileType: uploaded.fileType || file.type,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!categoryId) {
      setError("Please select a category.");
      return;
    }

    if (
      Number(price) <= 0 ||
      !Number.isFinite(Number(price))
    ) {
      setError("Enter a valid selling price.");
      return;
    }

    if (
      originalPrice &&
      (!Number.isFinite(Number(originalPrice)) ||
        Number(originalPrice) < Number(price))
    ) {
      setError(
        "Original price must be greater than or equal to selling price."
      );
      return;
    }

    if (
      !Number.isInteger(Number(stock)) ||
      Number(stock) < 0
    ) {
      setError("Enter a valid stock quantity.");
      return;
    }

    // Weight validation
    if (
      !weight ||
      !Number.isFinite(Number(weight)) ||
      Number(weight) <= 0
    ) {
      setError("Enter a valid product weight.");
      return;
    }

    setSaving(true);

    try {
      const uploadedImages: UploadedFile[] = [];

      for (const file of imageFiles) {
        uploadedImages.push(await uploadFile(file));
      }

      const uploadedDocuments: UploadedFile[] = [];

      for (const file of pdfFiles) {
        uploadedDocuments.push(await uploadFile(file));
      }

      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name,
          sku: sku || null,
          categoryId,
          shortDescription,
          description,
          price: Number(price),
          originalPrice: originalPrice
            ? Number(originalPrice)
            : null,
          stock: Number(stock),

          // Send weight to API
          weight: Number(weight),
          weightUnit,

          isActive,
          isFeatured,

          images: uploadedImages.map((file) => ({
            url: file.url,
            publicId: file.publicId,
          })),

          documents: uploadedDocuments.map((file) => ({
            url: file.url,
            publicId: file.publicId,
            fileName: file.fileName,
            fileType: file.fileType,
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            data.error ||
            "Product could not be saved."
        );
      }

      alert("Product added successfully!");

      onCreated();
      onClose();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div>
            <h2>Add New Product</h2>
            <p>Enter product details for AlfaMart</p>
          </div>

          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            disabled={saving}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Product Name *</label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. A2 Gir Cow Ghee"
              />
            </div>

            <div className={styles.field}>
              <label>SKU</label>
              <input
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="e.g. ALFA-GHEE-001"
              />
            </div>

            <div className={styles.field}>
              <label>Category *</label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                disabled={loadingCategories}
              >
                <option value="">
                  {loadingCategories
                    ? "Loading..."
                    : "Select category"}
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>

              {!loadingCategories &&
                categories.length === 0 && (
                  <small>
                    No active categories found. Add a category first.
                  </small>
                )}
            </div>

            <div className={styles.field}>
              <label>Stock Quantity *</label>
              <input
                type="number"
                min="0"
                required
                value={stock}
                onChange={(e) => setStock(e.target.value)}
              />
            </div>

            {/* Product Weight */}
            <div className={styles.field}>
              <label>Product Weight *</label>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                }}
              >
                <input
                  type="number"
                  min="0.001"
                  step="0.001"
                  required
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="500"
                />

                <select
                  value={weightUnit}
                  onChange={(e) =>
                    setWeightUnit(e.target.value)
                  }
                  required
                >
                  <option value="g">Gram (g)</option>
                  <option value="kg">Kilogram (kg)</option>
                  <option value="ml">Millilitre (ml)</option>
                  <option value="L">Litre (L)</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label>Selling Price (₹) *</label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="500"
              />
            </div>

            <div className={styles.field}>
              <label>Original Price (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={originalPrice}
                onChange={(e) =>
                  setOriginalPrice(e.target.value)
                }
                placeholder="600"
              />
            </div>

            <div
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <label>Short Description</label>
              <input
                value={shortDescription}
                onChange={(e) =>
                  setShortDescription(e.target.value)
                }
                placeholder="A short introduction to the product"
              />
            </div>

            <div
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <label>Full Description *</label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) =>
                  setDescription(e.target.value)
                }
                placeholder="Write complete product details..."
              />
            </div>

            <div
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <label>Product Images</label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                multiple
                onChange={(e) =>
                  handleImages(e.target.files)
                }
              />

              <div className={styles.previewGrid}>
                {imagePreviews.map((preview, index) => (
                  <div
                    className={styles.previewItem}
                    key={`${preview}-${index}`}
                  >
                    <img
                      src={preview}
                      alt={`Product preview ${index + 1}`}
                    />

                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      disabled={saving}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div
              className={`${styles.field} ${styles.fullWidth}`}
            >
              <label>Product PDF Documents</label>

              <input
                type="file"
                accept="application/pdf,.pdf"
                multiple
                onChange={(e) =>
                  handlePdfs(e.target.files)
                }
              />

              {pdfFiles.map((file, index) => (
                <div
                  className={styles.fileItem}
                  key={`${file.name}-${index}`}
                >
                  <span>{file.name}</span>

                  <button
                    type="button"
                    onClick={() => removePdf(index)}
                    disabled={saving}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.checkboxes}>
            <label>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) =>
                  setIsActive(e.target.checked)
                }
              />
              Active Product
            </label>

            <label>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) =>
                  setIsFeatured(e.target.checked)
                }
              />
              Featured Product
            </label>
          </div>

          {error && (
            <p className={styles.error}>{error}</p>
          )}

          <div className={styles.footer}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={styles.saveButton}
              disabled={saving || loadingCategories}
            >
              {saving
                ? "Uploading & Saving..."
                : "Save Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
