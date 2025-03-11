import React, { createContext, useState, useContext, useEffect } from 'react';

type Movie = {
  id: string;
  title: string;
  poster_path?: string;
  release_date?: string;
  vote_average?: number;
};

interface WishlistContextType {
  wishlist: Movie[];
  wishlistCount: number;
  addToWishlist: (movie: Movie) => void;
  removeFromWishlist: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<Movie[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    const savedWishlist = localStorage.getItem('movieWishlist');
    if (savedWishlist) {
      try {
        setWishlist(JSON.parse(savedWishlist));
      } catch (e) {
        console.error('Failed to parse wishlist from localStorage', e);
      }
    }
  }, []);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('movieWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const addToWishlist = (movie: Movie) => {
    setWishlist(prev => {
      if (prev.some(item => item.id === movie.id)) {
        return prev;
      }
      return [...prev, movie];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlist(prev => prev.filter(movie => movie.id !== id));
  };

  const isInWishlist = (id: string) => {
    return wishlist.some(movie => movie.id === id);
  };

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        wishlistCount: wishlist.length,
        addToWishlist, 
        removeFromWishlist,
        isInWishlist
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