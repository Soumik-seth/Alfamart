
"use client";

import { useEffect, useState } from "react";
import styles from "@/admin/styles/Categories.module.css";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
};

const emptyForm = {
  name: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCategories() {
    setLoading(true);

    try {
      const response = await fetch("/api/admin/categories");
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load categories.");
      }

      setCategories(data.categories);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  function updateField(
    field: keyof typeof emptyForm,
    value: string | boolean
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editCategory(category: Category) {
    setEditingId(category.id);
    setForm({
      name: category.name,
      description: category.description || "",
      sortOrder: String(category.sortOrder),
      isActive: category.isActive,
    });

    setMessage("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(
        editingId
          ? `/api/admin/categories/${editingId}`
          : "/api/admin/categories",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            description: form.description,
            sortOrder: Number(form.sortOrder),
            isActive: form.isActive,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save category.");
      }

      setMessage(data.message);
      resetForm();
      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(category: Category) {
    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !category.isActive }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update status.");
      }

      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  async function deleteCategory(category: Category) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${category.name}"?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `/api/admin/categories/${category.id}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to delete category.");
      }

      setMessage(data.message);
      await loadCategories();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <p className={styles.eyebrow}>STORE MANAGEMENT</p>
          <h1>Categories</h1>
          <p>Organize and manage your AlfaMart product categories.</p>
        </div>

        <span className={styles.totalCount}>
          {categories.length} Categories
        </span>
      </div>

      {message && (
        <div className={styles.message} role="status">
          {message}
        </div>
      )}

      <section className={styles.formCard}>
        <div className={styles.cardHeading}>
          <h2>{editingId ? "Edit Category" : "Add New Category"}</h2>
          <p>Enter the category information below.</p>
        </div>

        <form onSubmit={saveCategory} className={styles.form}>
          <label>
            Category Name
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="e.g. A2 Gir Cow Ghee"
              maxLength={80}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) =>
                updateField("description", event.target.value)
              }
              placeholder="Write a short category description..."
              rows={4}
            />
          </label>

          <div className={styles.formRow}>
            <label>
              Display Order
              <input
                type="number"
                min="0"
                step="1"
                value={form.sortOrder}
                onChange={(event) =>
                  updateField("sortOrder", event.target.value)
                }
              />
            </label>

            <label className={styles.statusLabel}>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  updateField("isActive", event.target.checked)
                }
              />
              Active category
            </label>
          </div>

          <div className={styles.formActions}>
            <button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Category"
                  : "Add Category"}
            </button>

            {editingId && (
              <button
                type="button"
                className={styles.cancelButton}
                onClick={resetForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className={styles.listCard}>
        <div className={styles.cardHeading}>
          <h2>All Categories</h2>
          <p>Manage your existing categories.</p>
        </div>

        {loading ? (
          <p className={styles.empty}>Loading categories...</p>
        ) : categories.length === 0 ? (
          <p className={styles.empty}>No categories found. Add your first category.</p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Slug</th>
                  <th>Order</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      <small>{category.description || "No description"}</small>
                    </td>
                    <td>{category.slug}</td>
                    <td>{category.sortOrder}</td>
                    <td>
                      <button
                        type="button"
                        className={
                          category.isActive
                            ? styles.activeStatus
                            : styles.inactiveStatus
                        }
                        onClick={() => toggleStatus(category)}
                      >
                        {category.isActive ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          onClick={() => editCategory(category)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={styles.deleteButton}
                          onClick={() => deleteCategory(category)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
