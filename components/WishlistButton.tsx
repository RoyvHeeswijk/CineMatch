import React from 'react';
import Link from 'next/link';

interface WishlistButtonProps {
  count: number;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ count }) => {
  return (
    <Link href="/wishlist">
      <span className="relative flex items-center justify-center p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 group cursor-pointer">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
        </svg>
        
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
            {count}
          </span>
        )}
        
        <span className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/80 text-white text-sm py-1 px-2 rounded-md -bottom-8 whitespace-nowrap">
          My Wishlist
        </span>
      </span>
    </Link>
  );
};

export default WishlistButton;