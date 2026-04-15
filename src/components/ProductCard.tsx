import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { Plus, Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const ProductCard = ({ product, onAddToCart }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const { isInWishlist, toggleWishlist } = useWishlist();

  return (
    <div 
      className="group animate-scale-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="relative overflow-hidden bg-secondary mb-4 aspect-square border border-border cursor-pointer"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-all duration-700 ease-out"
          style={{
            transform: isHovered 
              ? "scale(1.1) rotateY(5deg) rotateX(-2deg)" 
              : "scale(1) rotateY(0deg) rotateX(0deg)",
            transformStyle: "preserve-3d",
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>
        <Button
          variant="ghost"
          size="icon"
          className={`absolute top-4 right-4 bg-background/90 backdrop-blur-sm hover:bg-background transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
        >
          <Heart className={`w-5 h-5 ${isInWishlist(product.id) ? 'fill-primary text-primary' : ''}`} />
        </Button>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground font-bold tracking-widest mb-1">
              {product.category}
            </p>
            <h3 className="text-base sm:text-lg font-bold tracking-tight truncate">
              {product.name}
            </h3>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          </div>
          <p className="text-lg sm:text-xl font-bold tracking-tighter whitespace-nowrap">
            ₹{product.price}
          </p>
        </div>
        
        <Button
          className="w-full bg-primary hover:bg-accent text-primary-foreground font-bold transition-all duration-300 group/btn h-11"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/product/${product.id}`);
          }}
        >
          <Plus className="w-4 h-4 mr-2 group-hover/btn:rotate-90 transition-transform duration-300" />
          ADD TO CART
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;
