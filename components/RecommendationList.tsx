import React, { useState, useEffect, memo } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Movie } from '@/types/movie';
import Image from 'next/image';
import WishlistButton from './WishlistButton';
import Toast from './Toast';

interface RecommendationListProps {
    recommendations: Movie[];
    isLoading?: boolean;
    onSelectMovie?: (movie: any) => void;
}

interface CastMember {
    name: string;
}

interface Genre {
    name: string;
}

interface CrewMember {
    job: string;
    name: string;
}

// Add a helper function to extract key info from preferences text
const extractPreferenceKeywords = (preferences: string): string[] => {
    if (!preferences) return [];

    // Extract significant words from preferences (ignore common words)
    const commonWords = ['and', 'or', 'the', 'with', 'in', 'on', 'a', 'an', 'for', 'to', 'of', 'from', 'by'];

    return preferences
        .toLowerCase()
        .split(/[\s,.!?;:]+/)
        .filter(word => word.length > 3 && !commonWords.includes(word))
        .slice(0, 10); // Limit to 10 keywords for display
};

// Add this function to handle missing data more gracefully
const getMovieDescription = (movie: Movie): string => {
    return movie.description || "No description available.";
};

// Creating a simple card component
const MovieCard = memo(({
    movie,
    onViewDetails,
    onWishlistToggle,
    isInWishlist
}: {
    movie: Movie;
    onViewDetails: (movie: Movie) => void;
    onWishlistToggle: (movie: Movie, e: React.MouseEvent) => void;
    isInWishlist: boolean;
}) => {
    return (
        <div className="flex-none w-[180px] sm:w-[200px] md:w-[220px] relative bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800 movie-card">
            <div className="relative aspect-[2/3]">
                {movie.posterPath ? (
                    <img
                        src={movie.posterPath}
                        alt={movie.title}
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-400">{movie.title}</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                {/* Rating badge */}
                <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                    {movie.rating} ★
                </div>

                {/* Wishlist button */}
                <button
                    onClick={(e) => onWishlistToggle(movie, e)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        fill={isInWishlist ? "currentColor" : "none"}
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                        style={{ color: isInWishlist ? '#ec4899' : 'white' }}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </button>
            </div>

            <div className="p-3">
                <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                <div className="flex flex-wrap text-xs text-gray-400 mt-1">
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                    {movie.genres && <span className="ml-2">{movie.genres}</span>}
                </div>
                <button
                    onClick={() => onViewDetails(movie)}
                    className="mt-3 w-full py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-all text-xs font-medium"
                >
                    View Details
                </button>
            </div>
        </div>
    );
});

const RecommendationList: React.FC<RecommendationListProps> = ({
    recommendations,
    isLoading = false,
    onSelectMovie
}) => {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
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

    // Fetch additional movie details when a movie is selected
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

    if (isLoading) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">Finding Recommendations...</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                    {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="aspect-[2/3] bg-gray-800/30 rounded-lg animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    // If no recommendations, show empty state
    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="p-4">
                <h2 className="text-xl font-bold mb-4">No Recommendations Available</h2>
                <p className="text-gray-400">Try searching with different preferences</p>
            </div>
        );
    }

    // Handle liking/unliking a movie
    const handleLikeToggle = (movie: Movie, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation(); // Prevent opening movie details when clicking like button
        }

        if (isInWishlist(movie.id)) {
            removeFromWishlist(movie.id);
            setToast({
                show: true,
                message: `${movie.title} removed from likes`,
                type: 'info'
            });
        } else {
            addToWishlist({
                ...movie
            });
            setToast({
                show: true,
                message: `${movie.title} added to likes`,
                type: 'info'
            });
        }
    };

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

    // Handle movie click to show details
    const handleMovieClick = (movie: Movie) => {
        if (onSelectMovie) {
            // If parent provided a function, use it to show details at page level
            onSelectMovie(movie);
        } else {
            // Otherwise use the component's internal state (fallback)
            setSelectedMovie(movie);
        }
    };

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Recommended Movies</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 md:gap-6">
                {recommendations.slice(0, 12).map((movie) => (
                    <div
                        key={movie.id}
                        className="bg-gray-800/80 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-700/80 relative flex flex-col"
                        onClick={() => handleMovieClick(movie)}
                    >
                        <div className="relative aspect-[2/3]">
                            {movie.posterPath ? (
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900">
                                    <span className="text-sm px-4 text-center">{movie.title}</span>
                                </div>
                            )}

                            {/* Overlay with gradient for better readability */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/0 to-black/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            {/* Rating badge */}
                            {movie.rating && (
                                <div className="absolute top-2 left-2 bg-yellow-600/80 text-white px-2 py-0.5 rounded text-xs">
                                    ★ {movie.rating}
                                </div>
                            )}

                            {/* Like Button */}
                            <button
                                className={`absolute top-2 right-2 p-1.5 rounded-full ${isInWishlist(movie.id)
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-black/50 text-white/70 hover:text-white'
                                    }`}
                                onClick={(e) => handleLikeToggle(movie, e)}
                                aria-label={isInWishlist(movie.id) ? "Unlike" : "Like"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        {/* Movie info */}
                        <div className="p-3 flex-1 flex flex-col">
                            <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                            <div className="flex items-center mt-1 text-xs text-blue-300">
                                <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                {movie.genres && (
                                    <span className="ml-2 truncate">{movie.genres}</span>
                                )}
                            </div>
                            <p className="mt-2 text-xs text-gray-400 line-clamp-2">
                                {movie.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Toast notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}

            {/* Full-screen movie details modal */}
            {!onSelectMovie && selectedMovie && (
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

                                {/* Like button */}
                                <div className="mt-6">
                                    <button
                                        onClick={() => handleLikeToggle(selectedMovie)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isInWishlist(selectedMovie.id)
                                            ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {isInWishlist(selectedMovie.id) ? 'Unlike' : 'Like This Movie'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecommendationList; 