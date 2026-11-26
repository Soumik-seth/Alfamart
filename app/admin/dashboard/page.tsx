
import { Suspense } from "react";
import Dashboard from "@/admin/dashboard/Dashboard";

function DashboardLoading() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#f7f3e8",
        color: "#174b2c",
      }}
    >
      <h2>Loading Admin Dashboard...</h2>
      <p>Please wait.</p>
    </main>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <Dashboard />
    </Suspense>
  );
}
