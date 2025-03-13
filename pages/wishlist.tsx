import React, { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { useWishlist } from '@/context/WishlistContext';

const Wishlist = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const [selectedMovie, setSelectedMovie] = useState(null);

  const handleViewDetails = (movie) => {
    setSelectedMovie(movie);
  };

  const closeModal = () => {
    setSelectedMovie(null);
  };

  return (
    <>
      <Head>
        <title>My Wishlist | Movie Recommender</title>
        <meta name="description" content="Your saved movies" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white font-['Montserrat']">
        {/* Background overlay */}
        <div className="absolute inset-0 bg-[url('/images/cinema-pattern.png')] opacity-5 z-0"></div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center mb-8">
            <Link href="/">
              <span className="flex items-center text-blue-400 hover:text-blue-300 transition-colors cursor-pointer">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Back to Home
              </span>
            </Link>
          </div>

          <div className="flex items-center mb-8">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">My Wishlist</h1>
            {wishlist.length > 0 && (
              <div className="ml-4 px-3 py-1 bg-purple-600 rounded-full text-xs font-semibold">
                {wishlist.length} movies
              </div>
            )}
          </div>

          {wishlist.length === 0 ? (
            <div className="text-center py-20 backdrop-blur-sm bg-black/30 rounded-xl border border-gray-800 shadow-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <h2 className="text-2xl font-semibold mb-3">Your wishlist is empty</h2>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">Start adding movies you want to watch later by clicking the heart icon on any movie card</p>
              <Link href="/">
                <span className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg cursor-pointer">
                  Discover Movies
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {wishlist.map(movie => (
                <div key={movie.id} className="bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-800">
                  <div className="relative h-80">
                    {movie.poster_path ? (
                      <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400">{movie.title}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                    <button
                      onClick={() => removeFromWishlist(movie.id)}
                      className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white truncate">{movie.title}</h3>
                    <div className="flex items-center justify-between mt-2">
                      {movie.vote_average && (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <p className="ml-1 text-sm text-gray-300">{movie.vote_average.toFixed(1)}</p>
                        </div>
                      )}
                      {movie.release_date && (
                        <p className="text-sm text-gray-400">
                          {new Date(movie.release_date).getFullYear()}
                        </p>
                      )}
                    </div>
                    
                    {movie.description && (
                      <div className="mt-3 text-sm text-gray-300 h-12 overflow-hidden" style={{
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical'
                      }}>
                        {movie.description}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => handleViewDetails(movie)}
                      className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Debug button */}
          <button 
            onClick={() => {
              console.log("Current wishlist:", wishlist);
            }}
            className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Debug Wishlist
          </button>

          {/* Clear all button */}
          <button 
            onClick={clearWishlist}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors ml-2"
          >
            Clear All
          </button>
        </div>

        {/* Movie Details Modal */}
        {selectedMovie && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
              <div className="relative">
                {selectedMovie.poster_path && (
                  <div className="h-64 sm:h-80 overflow-hidden">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`}
                      alt={selectedMovie.title}
                      className="w-full h-full object-cover object-top"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                  </div>
                )}
                <button 
                  onClick={closeModal}
                  className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white hover:bg-black/70 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{selectedMovie.title}</h2>
                
                <div className="flex items-center mb-4">
                  {selectedMovie.vote_average && (
                    <div className="flex items-center mr-4">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                      </svg>
                      <p className="ml-1 text-yellow-400 font-semibold">{selectedMovie.vote_average.toFixed(1)}</p>
                    </div>
                  )}
                  
                  {selectedMovie.release_date && (
                    <div className="text-gray-400">
                      {new Date(selectedMovie.release_date).getFullYear()}
                    </div>
                  )}
                  
                  {selectedMovie.genres && (
                    <div className="ml-4 text-gray-400">
                      {selectedMovie.genres}
                    </div>
                  )}
                </div>
                
                {selectedMovie.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-2">Overview</h3>
                    <p className="text-gray-300">{selectedMovie.description}</p>
                  </div>
                )}
                
                {selectedMovie.director && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Director</h3>
                    <p className="text-gray-300">{selectedMovie.director}</p>
                  </div>
                )}
                
                <div className="flex justify-end mt-6">
                  <button 
                    onClick={closeModal}
                    className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="relative z-10 text-center py-10 text-gray-400 text-sm border-t border-gray-800 mt-20">
          <div className="max-w-7xl mx-auto px-4">
            <p>© {new Date().getFullYear()} Movie Recommender. Find your perfect movie match.</p>
          </div>
        </footer>
      </main>
    </>
  );
};

export default Wishlist;