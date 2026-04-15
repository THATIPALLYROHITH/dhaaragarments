import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export function useWishlist() {
  const { user } = useAuth();
  const [wishlistIds, setWishlistIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchWishlist();
    } else {
      setWishlistIds(new Set());
      setLoading(false);
    }
  }, [user]);

  const fetchWishlist = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const ids = new Set(data.map(item => item.product_id));
      setWishlistIds(ids);
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleWishlist = async (productId: string) => {
    if (!user) {
      toast.error("Please login to add items to wishlist");
      return;
    }

    const isInWishlist = wishlistIds.has(productId);

    try {
      if (isInWishlist) {
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId);

        if (error) throw error;

        setWishlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        toast.success("Removed from wishlist");
      } else {
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: user.id, product_id: productId });

        if (error) throw error;

        setWishlistIds(prev => new Set(prev).add(productId));
        toast.success("Added to wishlist");
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      toast.error("Failed to update wishlist");
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.has(productId);

  return { isInWishlist, toggleWishlist, loading };
}
