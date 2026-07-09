import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';

interface WishlistContextData {
  wishlistIds: string[];
  wishlistProducts: any[];
  isLoading: boolean;
  toggleWishlist: (product: any) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextData>({} as WishlistContextData);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Listen for auth state changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (userId) {
      refreshWishlist();
    } else {
      setWishlistIds([]);
      setWishlistProducts([]);
      setIsLoading(false);
    }
  }, [userId]);

  const refreshWishlist = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select('product_id, products(*, series(name))')
        .eq('user_id', userId);

      if (error) throw error;

      if (data) {
        setWishlistIds(data.map(item => item.product_id));
        setWishlistProducts(data.map(item => item.products).filter(Boolean));
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleWishlist = async (product: any) => {
    if (!userId) {
      Alert.alert(
        "Login Required",
        "You must be logged in to save items to your wishlist.",
        [{ text: "OK" }]
      );
      return;
    }

    const productId = product.id;
    const currentlyInWishlist = wishlistIds.includes(productId);

    // Optimistic UI update
    if (currentlyInWishlist) {
      setWishlistIds(prev => prev.filter(id => id !== productId));
      setWishlistProducts(prev => prev.filter(p => p.id !== productId));
    } else {
      setWishlistIds(prev => [...prev, productId]);
      setWishlistProducts(prev => [...prev, product]);
    }

    try {
      if (currentlyInWishlist) {
        // Remove from DB
        const { error } = await supabase
          .from('wishlists')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        // Add to DB
        const { error } = await supabase
          .from('wishlists')
          .insert({ user_id: userId, product_id: productId });
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      // Revert optimistic update on failure
      refreshWishlist();
      Alert.alert("Error", "Failed to update wishlist. Please try again.");
    }
  };

  const isInWishlist = (productId: string) => wishlistIds.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlistIds, wishlistProducts, isLoading, toggleWishlist, isInWishlist, refreshWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => useContext(WishlistContext);
