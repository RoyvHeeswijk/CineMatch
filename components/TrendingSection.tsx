'use client';

import React from 'react';
import { useWishlist } from '@/context/WishlistContext';
import Image from 'next/image';

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

interface TMDBMovie {
    id: string;
    title: string;
    overview: string;
    poster_path: string | null;   // TMDB API property
    posterPath?: string | null;   // Our internal property
    release_date: string | null;  // TMDB API property
    releaseDate?: string | null;  // Our internal property
    vote_average: number | null;  // TMDB API property
    rating?: string;              // Our internal property
    description?: string;         // For compatibility with our internal API
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
    requestedGenre?: string;
    preferenceDetails?: {
        basedOn?: string;
        minRating?: string;
        maxYear?: string;
        additionalRequests?: string;
    };
    userPreferences?: {
        requestedGenre?: string;
        minRating?: string;
        maxYear?: string;
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

interface TrendingSectionProps {
    title: string;
    description: string;
    items: TMDBMovie[] | Movie[];
    type: string;
}

export default function TrendingSection({ title, description, items, type }: TrendingSectionProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const [selectedItem, setSelectedItem] = React.useState<Movie | null>(null);
    const [movieDetails, setMovieDetails] = React.useState<MovieDetails | null>(null);
    const [loading, setLoading] = React.useState(false);

    // Format runtime to hours and minutes
    const formatRuntime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    React.useEffect(() => {
        if (selectedItem && selectedItem.id) {
            setLoading(true);
            // Try to get TMDB ID from the movie object or extract it from the ID
            const tmdbId = selectedItem.tmdbId ||
                (selectedItem.id.includes('tmdb-') ? selectedItem.id.replace('tmdb-', '') : null);

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
    }, [selectedItem]);

    // Get the movie description (handle both 'description' and 'overview' properties)
    const getMovieDescription = (movie: Movie) => {
        return movie.description || movie.overview || '';
    };

    const handleWishlistToggle = (item: TMDBMovie | Movie, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        // Identify the card element for highlight effect
        const movieCard = e.currentTarget.closest('.movie-card');

        if (isInWishlist(item.id)) {
            removeFromWishlist(item.id);
        } else {
            // Use our helper functions for safe property access
            addToWishlist({
                id: item.id,
                title: item.title,
                posterPath: getMoviePosterPath(item),
                releaseDate: getMovieReleaseDate(item),
                description: getMovieOverview(item),
                rating: getMovieRating(item),
                source: 'trending'
            });

            // Add highlight effect to the card
            if (movieCard) {
                movieCard.classList.add('highlight-wishlist');
                setTimeout(() => {
                    movieCard.classList.remove('highlight-wishlist');
                }, 1500);
            }
        }
    };

    const handleViewDetails = (movie: Movie) => {
        setSelectedItem(movie);
        setMovieDetails(null); // Reset movie details when selecting a new movie
    };

    const closeModal = () => {
        setSelectedItem(null);
        setMovieDetails(null);
    };

    // Fix the item access with type guards
    const getMoviePosterPath = (item: TMDBMovie | Movie): string | null => {
        return (item as any).poster_path || (item as any).posterPath || null;
    };

    const getMovieReleaseDate = (item: TMDBMovie | Movie): string => {
        return (item as any).release_date || (item as any).releaseDate || '';
    };

    const getMovieRating = (item: TMDBMovie | Movie): string => {
        const rating = (item as any).vote_average || (item as any).rating;
        return rating ? rating.toString() : '?';
    };

    const getMovieOverview = (item: TMDBMovie | Movie): string => {
        return (item as any).overview || (item as any).description || '';
    };

    if (!items || items.length === 0) return null;

    return (
        <>
            <div className="section-container">
                {/* Section Header with Badge */}
                <div className="flex items-center mb-6">
                    <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg px-3 py-1 text-white text-sm font-semibold mr-3">
                        TOP 10
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-white">{title}</h2>
                </div>

                <p className="text-blue-300/70 mb-6">{description}</p>

                {/* Use the same flex layout as recommendations */}
                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                    {items.map((item, index) => (
                        <div
                            key={`trending-${item.id}`}
                            className="flex-none w-[180px] sm:w-[200px] md:w-[220px] relative bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800 movie-card"
                        >
                            <div className="relative aspect-[2/3]">
                                {/* Top 10 Ranking Badge */}
                                <div className="absolute top-0 left-0 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xl w-10 h-10 flex items-center justify-center z-10">
                                    {index + 1}
                                </div>

                                {/* Poster image */}
                                {getMoviePosterPath(item) ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w500${getMoviePosterPath(item)}`}
                                        alt={item.title}
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                        <span className="text-gray-400">{item.title}</span>
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                                {/* Rating badge */}
                                <div className="absolute top-2 left-12 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                                    {getMovieRating(item)} ★
                                </div>

                                {/* Release year */}
                                <div className="flex flex-wrap text-xs text-gray-400 mt-1">
                                    <span>{new Date(getMovieReleaseDate(item)).getFullYear()}</span>
                                </div>

                                {/* Wishlist button - same as recommendation */}
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
                                    <span>{new Date(getMovieReleaseDate(item)).getFullYear()}</span>
                                </div>
                                <button
                                    onClick={() => setSelectedItem(item as Movie)}
                                    className="mt-3 w-full py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded hover:from-purple-700 hover:to-indigo-700 transition-all text-xs font-medium"
                                >
                                    View Details
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Movie Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-3xl font-bold">{selectedItem.title}</h3>
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
                                            src={`https://image.tmdb.org/t/p/w500${getMoviePosterPath(selectedItem)}`}
                                            alt={selectedItem.title}
                                            className="w-full"
                                        />
                                    </div>
                                </div>

                                <div className="md:w-2/3">
                                    <div className="text-sm text-gray-400 mb-6 flex items-center gap-3 flex-wrap">
                                        <span className="bg-blue-600 text-white px-2 py-1 rounded">
                                            ★ {getMovieRating(selectedItem)}
                                        </span>
                                        <span>{new Date(getMovieReleaseDate(selectedItem)).getFullYear()}</span>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-lg font-semibold mb-2">Overview</h4>
                                        <p className="text-gray-300 leading-relaxed">
                                            {getMovieOverview(selectedItem)}
                                        </p>
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