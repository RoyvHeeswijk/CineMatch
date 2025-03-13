import React, { useState, useEffect } from 'react';
import { useWishlist } from '@/context/WishlistContext';

// Define interfaces for TMDB API responses
interface Genre {
    id: number;
    name: string;
}

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
}

interface Movie {
    id: string;
    title: string;
    description?: string;
    overview?: string;
    posterPath: string | null;
    releaseDate: string;
    runtime?: number;
    rating?: string;
    genres?: string;
    director?: string;
    comparison?: string;
    cast?: string;
    tmdbId?: string;
    requestedGenres?: string[];
    preferenceDetails?: {
        basedOn: string | string[];
        minRating: string;
        yearRange?: {
            min: string;
            max: string;
        };
        additionalRequests?: string;
    };
    userPreferences?: {
        likedMovies?: string[];
        requestedGenres?: string[];
        minRating?: string;
        yearRange?: {
            min: string;
            max: string;
        };
        additionalPreferences?: string;
    };
}

interface MovieDetails {
    id: number;
    title: string;
    overview: string;
    runtime: number;
    genres: Genre[];
    credits: {
        cast: CastMember[];
        crew: CrewMember[];
    };
}

interface RecommendationListProps {
    recommendations: Movie[];
    title?: string;
    description?: string;
}

