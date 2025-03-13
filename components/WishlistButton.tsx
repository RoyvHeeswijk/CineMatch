import React from 'react';
import Link from 'next/link';

interface WishlistButtonProps {
  count: number;
}

export default function WishlistButton({ count }: WishlistButtonProps) {
  return (
    <Link href="/wishlist">
      <div className="relative group cursor-pointer">
        <div className="p-2 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-cyan-300 transition-colors duration-300 group-hover:text-white"
            fill="currentColor"
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
            <div className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-blue-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full shadow-lg">
              {count}
            </div>
          )}
        </div>
        <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 px-2 py-1 bg-blue-800/80 backdrop-blur-sm text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap border border-white/10">
          My Wishlist
        </span>
      </div>
    </Link>
  );
}