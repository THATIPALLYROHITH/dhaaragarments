import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ShoppingCart, ArrowLeft, Plus, Minus, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartItem, Size, Color, Product } from "@/types/product";
import { toast } from "sonner";
import { useWishlist } from "@/hooks/useWishlist";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  const [selectedSize, setSelectedSize] = useState<Size | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { isInWishlist, toggleWishlist } = useWishlist();

  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem("dhaara-cart") || "[]");
    setCartItems(cart);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setProduct({
            id: data.id,
            name: data.name,
            price: Number(data.price),
            image: (data.images && data.images.length > 0) ? data.images[0] : '',
            category: data.category,
            description: data.description || '',
            sizes: ["S", "M", "L", "XL"],
            colors: ["Black", "White", "Navy"],
            images: data.images || []
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching product:', error);
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Product Not Found</h1>
          <Button onClick={() => navigate("/")}>Return to Shop</Button>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select size");
      return;
    }

    const cartItem: CartItem = {
      ...product,
      quantity: quantity,
      selectedSize,
      selectedColor: product.colors[0], // Use first color as default
    };

    const existingCart = JSON.parse(localStorage.getItem("dhaara-cart") || "[]");
    const existingItemIndex = existingCart.findIndex(
      (item: CartItem) =>
        item.id === cartItem.id &&
        item.selectedSize === cartItem.selectedSize
    );

    if (existingItemIndex > -1) {
      existingCart[existingItemIndex].quantity += quantity;
    } else {
      existingCart.push(cartItem);
    }

    localStorage.setItem("dhaara-cart", JSON.stringify(existingCart));
    setCartItems(existingCart);
    toast.success(`Added ${quantity} item(s) to cart! Size: ${selectedSize}`, {
      action: {
        label: "View Cart",
        onClick: () => navigate('/checkout')
      }
    });
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      toast.error("Please select size");
      return;
    }

    const cartItem: CartItem = {
      ...product,
      quantity: 1,
      selectedSize,
      selectedColor: product.colors[0], // Use first color as default
    };

    localStorage.setItem("dhaara-cart", JSON.stringify([cartItem]));
    navigate("/checkout");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemsCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => navigate('/checkout')} 
        isCartBouncing={false} 
      />
      
      <main className="container mx-auto px-4 py-8 mt-20">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Product Image Carousel */}
          <div className="relative overflow-hidden rounded-lg">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images && product.images.length > 0 ? (
                  product.images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div className="aspect-square overflow-hidden bg-secondary border border-border">
                        <img
                          src={image}
                          alt={`${product.name} - ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </CarouselItem>
                  ))
                ) : (
                  <CarouselItem>
                    <div className="aspect-square overflow-hidden bg-secondary border border-border">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </CarouselItem>
                )}
              </CarouselContent>
              {product.images && product.images.length > 1 && (
                <>
                  <CarouselPrevious />
                  <CarouselNext />
                </>
              )}
            </Carousel>
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <p className="text-sm text-muted-foreground font-bold tracking-widest mb-2">
                {product.category}
              </p>
              <h1 className="text-4xl font-bold tracking-tight mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold">₹{product.price}</p>
            </div>

            <div className="border-t border-border pt-6">
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="text-sm font-bold tracking-widest mb-3">
                SELECT SIZE
              </h3>
              <div className="flex gap-3">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-16 h-16 border-2 font-bold transition-all ${
                      selectedSize === size
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:border-primary"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <h3 className="text-sm font-bold tracking-widest mb-3">
                QUANTITY
              </h3>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="h-12 w-12"
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-12 w-12"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 pt-6">
              <Button
                className="w-full h-14 text-lg font-bold"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                ADD TO CART
              </Button>
              <div className="flex gap-3">
                <Button
                  className="flex-1 h-14 text-lg font-bold"
                  variant="outline"
                  onClick={handleBuyNow}
                >
                  BUY NOW
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  className="h-14 w-14"
                  onClick={() => toggleWishlist(product.id)}
                >
                  <Heart className={`w-6 h-6 ${isInWishlist(product.id) ? 'fill-primary text-primary' : ''}`} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
