import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown release date';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  // Add a sort function to organize wishlist items by newest first
  const sortedWishlist = [...wishlist].sort((a, b) => {
    // Sort by date added (newest first)
    return new Date(b.dateAdded || b.releaseDate).getTime() - 
           new Date(a.dateAdded || a.releaseDate).getTime();
  });

  return (
    <>
      <Head>
        <title>My Wishlist | CineMatch</title>
        <meta name="description" content="Your saved movies and shows" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white font-['Inter']">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="stars-container"></div>
        </div>

        <div className="fixed top-1/4 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
        <div className="fixed top-1/2 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
        <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Header with back button */}
          <div className="flex items-center mb-8">
            <Link href="/" className="mr-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-white">My Wishlist</h1>
          </div>
          
          {/* Wishlist Content */}
          {wishlist.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-900/50 text-blue-300">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-white">Your wishlist is empty</h2>
              <p className="text-blue-300/80 max-w-md mx-auto mb-8">Add movies and shows to your wishlist to keep track of what you want to watch later.</p>
              <Link href="/" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg transition-colors">
                Discover Movies
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {sortedWishlist.map((item) => (
                  <div key={item.id} className="relative group hover:transform hover:scale-105 transition-all duration-300">
                    <div 
                      className="cursor-pointer rounded-lg overflow-hidden bg-white/10 hover:bg-white/20 transition-all duration-300 shadow-md hover:shadow-xl border border-white/5"
                      onClick={() => setSelectedItem(item)}
                    >
                      {item.posterPath ? (
                        <img 
                          src={item.posterPath} 
                          alt={item.title} 
                          className="w-full aspect-[2/3] object-cover"
                        />
                      ) : (
                        <div className="w-full aspect-[2/3] bg-gray-800 flex items-center justify-center">
                          <span className="text-gray-400 text-xs text-center p-2">No image available</span>
                        </div>
                      )}
                      
                      {/* Source badge */}
                      {item.source && (
                        <div className="absolute top-2 left-2">
                          <span className={`inline-block text-xs px-2 py-1 rounded-md ${
                            item.source === 'recommended' 
                              ? 'bg-cyan-800/80 text-cyan-100' 
                              : 'bg-purple-800/80 text-purple-100'
                          }`}>
                            {item.source === 'recommended' ? 'Recommended' : 'Trending'}
                          </span>
                        </div>
                      )}
                      
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <span>★ {item.rating || '?'}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(item.releaseDate).getFullYear()}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Remove button */}
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="absolute top-2 right-2 p-1.5 rounded-full bg-pink-600 text-white opacity-90 hover:opacity-100"
                      aria-label="Remove from wishlist"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Clear all button */}
              <div className="mt-8 text-center">
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to clear your entire wishlist?')) {
                      clearWishlist();
                    }
                  }}
                  className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm"
                >
                  Clear Wishlist
                </button>
              </div>
            </>
          )}
        </div>
        
        {/* Item Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 overflow-y-auto" onClick={() => setSelectedItem(null)}>
            <div className="min-h-screen flex items-center justify-center p-4">
              {/* Modal Backdrop */}
              <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"></div>
              
              {/* Modal Content */}
              <div 
                className="bg-gradient-to-b from-blue-800/90 to-blue-900/90 rounded-xl overflow-hidden shadow-2xl relative z-10 max-w-3xl w-full animate-scaleIn backdrop-blur-lg border border-white/10"
                onClick={e => e.stopPropagation()}
              >
                {/* Modal Close Button */}
                <button 
                  className="absolute top-4 right-4 text-white/80 hover:text-white z-20"
                  onClick={() => setSelectedItem(null)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                
                <div className="flex flex-col md:flex-row">
                  {/* Poster */}
                  <div className="w-full md:w-1/3 relative h-80 md:h-auto bg-blue-900/30">
                    {selectedItem.posterPath ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w500${selectedItem.posterPath}`}
                        alt={selectedItem.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 flex-1">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-white mb-1">{selectedItem.title}</h2>
                      {selectedItem.source && (
                        <span className="text-xs bg-blue-600/50 text-white px-2 py-1 rounded-md">
                          {selectedItem.source === 'trending' ? 'Trending' : 'Recommended'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-blue-300">{formatDate(selectedItem.releaseDate)}</p>
                    
                    {/* Rating */}
                    {selectedItem.rating && (
                      <div className="flex items-center mt-3 mb-4">
                        <span className="text-yellow-400 mr-1">★</span>
                        <span className="text-white font-medium">{selectedItem.rating}</span>
                        <span className="text-blue-300 text-xs ml-1">/10</span>
                      </div>
                    )}
                    
                    {/* Overview */}
                    {selectedItem.description && (
                      <div className="mt-4">
                        <h4 className="text-blue-200 font-medium mb-2">Overview</h4>
                        <p className="text-blue-100 leading-relaxed">{selectedItem.description}</p>
                      </div>
                    )}
                    
                    {/* Remove from Wishlist Button */}
                    <div className="mt-6">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFromWishlist(selectedItem.id);
                          setSelectedItem(null);
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                        Remove from Wishlist
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      
      <style jsx global>{`
        body {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow-x: hidden;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        /* Stars animation */
        .stars-container {
          position: absolute;
          width: 100%;
          height: 100%;
          background-image: 
            radial-gradient(2px 2px at 20px 30px, #ffffff15, transparent),
            radial-gradient(2px 2px at 40px 70px, #ffffff10, transparent),
            radial-gradient(2px 2px at 50px 160px, #ffffff15, transparent),
            radial-gradient(2px 2px at 90px 40px, #ffffff10, transparent),
            radial-gradient(2px 2px at 130px 80px, #ffffff15, transparent),
            radial-gradient(2px 2px at 160px 120px, #ffffff10, transparent);
          background-repeat: repeat;
          background-size: 200px 200px;
          opacity: 0.5;
          animation: stars-move 100s linear infinite;
        }
        
        @keyframes stars-move {
          0% {
            background-position: 0 0;
          }
          100% {
            background-position: 400px 400px;
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out forwards;
        }

        /* Add these CSS styles to make the wishlist page more visually appealing */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 1rem;
        }

        @media (min-width: 640px) {
          .wishlist-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
            gap: 1.5rem;
          }
        }

        .wishlist-item {
          transition: all 0.3s ease;
        }

        .wishlist-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </>
  );
};

export default Wishlist;