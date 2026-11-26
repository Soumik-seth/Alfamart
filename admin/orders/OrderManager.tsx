
"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "../styles/Orders.module.css";

type OrderItem = {
  id: string;
  productId: string;
  productName: string;
  productImage: string | null;
  price: string;
  quantity: number;
  weight: string | null;
  weightUnit: string | null;
};

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: string;
  shippingCharge: string;
  discount: string;
  totalAmount: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  adminNote: string | null;
  trackingNumber: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
};

function money(value: string | number) {
  return `₹${Number(value).toFixed(2)}`;
}

function dateFormat(value: string) {
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function OrderManager() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [filter, setFilter] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load orders.");
      }

      setOrders(data.orders || []);
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  function openOrder(order: Order) {
    setSelectedOrder(order);
    setAdminNote(order.adminNote || "");
    setTrackingNumber(order.trackingNumber || "");
    setMessage("");
  }

  async function updateOrder(status: string) {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      setMessage("");

      const response = await fetch(
        `/api/admin/orders/${selectedOrder.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            adminNote,
            trackingNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to update order.");
      }

      setMessage(data.message || "Order updated successfully.");
      setSelectedOrder(data.order);
      await fetchOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveOrderDetails() {
    if (!selectedOrder) return;

    try {
      setSaving(true);
      setMessage("");

      // Keep the current status while saving note/tracking details.
      const response = await fetch(
        `/api/admin/orders/${selectedOrder.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: selectedOrder.status,
            adminNote,
            trackingNumber,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to save details.");
      }

      setSelectedOrder(data.order);
      setMessage("Order details saved.");
      await fetchOrders();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  const filteredOrders =
    filter === "ALL"
      ? orders
      : orders.filter((order) => order.status === filter);

  if (loading) {
    return <div className={styles.loading}>Loading orders...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Order Management</h1>
          <p>View and manage customer orders.</p>
        </div>

        <button
          className={styles.refreshButton}
          onClick={fetchOrders}
          disabled={loading}
        >
          Refresh
        </button>
      </div>

      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span>Total Orders</span>
          <strong>{orders.length}</strong>
        </div>

        <div className={styles.statCard}>
          <span>Pending</span>
          <strong>
            {orders.filter((o) => o.status === "PENDING").length}
          </strong>
        </div>

        <div className={styles.statCard}>
          <span>Accepted</span>
          <strong>
            {orders.filter((o) => o.status === "ACCEPTED").length}
          </strong>
        </div>

        <div className={styles.statCard}>
          <span>Delivered</span>
          <strong>
            {orders.filter((o) => o.status === "DELIVERED").length}
          </strong>
        </div>
      </div>

      {message && (
        <div className={styles.message} role="status">
          {message}
        </div>
      )}

      <div className={styles.filterBar}>
        <label htmlFor="order-filter">Filter orders:</label>

        <select
          id="order-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Orders</option>
          <option value="PENDING">Pending</option>
          <option value="ACCEPTED">Accepted</option>
          <option value="REJECTED">Rejected</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Total</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className={styles.empty}>
                  No orders found.
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>
                    <strong>{order.customerName}</strong>
                    <small>{order.customerPhone}</small>
                  </td>
                  <td>{dateFormat(order.createdAt)}</td>
                  <td>
                    <strong>{order.paymentMethod}</strong>
                    <small>{order.paymentStatus}</small>
                  </td>
                  <td>{money(order.totalAmount)}</td>
                  <td>
                    <span
                      className={`${styles.status} ${
                        styles[order.status.toLowerCase()] || ""
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className={styles.viewButton}
                      onClick={() => openOrder(order)}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedOrder && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <h2>Order Details</h2>
                <p>{selectedOrder.orderNumber}</p>
              </div>

              <button
                className={styles.closeButton}
                onClick={() => setSelectedOrder(null)}
                aria-label="Close order details"
              >
                ×
              </button>
            </div>

            <div className={styles.detailsGrid}>
              <div>
                <h3>Customer Details</h3>
                <p>{selectedOrder.customerName}</p>
                <p>{selectedOrder.customerEmail}</p>
                <p>{selectedOrder.customerPhone}</p>
              </div>

              <div>
                <h3>Delivery Address</h3>
                <p>{selectedOrder.address}</p>
                <p>
                  {selectedOrder.city}, {selectedOrder.state}
                </p>
                <p>PIN: {selectedOrder.pincode}</p>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Ordered Products</h3>

            <div className={styles.productList}>
              {selectedOrder.items.map((item) => (
                <div className={styles.productItem} key={item.id}>
                  {item.productImage ? (
                    <img src={item.productImage} alt={item.productName} />
                  ) : (
                    <div className={styles.imagePlaceholder}>No image</div>
                  )}

                  <div className={styles.productInfo}>
                    <strong>{item.productName}</strong>
                    <small>
                      Quantity: {item.quantity}
                      {item.weight && ` • ${item.weight} ${item.weightUnit || ""}`}
                    </small>
                    <small>{money(item.price)} each</small>
                  </div>

                  <strong>
                    {money(Number(item.price) * item.quantity)}
                  </strong>
                </div>
              ))}
            </div>

            <div className={styles.amounts}>
              <p>
                Subtotal <strong>{money(selectedOrder.subtotal)}</strong>
              </p>
              <p>
                Shipping <strong>{money(selectedOrder.shippingCharge)}</strong>
              </p>
              <p>
                Discount <strong>{money(selectedOrder.discount)}</strong>
              </p>
              <p className={styles.grandTotal}>
                Total <strong>{money(selectedOrder.totalAmount)}</strong>
              </p>
            </div>

            <div className={styles.paymentInfo}>
              <p>
                Payment method: <strong>{selectedOrder.paymentMethod}</strong>
              </p>
              <p>
                Payment status: <strong>{selectedOrder.paymentStatus}</strong>
              </p>
              <p>
                Order date: <strong>{dateFormat(selectedOrder.createdAt)}</strong>
              </p>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tracking-number">Tracking Number</label>
              <input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="admin-note">Admin Note</label>
              <textarea
                id="admin-note"
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add an internal order note"
                rows={3}
              />
            </div>

            <button
              className={styles.saveButton}
              onClick={saveOrderDetails}
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Details"}
            </button>

            <div className={styles.statusActions}>
              {selectedOrder.status === "PENDING" && (
                <>
                  <button
                    className={styles.acceptButton}
                    onClick={() => updateOrder("ACCEPTED")}
                    disabled={saving}
                  >
                    Accept Order
                  </button>

                  <button
                    className={styles.rejectButton}
                    onClick={() => updateOrder("REJECTED")}
                    disabled={saving}
                  >
                    Reject Order
                  </button>
                </>
              )}

              {selectedOrder.status === "ACCEPTED" && (
                <>
                  <button
                    className={styles.shipButton}
                    onClick={() => updateOrder("SHIPPED")}
                    disabled={saving}
                  >
                    Mark as Shipped
                  </button>

                  <button
                    className={styles.rejectButton}
                    onClick={() => updateOrder("CANCELLED")}
                    disabled={saving}
                  >
                    Cancel Order
                  </button>
                </>
              )}

              {selectedOrder.status === "SHIPPED" && (
                <button
                  className={styles.acceptButton}
                  onClick={() => updateOrder("DELIVERED")}
                  disabled={saving}
                >
                  Mark as Delivered
                </button>
              )}

              <p className={styles.currentStatus}>
                Current status: <strong>{selectedOrder.status}</strong>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
