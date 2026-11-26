
import { Suspense } from "react";
import { connection } from "next/server";
import OrderManager from "@/admin/orders/OrderManager";
import { requireAdmin } from "@/lib/auth";

async function OrdersContent() {
  await connection();
  await requireAdmin();

  return <OrderManager />;
}

export default function AdminOrdersPage() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}>Loading orders...</div>}>
      <OrdersContent />
    </Suspense>
  );
}
