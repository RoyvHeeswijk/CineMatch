import React from 'react';
import { useWishlist } from '@/context/WishlistContext';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();

  if (!isOpen) return null;

  // Sort wishlist with newest first
  const sortedWishlist = [...wishlist].sort((a, b) => {
    return new Date(b.dateAdded || b.releaseDate).getTime() - 
           new Date(a.dateAdded || a.releaseDate).getTime();
  });

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" onClick={onClose}>
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Modal Backdrop */}
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"></div>
        
        {/* Modal Content */}
        <div 
          className="bg-gradient-to-b from-blue-900/95 to-slate-900/95 rounded-xl overflow-hidden shadow-2xl relative z-10 max-w-5xl w-full max-h-[90vh] animate-scaleIn backdrop-blur-lg border border-white/10"
          onClick={e => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-blue-800/50">
            <h2 className="text-xl font-bold text-white flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              My Wishlist ({wishlist.length})
            </h2>
            <button 
              className="text-white/80 hover:text-white"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Modal Body */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
            {wishlist.length === 0 ? (
              <div className="text-center py-10">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-blue-900/50 text-blue-300">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-white">Your wishlist is empty</h3>
                <p className="text-blue-300/80 max-w-md mx-auto">Add movies to your wishlist by clicking the heart icon on any movie card.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {sortedWishlist.map((item) => (
                    <div key={item.id} className="relative group hover:scale-105 transition-all duration-300 wishlist-item">
                      <div className="cursor-pointer rounded-lg overflow-hidden bg-white/10 hover:bg-white/20 transition-all duration-300 h-full shadow-lg border border-blue-800/30">
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
                        
                        {/* Date added badge */}
                        {item.dateAdded && (
                          <div className="absolute top-2 right-8">
                            <span className="inline-block text-xs px-2 py-1 rounded-md bg-blue-800/60 text-blue-100">
                              {new Date(item.dateAdded).toLocaleDateString()}
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
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-pink-600 text-white opacity-90 hover:opacity-100 z-10"
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
                {wishlist.length > 0 && (
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
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistModal; 