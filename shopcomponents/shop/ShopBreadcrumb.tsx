
import Link from "next/link";
import "../../shopcomponentscss/shop/ShopBreadcrumb.css";

export default function ShopBreadcrumb() {
  return (
    <div className="shop-breadcrumb">
      <Link href="/">Home</Link>

      <span className="breadcrumb-separator">›</span>

      <span className="breadcrumb-current">
        Products
      </span>
    </div>
  );
}
