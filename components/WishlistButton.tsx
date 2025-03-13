import React from 'react';
import Link from 'next/link';

interface WishlistButtonProps {
  count: number;
}

const WishlistButton: React.FC<WishlistButtonProps> = ({ count }) => {
  return (
    <Link href="/wishlist" className="relative">
      <button className="flex items-center justify-center p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-pink-600 text-white w-5 h-5 flex items-center justify-center rounded-full text-xs">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
    </Link>
  );
};

export default WishlistButton;