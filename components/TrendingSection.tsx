'use client';

import { useState, useEffect } from 'react';
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
    description?: string;  // Recommendation list uses description
    overview?: string;     // Trending section uses overview
    posterPath: string;
    releaseDate: string;
    runtime?: number;
    formattedRuntime?: string;
    rating?: string;
    genres?: string;
    director?: string;
    cast?: string;
    comparison?: string;
    tmdbId?: string;
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

interface TrendingProps {
    title: string;
    description: string;
    items: Movie[];
    type: 'movies' | 'shows';
}

export default function TrendingSection({ title, description, items, type }: TrendingProps) {
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

    // Get the movie description (handle both 'description' and 'overview' properties)
    const getMovieDescription = (movie: Movie) => {
        return movie.description || movie.overview || '';
    };

    const handleWishlistToggle = (movie: Movie, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const wishlistMovie = {
            id: movie.id,
            title: movie.title,
            poster_path: movie.posterPath,
            release_date: movie.releaseDate,
            vote_average: parseFloat(movie.rating || "0"),
            description: getMovieDescription(movie),
            genres: movie.genres,
            director: movie.director
        };

        if (isInWishlist(movie.id)) {
            removeFromWishlist(movie.id);
        } else {
            addToWishlist(wishlistMovie);
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
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>

            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                {items.map((item, index) => (
                    <div
                        key={`trending-${item.id || index}`}
                        className="flex-none w-[180px] sm:w-[200px] md:w-[220px] relative bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800"
                    >
                        <div className="relative aspect-[2/3]">
                            {item.posterPath ? (
                                <img
                                    src={item.posterPath}
                                    alt={item.title}
                                    className="absolute inset-0 w-full h-full object-cover"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                    <span className="text-gray-400">{item.title}</span>
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                            {/* Rating badge - styled like in the screenshot */}
                            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                {item.rating || "N/A"} ★
                            </div>

                            {/* Wishlist button */}
                            <button
                                onClick={(e) => handleWishlistToggle(item, e)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill={isInWishlist(item.id) ? "currentColor" : "none"}
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                    style={{ color: isInWishlist(item.id) ? '#ec4899' : 'white' }}
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
                            <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                            <div className="flex flex-wrap text-xs text-gray-400 mt-1">
                                <span>{new Date(item.releaseDate).getFullYear()}</span>
                                {item.genres && (
                                    <span className="ml-2">{item.genres}</span>
                                )}
                            </div>

                            <button
                                onClick={() => handleViewDetails(item)}
                                className="mt-3 w-full py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-all text-xs font-medium"
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Movie Details Modal - Exactly the same as RecommendationList */}
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
                                            src={selectedMovie.posterPath}
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

                                        {/* Include comparison section if available (for consistency) */}
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