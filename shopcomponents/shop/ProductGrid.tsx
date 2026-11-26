
import type { Product } from "@/app/shop/page";
import ProductCard from "./ProductCard";

import "../../shopcomponentscss/shop/ProductGrid.css";

type ProductGridProps = {
  products: Product[];
};

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="shop-empty-state">
        <div className="empty-state-icon">⌕</div>

        <h2>No Products Found</h2>

        <p>
          We couldn&apos;t find any products matching your selection.
          Try changing your search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="product-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