export default function RecommendationList({ recommendations, title = "Your Personalized Recommendations", description = "Curated movies based on your preferences" }: RecommendationListProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
    const [loading, setLoading] = useState(false);

    // Format runtime to hours and minutes
    const formatRuntime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    useEffect(() => {
        if (selectedMovie && selectedMovie.id) {
            setLoading(true);
            // Try to get TMDB ID from the movie object or extract it from the ID
            const tmdbId = selectedMovie.tmdbId ||
                (selectedMovie.id.includes('tmdb-') ? selectedMovie.id.replace('tmdb-', '') : null);

            if (tmdbId) {
                fetch(`/api/movie-details?id=${tmdbId}`)
                    .then(res => res.json())
                    .then(data => {
                        setMovieDetails(data);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('Error fetching movie details:', err);
                        setLoading(false);
                    });
            } else {
                setLoading(false);
            }
        }
    }, [selectedMovie]);

    if (!recommendations.length) return null;

    // Get the movie description (handle both 'description' and 'overview' properties)
    const getMovieDescription = (movie: Movie) => {
        return movie.description || movie.overview || '';
    };

    const handleWishlistToggle = (movie: Movie, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (isInWishlist(movie.id)) {
            removeFromWishlist(movie.id);
        } else {
            addToWishlist({
                id: movie.id,
                title: movie.title,
                poster_path: movie.posterPath || undefined,
                release_date: movie.releaseDate,
                vote_average: parseFloat(movie.rating || "0") || 0,
                description: getMovieDescription(movie),
                genres: movie.genres,
                director: movie.director
            });
        }
    };

    const handleViewDetails = (movie: Movie) => {
        setSelectedMovie(movie);
        setMovieDetails(null); // Reset movie details when selecting a new movie
    };

    const closeModal = () => {
        setSelectedMovie(null);
        setMovieDetails(null);
    };

    return (
        <>
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">{title}</h2>
                <p className="text-blue-200 text-sm font-light">{description}</p>
            </div>

            <div className="flex space-x-5 overflow-x-auto pb-6 scrollbar-hide">
                {recommendations.map((movie, index) => (
                    <div
                        key={`recommendation-${movie.id || index}`}
                        className="flex-none w-[170px] sm:w-[190px] md:w-[210px] group relative overflow-hidden rounded-xl backdrop-blur-sm bg-white/5 border border-white/10 shadow-xl transition-all duration-500 hover:shadow-cyan-500/20 hover:border-cyan-500/30"
                    >
                        <div className="relative aspect-[2/3] overflow-hidden">
                            {movie.posterPath ? (
                                <img
                                    src={movie.posterPath}
                                    alt={movie.title}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center">
                                    <span className="text-blue-200 text-center px-4">{movie.title}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-blue-950 via-transparent to-transparent opacity-90"></div>

                            {/* Rating badge with new design */}
                            <div className="absolute top-2 left-2 bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-2 py-1 rounded-md text-xs font-medium shadow-lg">
                                {movie.rating || "N/A"} ★
                            </div>

                            {/* Wishlist button with animation */}
                            <button
                                onClick={(e) => handleWishlistToggle(movie, e)}
                                className="absolute top-2 right-2 p-1.5 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-all duration-300 hover:scale-110"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 transition-colors duration-300"
                                    fill={isInWishlist(movie.id) ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    style={{ color: isInWishlist(movie.id) ? '#ec4899' : 'white' }}
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="p-4">
                            <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                            <div className="flex flex-wrap text-xs text-blue-300 mt-1">
                                <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                {movie.genres && (
                                    <span className="ml-2 opacity-70">{movie.genres}</span>
                                )}
                            </div>

                            <button
                                onClick={() => handleViewDetails(movie)}
                                className="mt-3 w-full py-1.5 bg-gradient-to-r from-blue-500/80 to-cyan-400/80 backdrop-blur-sm text-white rounded-md hover:from-blue-500 hover:to-cyan-400 transition-all duration-300 text-xs font-medium shadow-sm shadow-cyan-500/20 hover:shadow-cyan-500/30"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Movie Details Modal with new design */}
            {selectedMovie && (
                <div className="fixed inset-0 bg-blue-950/95 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
                    <div className="bg-gradient-to-br from-blue-900/90 to-slate-900/90 backdrop-blur-xl rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-scaleIn">
                        <div className="p-8">
                            <div className="flex justify-between items-start mb-8">
                                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">{selectedMovie.title}</h3>
                                <button
                                    onClick={closeModal}
                                    className="text-blue-300 hover:text-white text-2xl transition-colors"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="flex flex-col md:flex-row gap-10">
                                <div className="md:w-1/3">
                                    <div className="rounded-xl overflow-hidden shadow-2xl border border-white/10 hover:border-cyan-500/30 transition-all duration-500">
                                        {selectedMovie.posterPath ? (
                                            <img
                                                src={selectedMovie.posterPath}
                                                alt={selectedMovie.title}
                                                className="w-full h-auto"
                                            />
                                        ) : (
                                            <div className="aspect-[2/3] bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center">
                                                <span className="text-blue-200 text-center px-4">{selectedMovie.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="md:w-2/3">
                                    <div className="text-sm text-blue-200 mb-8 flex items-center gap-4 flex-wrap">
                                        {selectedMovie.rating && (
                                            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-white px-3 py-1 rounded-md font-medium shadow-lg">
                                                ★ {selectedMovie.rating}
                                            </span>
                                        )}
                                        <span className="bg-blue-800/50 backdrop-blur-sm px-3 py-1 rounded-md">
                                            {new Date(selectedMovie.releaseDate).getFullYear()}
                                        </span>

                                        {movieDetails?.runtime && (
                                            <span className="bg-blue-800/50 backdrop-blur-sm px-3 py-1 rounded-md">
                                                {formatRuntime(movieDetails.runtime)}
                                            </span>
                                        )}

                                        {movieDetails?.genres && (
                                            <div className="flex flex-wrap gap-2 mt-2">
                                                {movieDetails.genres.map((g: Genre) => (
                                                    <span key={g.id} className="bg-blue-800/30 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs">
                                                        {g.name}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Show overview from API data if available */}
                                    {(movieDetails?.overview || getMovieDescription(selectedMovie)) && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold mb-2">Overview</h4>
                                            <p className="text-gray-300 leading-relaxed">
                                                {movieDetails?.overview || getMovieDescription(selectedMovie)}
                                            </p>
                                        </div>
                                    )}

                                    <div className="text-sm space-y-2">
                                        {/* Show director from API data if available */}
                                        {movieDetails?.credits?.crew?.find((c: CrewMember) => c.job === 'Director')?.name ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Director: </span>
                                                {movieDetails.credits.crew.find((c: CrewMember) => c.job === 'Director')!.name}
                                            </p>
                                        ) : selectedMovie.director ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Director: </span>
                                                {selectedMovie.director}
                                            </p>
                                        ) : null}

                                        {/* Show cast from API data if available */}
                                        {movieDetails?.credits?.cast && movieDetails.credits.cast.length > 0 ? (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Cast: </span>
                                                {movieDetails?.credits?.cast.slice(0, 5).map((c: CastMember) => c.name).join(', ')}
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

                                    {/* Display match reason based on user preferences */}
                                    {(selectedMovie.comparison || selectedMovie.requestedGenres || selectedMovie.preferenceDetails) && (
                                        <div className="mt-8 p-4 bg-blue-800/20 backdrop-blur-sm rounded-lg border border-white/10">
                                            <h4 className="text-lg font-semibold mb-3 text-cyan-300">Why We Recommended This</h4>
                                            
                                            {selectedMovie.comparison && (
                                                <p className="text-blue-100 mb-2">
                                                    <span className="text-cyan-200 font-medium">Similar to: </span>
                                                    {selectedMovie.comparison}
                                                </p>
                                            )}
                                            
                                            {selectedMovie.requestedGenres && (
                                                <p className="text-blue-100 mb-2">
                                                    <span className="text-cyan-200 font-medium">Matches your genre preference: </span>
                                                    {selectedMovie.requestedGenres.join(', ')}
                                                </p>
                                            )}
                                            
                                            {selectedMovie.preferenceDetails?.additionalRequests && (
                                                <p className="text-blue-100 mb-2">
                                                    <span className="text-cyan-200 font-medium">Includes your preferences: </span>
                                                    {selectedMovie.preferenceDetails.additionalRequests}
                                                </p>
                                            )}
                                            
                                            {selectedMovie.userPreferences?.additionalPreferences && (
                                                <p className="text-blue-100">
                                                    <span className="text-cyan-200 font-medium">Matching your request for: </span>
                                                    {selectedMovie.userPreferences.additionalPreferences}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
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
            `}</style>
        </>
    );
} 