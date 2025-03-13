import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

type Movie = {
  id: string;
  title: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
  description?: string;
  genres?: string;
  director?: string;
  provider?: string;
};

interface WishlistContextType {
  wishlist: Movie[];
  wishlistCount: number;
  addToWishlist: (movie: Movie) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Movie[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('movieWishlist');
    if (savedWishlist) {
      try {
        const parsedWishlist = JSON.parse(savedWishlist);
        // Ensure we're loading an array
        if (Array.isArray(parsedWishlist)) {
          setWishlist(parsedWishlist);
        } else {
          console.error('Saved wishlist is not an array, resetting');
          setWishlist([]);
        }
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage', e);
        setWishlist([]);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
    console.log('Wishlist updated:', wishlist);
  }, [wishlist]);

  // Use useCallback to ensure function identity is stable
  const addToWishlist = useCallback((movie: Movie) => {
    if (!movie.id) {
      console.error('Cannot add movie without ID to wishlist:', movie);
      return;
    }
    
    setWishlist(prev => {
      // Check if movie already exists in wishlist
      if (prev.some(item => item.id === movie.id)) {
        console.log('Movie already in wishlist:', movie.title);
        return prev;
      }
      console.log('Adding to wishlist:', movie.title, 'ID:', movie.id);
      // Create a new array with the new movie added
      return [...prev, movie];
    });
  }, []);

  const removeFromWishlist = useCallback((id: string) => {
    if (!id) {
      console.error('Cannot remove movie without ID from wishlist');
      return;
    }
    
    setWishlist(prev => {
      console.log('Removing from wishlist, id:', id);
      return prev.filter(movie => movie.id !== id);
    });
  }, []);

  const isInWishlist = useCallback((id: string) => {
    if (!id) return false;
    return wishlist.some(movie => movie.id === id);
  }, [wishlist]);

  const clearWishlist = useCallback(() => {
    setWishlist([]);
  }, []);

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        wishlistCount: wishlist.length,
        addToWishlist, 
        removeFromWishlist,
        isInWishlist,
        clearWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};