
import { Suspense } from "react";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/auth";
import CouponManager from "@/admin/coupons/CouponManager";

async function CouponsContent() {
  await connection();

  const admin = await requireAdmin();

  return <CouponManager />;
}

function CouponsLoading() {
  return <div style={{ padding: "30px" }}>Loading coupons...</div>;
}

export default function AdminCouponsPage() {
  return (
    <Suspense fallback={<CouponsLoading />}>
      <CouponsContent />
    </Suspense>
  );
}
