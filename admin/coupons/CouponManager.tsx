
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "../styles/Coupons.module.css";

type Coupon = {
  id: string;
  code: string;
  description: string | null;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: number | string;
  minOrderAmount: number | string;
  maxDiscount: number | string | null;
  usageLimit: number | null;
  usageCount: number;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
};

type CouponForm = {
  code: string;
  description: string;
  discountType: "PERCENTAGE" | "FIXED";
  discountValue: string;
  minOrderAmount: string;
  maxDiscount: string;
  usageLimit: string;
  startsAt: string;
  expiresAt: string;
  isActive: boolean;
};

const emptyForm: CouponForm = {
  code: "",
  description: "",
  discountType: "PERCENTAGE",
  discountValue: "",
  minOrderAmount: "0",
  maxDiscount: "",
  usageLimit: "",
  startsAt: "",
  expiresAt: "",
  isActive: true,
};

function toDateInput(value: string | null) {
  if (!value) return "";

  const date = new Date(value);
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 16);
}

function formatDate(value: string | null) {
  if (!value) return "No expiry";

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function isExpired(coupon: Coupon) {
  return coupon.expiresAt
    ? new Date(coupon.expiresAt).getTime() < Date.now()
    : false;
}

export default function CouponManager() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchCoupons = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/coupons", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to load coupons");
      }

      setCoupons(result.coupons || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load coupons"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const stats = useMemo(() => {
    return {
      total: coupons.length,
      active: coupons.filter(
        (coupon) => coupon.isActive && !isExpired(coupon)
      ).length,
      expired: coupons.filter(isExpired).length,
      inactive: coupons.filter((coupon) => !coupon.isActive).length,
    };
  }, [coupons]);

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => {
      const matchesSearch =
        coupon.code.toLowerCase().includes(search.toLowerCase()) ||
        (coupon.description || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesFilter =
        filter === "ALL" ||
        (filter === "ACTIVE" && coupon.isActive && !isExpired(coupon)) ||
        (filter === "INACTIVE" && !coupon.isActive) ||
        (filter === "EXPIRED" && isExpired(coupon));

      return matchesSearch && matchesFilter;
    });
  }, [coupons, search, filter]);

  function updateField<K extends keyof CouponForm>(
    key: K,
    value: CouponForm[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setMessage("");
    setShowForm(true);
  }

  function openEditForm(coupon: Coupon) {
    setEditingId(coupon.id);

    setForm({
      code: coupon.code,
      description: coupon.description || "",
      discountType: coupon.discountType,
      discountValue: String(coupon.discountValue),
      minOrderAmount: String(coupon.minOrderAmount),
      maxDiscount:
        coupon.maxDiscount == null ? "" : String(coupon.maxDiscount),
      usageLimit:
        coupon.usageLimit == null ? "" : String(coupon.usageLimit),
      startsAt: toDateInput(coupon.startsAt),
      expiresAt: toDateInput(coupon.expiresAt),
      isActive: coupon.isActive,
    });

    setError("");
    setMessage("");
    setShowForm(true);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setMessage("");

    if (
      form.discountType === "PERCENTAGE" &&
      Number(form.discountValue) > 100
    ) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (
      form.discountType === "FIXED" &&
      form.maxDiscount.trim() !== ""
    ) {
      setError("Maximum discount is only for percentage coupons.");
      return;
    }

    const payload = {
      ...form,
      code: form.code.trim().toUpperCase(),
      discountValue: Number(form.discountValue),
      minOrderAmount: Number(form.minOrderAmount || 0),
      maxDiscount: form.maxDiscount
        ? Number(form.maxDiscount)
        : null,
      usageLimit: form.usageLimit
        ? Number(form.usageLimit)
        : null,
      startsAt: form.startsAt
        ? new Date(form.startsAt).toISOString()
        : null,
      expiresAt: form.expiresAt
        ? new Date(form.expiresAt).toISOString()
        : null,
    };

    try {
      setSaving(true);

      const response = await fetch(
        editingId
          ? `/api/admin/coupons/${editingId}`
          : "/api/admin/coupons",
        {
          method: editingId ? "PATCH" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save coupon");
      }

      setMessage(result.message || "Coupon saved successfully.");
      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);

      await fetchCoupons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleStatus(coupon: Coupon) {
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !coupon.isActive,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not update status");
      }

      setMessage(result.message);
      await fetchCoupons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update status"
      );
    }
  }

  async function deleteCoupon(coupon: Coupon) {
    const confirmed = window.confirm(
      `Are you sure you want to delete coupon ${coupon.code}?`
    );

    if (!confirmed) return;

    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Could not delete coupon");
      }

      setMessage(result.message);
      await fetchCoupons();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete coupon"
      );
    }
  }

  function discountLabel(coupon: Coupon) {
    if (coupon.discountType === "PERCENTAGE") {
      return `${coupon.discountValue}%`;
    }

    return `₹${Number(coupon.discountValue).toFixed(2)}`;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <p className={styles.eyebrow}>STORE MANAGEMENT</p>
          <h1>Coupon Management</h1>
          <p className={styles.subtitle}>
            Create and manage discount coupons for your customers.
          </p>
        </div>

        <button
          className={styles.primaryButton}
          onClick={openCreateForm}
        >
          + Create Coupon
        </button>
      </div>

      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span>Total Coupons</span>
          <strong>{stats.total}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Active Coupons</span>
          <strong>{stats.active}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Expired Coupons</span>
          <strong>{stats.expired}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Inactive Coupons</span>
          <strong>{stats.inactive}</strong>
        </div>
      </div>

      <section className={styles.panel}>
        <div className={styles.toolbar}>
          <div>
            <h2>All Coupons</h2>
            <p>Manage your promotional offers.</p>
          </div>

          <div className={styles.filters}>
            <input
              type="search"
              placeholder="Search coupon..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            >
              <option value="ALL">All Coupons</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className={styles.empty}>Loading coupons...</div>
        ) : filteredCoupons.length === 0 ? (
          <div className={styles.empty}>
            <h3>No coupons found</h3>
            <p>Create your first coupon to get started.</p>
          </div>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Coupon</th>
                  <th>Discount</th>
                  <th>Min. Order</th>
                  <th>Usage</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredCoupons.map((coupon) => {
                  const expired = isExpired(coupon);
                  const status = expired
                    ? "Expired"
                    : coupon.isActive
                      ? "Active"
                      : "Inactive";

                  return (
                    <tr key={coupon.id}>
                      <td>
                        <strong className={styles.couponCode}>
                          {coupon.code}
                        </strong>
                        <small>
                          {coupon.description || "No description"}
                        </small>
                      </td>

                      <td>
                        <strong>{discountLabel(coupon)}</strong>
                      </td>

                      <td>
                        ₹{Number(coupon.minOrderAmount).toFixed(2)}
                      </td>

                      <td>
                        {coupon.usageCount}
                        {" / "}
                        {coupon.usageLimit ?? "Unlimited"}
                      </td>

                      <td>{formatDate(coupon.expiresAt)}</td>

                      <td>
                        <span
                          className={`${styles.status} ${
                            expired
                              ? styles.expired
                              : coupon.isActive
                                ? styles.active
                                : styles.inactive
                          }`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className={styles.actions}>
                          <button
                            className={styles.editButton}
                            onClick={() => openEditForm(coupon)}
                          >
                            Edit
                          </button>

                          <button
                            className={styles.toggleButton}
                            onClick={() => toggleStatus(coupon)}
                          >
                            {coupon.isActive ? "Disable" : "Enable"}
                          </button>

                          <button
                            className={styles.deleteButton}
                            onClick={() => deleteCoupon(coupon)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {showForm && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !saving) {
              setShowForm(false);
            }
          }}
        >
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <p className={styles.eyebrow}>COUPON SETTINGS</p>
                <h2>{editingId ? "Edit Coupon" : "Create Coupon"}</h2>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setShowForm(false)}
                disabled={saving}
                aria-label="Close form"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGrid}>
                <label className={styles.fullWidth}>
                  Coupon Code *
                  <input
                    required
                    minLength={3}
                    maxLength={30}
                    value={form.code}
                    onChange={(event) =>
                      updateField(
                        "code",
                        event.target.value.toUpperCase()
                      )
                    }
                    placeholder="e.g. WELCOME10"
                  />
                </label>

                <label className={styles.fullWidth}>
                  Description
                  <textarea
                    rows={2}
                    value={form.description}
                    onChange={(event) =>
                      updateField("description", event.target.value)
                    }
                    placeholder="Enter coupon description"
                  />
                </label>

                <label>
                  Discount Type *
                  <select
                    value={form.discountType}
                    onChange={(event) =>
                      updateField(
                        "discountType",
                        event.target.value as CouponForm["discountType"]
                      )
                    }
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Amount (₹)</option>
                  </select>
                </label>

                <label>
                  Discount Value *
                  <input
                    required
                    type="number"
                    min="0.01"
                    step="0.01"
                    max={
                      form.discountType === "PERCENTAGE"
                        ? "100"
                        : undefined
                    }
                    value={form.discountValue}
                    onChange={(event) =>
                      updateField("discountValue", event.target.value)
                    }
                    placeholder={
                      form.discountType === "PERCENTAGE" ? "10" : "100"
                    }
                  />
                </label>

                <label>
                  Minimum Order Amount (₹)
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.minOrderAmount}
                    onChange={(event) =>
                      updateField("minOrderAmount", event.target.value)
                    }
                  />
                </label>

                {form.discountType === "PERCENTAGE" && (
                  <label>
                    Maximum Discount (₹)
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.maxDiscount}
                      onChange={(event) =>
                        updateField("maxDiscount", event.target.value)
                      }
                      placeholder="e.g. 100"
                    />
                  </label>
                )}

                <label>
                  Usage Limit
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={form.usageLimit}
                    onChange={(event) =>
                      updateField("usageLimit", event.target.value)
                    }
                    placeholder="Leave blank for unlimited"
                  />
                </label>

                <label>
                  Start Date
                  <input
                    type="datetime-local"
                    value={form.startsAt}
                    onChange={(event) =>
                      updateField("startsAt", event.target.value)
                    }
                  />
                </label>

                <label>
                  Expiry Date
                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) =>
                      updateField("expiresAt", event.target.value)
                    }
                  />
                </label>

                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      updateField("isActive", event.target.checked)
                    }
                  />
                  Coupon is active
                </label>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setShowForm(false)}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Coupon"
                      : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
