import { Product } from "@/types/product";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

const ProductGrid = ({ products, onAddToCart }: ProductGridProps) => {
  const categories = ["T-SHIRTS", "SHIRTS", "TROUSERS", "FORMALS", "POLO TSHIRT"];

  return (
    <section className="py-12 sm:py-16 lg:py-24 px-4">
      <div className="container mx-auto">
        {categories.map((category) => {
          const categoryProducts = products.filter((p) => p.category === category);
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category} id={category.toLowerCase().replace(/\s+/g, '-')} className="mb-20 scroll-mt-24">
              <h3 className="text-2xl sm:text-3xl font-bold mb-8 tracking-tighter">
                {category}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12">
                {categoryProducts.map((product, index) => (
                  <div
                    key={product.id}
                    style={{
                      animationDelay: `${index * 0.1}s`,
                    }}
                  >
                    <ProductCard product={product} onAddToCart={onAddToCart} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProductGrid;
