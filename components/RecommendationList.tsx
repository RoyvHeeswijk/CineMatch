import React, { useState, useEffect, memo } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useWatched } from '@/context/WatchedContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Movie } from '@/types/movie';
import Image from 'next/image';
import WishlistButton from './WishlistButton';
import Toast from './Toast';
import { useScreenSize } from '@/hooks/useScreenSize';

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
    isInWishlist,
    isWatched
}: {
    movie: Movie;
    onViewDetails: (movie: Movie) => void;
    onWishlistToggle: (movie: Movie, e: React.MouseEvent) => void;
    isInWishlist: (id: string) => boolean;
    isWatched: (id: string) => boolean;
}) => {
    return (
        <div className="flex-none w-[140px] sm:w-[180px] md:w-[220px] relative bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800 movie-card">
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

                {/* Bottom buttons */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent"></div>
                    <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                        {/* Watched indicator - bottom left */}
                        {isWatched(movie.id) ? (
                            <div className="bg-green-600/90 text-white p-1.5 rounded-full" title="Already watched">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                        ) : (
                            <div className="w-[28px]"></div>
                        )}

                        {/* Like button - bottom right */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onWishlistToggle(movie, e);
                            }}
                            className={`p-1.5 rounded-full transition-colors ${isInWishlist(movie.id)
                                ? 'bg-pink-600/90 text-white'
                                : 'bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={isInWishlist(movie.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                        </button>
                    </div>
                </div>
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
    const { isWatched } = useWatched();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [movieDetails, setMovieDetails] = useState<any>(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
    const [showAllMovies, setShowAllMovies] = useState(false);
    const { isMobile } = useScreenSize();

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

    if (!recommendations || recommendations.length === 0) {
        if (isLoading) {
            return (
                <div className="bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                    {/* Loading Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div
                                key={index}
                                className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-lg overflow-hidden animate-pulse"
                            >
                                <div className="aspect-[2/3] bg-gradient-to-br from-blue-800/40 to-blue-700/40"></div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 md:w-20 md:h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                    </div>
                    <h3 className="text-lg md:text-xl font-medium text-blue-200 mb-2">Ready to Find Your Perfect Movie?</h3>
                    <p className="text-blue-300/70 text-sm md:text-base max-w-md mx-auto">
                        Tell us what you like in the search box above, and we'll recommend movies just for you.
                    </p>
                </div>
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

    const visibleMovies = isMobile && !showAllMovies
        ? recommendations.slice(0, 6)
        : recommendations;

    return (
        <div className="p-2 md:p-4">
            <h2 className="text-lg md:text-xl font-bold mb-2 md:mb-4">Recommended Movies</h2>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                {visibleMovies.map((movie) => (
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
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <span className="text-gray-400 text-[10px] md:text-sm px-2 text-center">{movie.title}</span>
                                </div>
                            )}

                            {/* Rating badge */}
                            <div className="absolute top-0.5 left-0.5 md:top-2 md:left-2 bg-blue-600 text-white px-1 md:px-2 py-0.5 rounded text-[8px] md:text-xs font-medium">
                                {movie.rating} ★
                            </div>

                            {/* Like button - smaller and better styled for mobile */}
                            <div className="absolute bottom-0 left-0 right-0">
                                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent"></div>
                                <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
                                    {/* Watched indicator - bottom left */}
                                    {isWatched(movie.id) ? (
                                        <div className="bg-green-600/90 text-white p-1.5 rounded-full" title="Already watched">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    ) : (
                                        <div className="w-[28px]"></div>
                                    )}

                                    {/* Like button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLikeToggle(movie, e);
                                        }}
                                        className={`p-1.5 rounded-full transition-colors ${isInWishlist(movie.id)
                                            ? 'bg-pink-600/90 text-white'
                                            : 'bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill={isInWishlist(movie.id) ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="p-1 md:p-3">
                            <h3 className="text-[10px] md:text-sm font-semibold text-white truncate">{movie.title}</h3>
                            <p className="text-[8px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                                {new Date(movie.releaseDate).getFullYear()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More/Less button - only on mobile and when there are more than 6 movies */}
            {isMobile && recommendations.length > 6 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowAllMovies(!showAllMovies)}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs px-4 py-2 rounded-full transition-colors"
                    >
                        {showAllMovies ? 'Show Less' : `Show More Movies (${recommendations.length - 6} more)`}
                    </button>
                </div>
            )}

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