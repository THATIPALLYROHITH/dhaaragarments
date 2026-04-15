import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/types/product";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [wishlistProducts, setWishlistProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please login to view your wishlist");
      navigate("/auth");
      return;
    }

    if (user) {
      fetchWishlist();
    }
  }, [user, authLoading, navigate]);

  const fetchWishlist = async () => {
    if (!user) return;

    try {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);

      if (wishlistError) throw wishlistError;

      if (wishlistData && wishlistData.length > 0) {
        const productIds = wishlistData.map(item => item.product_id);
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) throw productsError;

        setWishlistProducts(productsData.map(p => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          image: p.images[0] || '',
          category: p.category,
          description: p.description || '',
          sizes: [],
          colors: []
        })));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      toast.error("Failed to load wishlist");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      setWishlistProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Removed from wishlist");
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error("Failed to remove from wishlist");
    }
  };

  const addToCart = (product: Product) => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item: any) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    toast.success("Added to cart");
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-muted-foreground">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemsCount={0} onCartClick={() => {}} isCartBouncing={false} />
      
      <main className="container mx-auto px-4 py-8 mt-20 flex-1">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <h1 className="text-4xl font-bold mb-8 tracking-tighter flex items-center gap-3">
          <Heart className="w-8 h-8" />
          MY WISHLIST
        </h1>

        {wishlistProducts.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
            <p className="text-muted-foreground mb-6">
              Save your favorite products here
            </p>
            <Button onClick={() => navigate("/")}>Start Shopping</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <div
                key={product.id}
                className="bg-secondary border border-border rounded-lg p-4 relative group"
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-background"
                  onClick={() => removeFromWishlist(product.id)}
                >
                  <Heart className="w-5 h-5 fill-primary text-primary" />
                </Button>

                <div 
                  className="aspect-square mb-4 overflow-hidden cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground font-bold tracking-widest mb-1">
                      {product.category}
                    </p>
                    <h3 className="text-lg font-bold tracking-tight">{product.name}</h3>
                    <p className="text-xl font-bold mt-2">₹{product.price}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      className="flex-1"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => addToCart(product)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
