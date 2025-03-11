import React from 'react';
import { useWishlist } from '@/context/WishlistContext';

interface Movie {
    id: string;
    title: string;
    description: string;
    posterPath: string | null;
    releaseDate: string;
    runtime: number;
    rating: string;
    genres: string;
    director: string;
    comparison: string;
    cast: string;
}

interface RecommendationListProps {
    recommendations: Movie[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
    const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

    if (!recommendations.length) return null;
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
                vote_average: parseFloat(movie.rating)
            });
        }
    };

    return (
        <div className="flex space-x-6 pb-4">
            {recommendations.map((movie, index) => (
                <div
                    key={index}
                    className="flex-shrink-0 w-72 bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-800"
                >
                    <div className="relative h-96">
                        {movie.posterPath ? (
                            <img
                                src={movie.posterPath}
                                alt={movie.title}
                                className="absolute inset-0 w-full h-full object-cover rounded-t-lg"
                            />
                        ) : (
                            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                                <span className="text-gray-400">{movie.title}</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>

                        {/* Wishlist button */}
                        <button
                            onClick={(e) => handleWishlistToggle(movie, e)}
                            className="absolute top-3 right-3 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
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

                        {/* Rating badge */}
                        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {movie.rating} ★
                        </div>
                    </div>

                    <div className="p-4">
                        <h3 className="text-lg font-semibold text-white truncate">{movie.title}</h3>
                        <div className="flex items-center justify-between mt-2 text-sm text-gray-400">
                            <span>{new Date(movie.releaseDate).getFullYear()}</span>
                            <span className="truncate ml-2">{movie.genres}</span>
                        </div>

                        <div className="mt-4 text-sm text-gray-300 h-16 overflow-hidden" style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical'
                        }}>
                            {movie.description}
                        </div>

                        <button className="mt-4 w-full py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded hover:from-blue-700 hover:to-purple-700 transition-all text-sm font-medium">
                            View Details
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 