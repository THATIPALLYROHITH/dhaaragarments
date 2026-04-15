import { useState, useRef, useEffect } from "react";
import { CartItem, Product } from "@/types/product";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ProductGrid from "@/components/ProductGrid";
import Cart from "@/components/Cart";
import Footer from "@/components/Footer";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Package, Clock } from "lucide-react";
import DiscountCountdown from "@/components/DiscountCountdown";

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const [cartItems, setCartItems] = useLocalStorage<CartItem[]>("dhaara-cart", []);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const productGridRef = useRef<HTMLDivElement>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();
    fetchDiscounts();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        throw error;
      }

      if (!data || data.length === 0) {
        console.log('No products found in database');
        setProducts([]);
        setLoading(false);
        return;
      }

      const formattedProducts: Product[] = data.map(p => ({
        id: p.id,
        name: p.name,
        price: Number(p.price),
        image: (p.images && p.images.length > 0) ? p.images[0] : '',
        category: p.category,
        description: p.description || '',
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White", "Navy"]
      }));

      setProducts(formattedProducts);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error("Failed to load products");
      setLoading(false);
    }
  };

  const fetchDiscounts = async () => {
    try {
      const { data, error } = await supabase
        .from('discounts')
        .select('*')
        .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDiscounts(data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    }
  };

  useEffect(() => {
    // Handle scroll to section when navigating from other pages
    const state = location.state as { scrollTo?: string };
    if (state?.scrollTo) {
      setTimeout(() => {
        const element = document.querySelector(state.scrollTo);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      // Clear the state
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    // Trigger cart bounce animation when items are added
    if (isCartBouncing) {
      const timer = setTimeout(() => setIsCartBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isCartBouncing]);

  const handleAddToCart = (product: Product) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        toast.success("Updated quantity in cart");
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      toast.success("Added to cart");
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartBouncing(true);
  };

  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity === 0) {
      handleRemoveFromCart(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const handleRemoveFromCart = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
    toast.info("Removed from cart");
  };

  const handleShopClick = () => {
    productGridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate("/checkout", { state: { cartItems } });
  };

  const cartItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-lg">Loading products...</p>
      </div>
    );
  }

  if (products.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header 
          cartItemsCount={0} 
          onCartClick={() => setIsCartOpen(true)}
          isCartBouncing={false}
        />
        <div className="flex-1 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">No Products Available</h2>
            <p className="text-muted-foreground mb-6">
              Products need to be added through the Admin Portal first.
            </p>
            {isAdmin && (
              <Button onClick={() => navigate("/admin")}>
                Go to Admin Portal
              </Button>
            )}
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        cartItemsCount={cartItemsCount} 
        onCartClick={() => setIsCartOpen(true)}
        isCartBouncing={isCartBouncing}
      />
      <Hero onShopClick={handleShopClick} />
      
      {/* Active Discounts Section */}
      {discounts.length > 0 && (
        <section className="relative py-12 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-background overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="container mx-auto relative z-10">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 mb-3 px-4 py-2 bg-primary/20 rounded-full">
                <Tag className="w-4 h-4 text-primary" />
                <span className="text-sm font-bold tracking-wide text-primary">EXCLUSIVE OFFERS</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tighter mb-2">
                Save Big Today!
              </h2>
              <p className="text-muted-foreground">Use these coupon codes at checkout</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
              {discounts.map((discount) => {
                const isMaxedOut = discount.max_usage && discount.usage_count >= discount.max_usage;
                if (isMaxedOut) return null;
                
                const daysLeft = discount.expires_at 
                  ? Math.ceil((new Date(discount.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                  : null;
                
                return (
                  <div 
                    key={discount.id}
                    className="group relative bg-card border-2 border-primary/20 rounded-xl p-6 hover:border-primary/40 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="absolute -top-3 -right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      {discount.percentage}% OFF
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Coupon Code
                        </span>
                        {daysLeft && daysLeft <= 7 && (
                          <Badge variant="destructive" className="text-xs">
                            {daysLeft} days left
                          </Badge>
                        )}
                      </div>
                      
                      <div className="relative bg-secondary/50 border-2 border-dashed border-primary/30 rounded-lg p-3 group-hover:bg-secondary/70 transition-colors">
                        <code className="text-xl font-bold font-mono tracking-wider text-primary">
                          {discount.code}
                        </code>
                      </div>
                      
                      {discount.expires_at && (
                        <>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="w-3 h-3 text-muted-foreground" />
                            <p className="text-xs text-muted-foreground">
                              Expires {new Date(discount.expires_at).toLocaleDateString('en-IN', { 
                                day: 'numeric', 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </p>
                          </div>
                          <DiscountCountdown expiresAt={discount.expires_at} />
                        </>
                      )}
                      
                      {discount.applies_to && (
                        <p className="text-xs text-center text-primary font-medium">
                          Applicable on: {discount.applies_to}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <div ref={productGridRef}>
        <ProductGrid products={products} onAddToCart={handleAddToCart} />
      </div>
      <Cart
        items={cartItems}
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />
      <Footer />
    </div>
  );
};

export default Index;
