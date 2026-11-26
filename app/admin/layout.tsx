import { Suspense } from "react";
import AdminShell from "@/admin/components/AdminShell";

function AdminLoading() {
  return <div style={{ padding: "30px" }}>Loading admin panel...</div>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<AdminLoading />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}