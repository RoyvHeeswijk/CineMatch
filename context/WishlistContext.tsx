import React, { createContext, useContext, useState, useEffect } from 'react';

interface WishlistItem {
    id: string;
    title: string;
    posterPath: string | null;
    releaseDate: string;
    description?: string;
    rating?: string;
    source?: 'trending' | 'recommended';
}

interface WishlistContextProps {
    wishlist: WishlistItem[];
    addToWishlist: (movie: WishlistItem) => void;
    removeFromWishlist: (id: string) => void;
    isInWishlist: (id: string) => boolean;
    wishlistCount: number;
    clearWishlist: () => void;
}

const WishlistContext = createContext<WishlistContextProps>({
    wishlist: [],
    addToWishlist: () => {},
    removeFromWishlist: () => {},
    isInWishlist: () => false,
    wishlistCount: 0,
    clearWishlist: () => {},
});

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [wishlistCount, setWishlistCount] = useState(0);

    useEffect(() => {
        // Load wishlist from localStorage on initial load
        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) {
            try {
                const parsedWishlist = JSON.parse(storedWishlist);
                setWishlist(parsedWishlist);
                setWishlistCount(parsedWishlist.length);
            } catch (error) {
                console.error('Error parsing wishlist from localStorage:', error);
            }
        }
    }, []);

    useEffect(() => {
        // Update localStorage whenever wishlist changes
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
        setWishlistCount(wishlist.length);
    }, [wishlist]);

    const addToWishlist = (movie: WishlistItem) => {
        if (!isInWishlist(movie.id)) {
            const movieWithTimestamp = {
                ...movie,
                dateAdded: new Date().toISOString()
            };
            setWishlist(prev => [movieWithTimestamp, ...prev]);
        }
    };

    const removeFromWishlist = (id: string) => {
        setWishlist(prev => prev.filter(item => item.id !== id));
    };

    const isInWishlist = (id: string) => {
        return wishlist.some(item => item.id === id);
    };
    
    const clearWishlist = () => {
        setWishlist([]);
    };

    return (
        <WishlistContext.Provider value={{ 
            wishlist, 
            addToWishlist, 
            removeFromWishlist, 
            isInWishlist, 
            wishlistCount,
            clearWishlist 
        }}>
            {children}
        </WishlistContext.Provider>
    );
};