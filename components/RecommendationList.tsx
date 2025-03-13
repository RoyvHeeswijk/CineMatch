import React, { useState, useEffect, memo } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import { Movie } from '@/types/movie';

interface RecommendationListProps {
    recommendations: Movie[];
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

export default function RecommendationList({ recommendations }: RecommendationListProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [movieDetails, setMovieDetails] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });

    // Format runtime to hours and minutes
    const formatRuntime = (runtime: number): string => {
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours}h ${minutes}m`;
    };

    // Function to handle viewing movie details
    const handleViewDetails = (movie: Movie) => {
        setSelectedMovie(movie);
        setLoading(true);

        // If we have a TMDB ID, fetch additional details
        if (movie.tmdbId) {
            fetchMovieDetails(movie.tmdbId);
        } else {
            // If no tmdbId, just show what we have without loading
            setLoading(false);
        }
    };

    // Fetch additional movie details from TMDB if needed
    const fetchMovieDetails = async (tmdbId: string) => {
        try {
            // Check if tmdbId is valid before making the API call
            if (!tmdbId) {
                setLoading(false);
                return;
            }

            const response = await fetch(`/api/movie/${tmdbId}`);
            const data = await response.json();
            setMovieDetails(data);
        } catch (error) {
            console.error('Error fetching movie details:', error);
        } finally {
            setLoading(false);
        }
    };

    // Close the movie details modal
    const closeModal = () => {
        setSelectedMovie(null);
        setMovieDetails(null);
    };

    // Handle escape key to close modal
    useEffect(() => {
        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && selectedMovie) {
                closeModal();
            }
        };

        window.addEventListener('keydown', handleEscapeKey);
        return () => window.removeEventListener('keydown', handleEscapeKey);
    }, [selectedMovie]);

    if (loading) {
        return <LoadingSkeleton />;
    }

    if (!recommendations.length) return null;

    // Update the wishlist toggle function to highlight the selected movie
    const handleWishlistToggle = (movie: Movie, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Identify the card element for highlight effect
        const movieCard = e.currentTarget.closest('.movie-card');

        if (isInWishlist(movie.id)) {
            removeFromWishlist(movie.id);
            setToast({
                show: true,
                message: `${movie.title} removed from wishlist`,
                type: 'info'
            });
        } else {
            addToWishlist({
                id: movie.id,
                title: movie.title,
                posterPath: movie.posterPath,
                releaseDate: movie.releaseDate || new Date().toISOString(),
                description: getMovieDescription(movie),
                rating: movie.rating || '?',
                source: 'recommended'
            });

            // Add highlight effect to the card
            if (movieCard) {
                movieCard.classList.add('highlight-wishlist');
                setTimeout(() => {
                    movieCard.classList.remove('highlight-wishlist');
                }, 1500);
            }

            setToast({
                show: true,
                message: `${movie.title} added to wishlist`,
                type: 'info'
            });
        }
    };

    return (
        <>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {recommendations.map((movie, index) => (
                    <MovieCard
                        key={`recommendation-${movie.id || index}`}
                        movie={movie}
                        onViewDetails={handleViewDetails}
                        onWishlistToggle={handleWishlistToggle}
                        isInWishlist={isInWishlist(movie.id)}
                    />
                ))}
            </div>

            {/* Movie Details Modal - Updated to match TrendingSection and fetch TMDB data */}
            {selectedMovie && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-3xl font-bold">{selectedMovie.title}</h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-white text-2xl"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8">
                                <div className="md:w-1/3">
                                    <div className="rounded-lg overflow-hidden shadow-2xl">
                                        <img
                                            src={selectedMovie.posterPath || ''}
                                            alt={selectedMovie.title}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="md:w-2/3">
                                    <div className="text-sm text-gray-400 mb-6 flex items-center gap-3 flex-wrap">
                                        {selectedMovie.rating && (
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded">
                                                ★ {selectedMovie.rating}
                                            </span>
                                        )}
                                        <span>{new Date(selectedMovie.releaseDate).getFullYear()}</span>

                                        {/* Show runtime from API data if available */}
                                        {movieDetails?.runtime ? (
                                            <span>{formatRuntime(movieDetails.runtime)}</span>
                                        ) : selectedMovie.runtime ? (
                                            <span>{formatRuntime(selectedMovie.runtime)}</span>
                                        ) : null}

                                        {/* Show genres from API data if available */}
                                        {movieDetails?.genres ? (
                                            <span>{movieDetails.genres.map((g: Genre) => g.name).join(', ')}</span>
                                        ) : selectedMovie.genres ? (
                                            <span>{selectedMovie.genres}</span>
                                        ) : null}
                                    </div>

                                    {/* Show overview from API data if available */}
                                    {(movieDetails?.overview || selectedMovie.description) && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold mb-2">Overview</h4>
                                            <p className="text-gray-300 leading-relaxed">
                                                {movieDetails?.overview || selectedMovie.description}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-sm space-y-2">
                                        {/* Show director from API data if available */}
                                        {movieDetails?.credits?.crew?.find((c: CrewMember) => c.job === 'Director')?.name ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Director: </span>
                                                {movieDetails.credits.crew.find((c: CrewMember) => c.job === 'Director').name}
                                            </p>
                                        ) : selectedMovie.director ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Director: </span>
                                                {selectedMovie.director}
                                            </p>
                                        ) : null}

                                        {/* Show cast from API data if available */}
                                        {movieDetails?.credits?.cast?.length > 0 ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Cast: </span>
                                                {movieDetails.credits.cast.slice(0, 5).map((c: CastMember) => c.name).join(', ')}
                                            </p>
                                        ) : selectedMovie.cast ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Cast: </span>
                                                {selectedMovie.cast}
                                            </p>
                                        ) : null}

                                        {/* Keep the comparison section which is unique to recommendations */}
                                        {selectedMovie.comparison && (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Similar To: </span>
                                                {selectedMovie.comparison}
                                            </p>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <button
                                            onClick={(e) => handleWishlistToggle(selectedMovie, e)}
                                            className={`px-4 py-2 rounded transition-colors flex items-center ${isInWishlist(selectedMovie.id)
                                                ? "bg-pink-600 hover:bg-pink-700 text-white"
                                                : "bg-gray-700 hover:bg-gray-600 text-white"
                                                }`}
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-2"
                                                fill={isInWishlist(selectedMovie.id) ? "currentColor" : "none"}
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                                strokeWidth={2}
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                />
                                            </svg>
                                            {isInWishlist(selectedMovie.id) ? "Remove from Wishlist" : "Add to Wishlist"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
} 