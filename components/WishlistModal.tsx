import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import Toast from './Toast';

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WishlistModal: React.FC<WishlistModalProps> = ({ isOpen, onClose }) => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });

  // Close toast after duration
  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ ...toast, show: false });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch movie details when a movie is selected
  useEffect(() => {
    if (selectedMovie?.tmdbId) {
      fetch(`/api/movie/${selectedMovie.tmdbId}`)
        .then(res => res.json())
        .then(data => {
          setMovieDetails(data);
        })
        .catch(err => {
          console.error('Error fetching movie details:', err);
        });
    } else {
      setMovieDetails(null);
    }
  }, [selectedMovie]);

  if (!isOpen) return null;

  // Sort wishlist with newest first
  const sortedWishlist = [...wishlist].sort((a, b) => {
    return new Date(b.releaseDate).getTime() -
      new Date(a.releaseDate).getTime();
  });

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown release date';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return '';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleRemoveFromWishlist = (movieId: string) => {
    removeFromWishlist(movieId);
    setToast({
      show: true,
      message: 'Movie removed from likes',
      type: 'info'
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80" onClick={onClose}>
      <div className="min-h-screen flex items-center justify-center p-4">
        {/* Modal Content */}
        <div
          className="bg-gradient-to-b from-gray-900 to-blue-900/90 rounded-xl overflow-hidden shadow-2xl w-full max-w-4xl animate-scaleIn"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header with close button */}
          <div className="sticky top-0 bg-gray-900/90 z-10 px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Your Liked Movies</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="p-6">
            {wishlist.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-white mb-2">No liked movies yet</h3>
                <p className="text-blue-300 mb-6">Start liking movies to build your collection</p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  Discover Movies
                </button>
              </div>
            ) : (
              <>
                {/* Grid of wishlist movies */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {sortedWishlist.map((movie) => (
                    <div
                      key={movie.id}
                      className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 cursor-pointer"
                      onClick={() => setSelectedMovie(movie)}
                    >
                      <div className="relative aspect-[2/3]">
                        {movie.posterPath ? (
                          <img
                            src={movie.posterPath}
                            alt={movie.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-400 text-sm text-center px-2">{movie.title}</span>
                          </div>
                        )}

                        {/* Source badge */}
                        <div className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-medium bg-opacity-80"
                          style={{
                            backgroundColor: movie.source === 'recommended' ? 'rgba(59, 130, 246, 0.8)' : 'rgba(139, 92, 246, 0.8)'
                          }}>
                          {movie.source === 'recommended' ? 'Rec' : 'Trend'}
                        </div>

                        {/* Rating badge */}
                        {movie.rating && (
                          <div className="absolute top-2 right-2 bg-yellow-600/80 text-white px-1.5 py-0.5 rounded text-xs">
                            ★ {movie.rating}
                          </div>
                        )}

                        {/* Remove button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWishlist(movie.id);
                          }}
                          className="absolute bottom-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>

                        {/* Date added indicator */}
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent py-2 px-3">
                          <p className="text-gray-300 text-xs">
                            Added {formatDate(movie.releaseDate)}
                          </p>
                        </div>
                      </div>

                      <div className="p-3">
                        <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(movie.releaseDate).getFullYear()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Movie details modal */}
                {selectedMovie && (
                  <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center" onClick={() => setSelectedMovie(null)}>
                    <div
                      className="bg-gradient-to-b from-gray-900/95 to-blue-900/95 rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full mx-4 md:mx-8 animate-scaleIn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close button */}
                      <button
                        className="absolute top-4 right-4 text-white/80 hover:text-white z-20 bg-black/30 rounded-full p-2"
                        onClick={() => setSelectedMovie(null)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>

                      <div className="flex flex-col md:flex-row">
                        {/* Movie poster */}
                        <div className="w-full md:w-1/3 relative h-80 md:h-auto">
                          {selectedMovie.posterPath ? (
                            <img
                              src={selectedMovie.posterPath}
                              alt={selectedMovie.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                              </svg>
                            </div>
                          )}

                          {/* Source badge */}
                          <div className="absolute top-4 left-4 px-3 py-1 rounded-full text-sm font-medium bg-opacity-90"
                            style={{
                              backgroundColor: selectedMovie.source === 'recommended' ? 'rgba(59, 130, 246, 0.9)' : 'rgba(139, 92, 246, 0.9)'
                            }}>
                            {selectedMovie.source === 'recommended' ? 'Recommended' : 'Trending'}
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 md:p-8 flex-1">
                          <div className="flex items-center justify-between">
                            <h2 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                            {selectedMovie.rating && (
                              <div className="flex items-center">
                                <span className="text-yellow-400 mr-1">★</span>
                                <span className="text-white font-medium">{selectedMovie.rating}</span>
                                <span className="text-blue-300 text-xs ml-1">/10</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center text-blue-300 text-sm space-x-3 mt-1 mb-6">
                            <span>{new Date(selectedMovie.releaseDate).getFullYear()}</span>
                            {movieDetails?.runtime && (
                              <>
                                <span>•</span>
                                <span>{formatRuntime(movieDetails.runtime)}</span>
                              </>
                            )}
                            {movieDetails?.genres && (
                              <>
                                <span>•</span>
                                <span>{movieDetails.genres.map((g: any) => g.name).join(', ')}</span>
                              </>
                            )}
                          </div>

                          {/* Genre tags */}
                          {movieDetails?.genres && (
                            <div className="flex flex-wrap gap-2 mb-6">
                              {movieDetails.genres.map((genre: any) => (
                                <span key={genre.id} className="bg-blue-800/40 text-blue-100 px-3 py-1 rounded-full text-xs">
                                  {genre.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Overview */}
                          <div className="mb-6">
                            <h4 className="text-blue-200 font-medium mb-2">Overview</h4>
                            <p className="text-blue-100 leading-relaxed">
                              {selectedMovie.description || movieDetails?.overview || 'No description available.'}
                            </p>
                          </div>

                          {/* Cast and crew */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            {/* Director */}
                            {movieDetails?.credits?.crew?.find((c: any) => c.job === 'Director')?.name && (
                              <div>
                                <h4 className="text-blue-200 font-medium mb-2">Director</h4>
                                <p className="text-white">
                                  {movieDetails.credits.crew.find((c: any) => c.job === 'Director').name}
                                </p>
                              </div>
                            )}

                            {/* Cast */}
                            {movieDetails?.credits?.cast?.length > 0 && (
                              <div>
                                <h4 className="text-blue-200 font-medium mb-2">Cast</h4>
                                <p className="text-white">
                                  {movieDetails.credits.cast.slice(0, 5).map((c: any) => c.name).join(', ')}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Watch providers if available */}
                          {movieDetails?.['watch/providers']?.results?.US?.flatrate && (
                            <div className="mb-6">
                              <h4 className="text-blue-200 font-medium mb-2">Available on</h4>
                              <div className="flex space-x-2">
                                {movieDetails['watch/providers'].results.US.flatrate.slice(0, 5).map((provider: any) => (
                                  <div key={provider.provider_id} className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full">
                                    {provider.logo_path && (
                                      <img
                                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                        alt={provider.provider_name}
                                        className="w-4 h-4 mr-1.5 rounded-full"
                                      />
                                    )}
                                    <span className="text-xs">{provider.provider_name}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Date added */}
                          <div className="mt-6 pt-6 border-t border-white/10">
                            <p className="text-blue-300 text-sm">
                              Added to likes on {formatDate(selectedMovie.dateAdded || selectedMovie.releaseDate)}
                            </p>

                            {/* Remove button */}
                            <button
                              onClick={() => {
                                handleRemoveFromWishlist(selectedMovie.id);
                                setSelectedMovie(null);
                              }}
                              className="mt-4 flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-300 rounded-lg transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Remove from likes
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Clear Wishlist Button */}
                {wishlist.length > 0 && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={() => {
                        if (confirm('Are you sure you want to clear all your liked movies?')) {
                          clearWishlist();
                          setToast({
                            show: true,
                            message: 'All liked movies cleared',
                            type: 'info'
                          });
                        }
                      }}
                      className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm"
                    >
                      Clear All Liked Movies
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default WishlistModal; 