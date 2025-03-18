'use client';

import React from 'react';
import { useWishlist } from '@/context/WishlistContext';

interface TrendingSectionProps {
    title: string;
    description: string;
    items: any[];
    type: 'movies' | 'shows';
    onSelectMovie: (movie: any) => void;
    onLikeToggle: (movie: any, e?: React.MouseEvent) => void;
}

const TrendingSection: React.FC<TrendingSectionProps> = ({
    title,
    description,
    items,
    type,
    onSelectMovie,
    onLikeToggle
}) => {
    // Helper functions to handle different API response formats
    const getMoviePosterPath = (movie: any): string => {
        return movie.posterPath || movie.poster_path ?
            (movie.posterPath ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) :
            '';
    };

    const getMovieReleaseDate = (movie: any): string => {
        return movie.releaseDate || movie.release_date || '';
    };

    const getMovieRating = (movie: any): number => {
        return movie.rating || movie.vote_average || 0;
    };

    return (
        <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <p className="text-blue-300 text-sm">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className="bg-gray-800/80 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-700/80 relative flex flex-col"
                        onClick={() => onSelectMovie(item)}
                    >
                        <div className="relative aspect-[2/3]">
                            {getMoviePosterPath(item) ? (
                                <img
                                    src={getMoviePosterPath(item)}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400 bg-gray-900">
                                    <span className="text-sm px-4 text-center">{item.title}</span>
                                </div>
                            )}

                            {/* Rank badge */}
                            <div className="absolute top-2 left-2 bg-blue-600/80 text-white px-2 py-0.5 rounded text-xs font-bold">
                                #{index + 1}
                            </div>

                            {/* Rating badge */}
                            {getMovieRating(item) > 0 && (
                                <div className="absolute top-2 right-2 bg-yellow-600/80 text-white px-2 py-0.5 rounded text-xs">
                                    ★ {getMovieRating(item)}
                                </div>
                            )}

                            {/* Like Button */}
                            <button
                                className={`absolute bottom-2 right-2 p-1.5 rounded-full ${item.isInWishlist
                                    ? 'bg-pink-600 text-white'
                                    : 'bg-black/50 text-white/70 hover:text-white'
                                    }`}
                                onClick={(e) => onLikeToggle(item, e)}
                                aria-label={item.isInWishlist ? "Unlike" : "Like"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-3">
                            <h3 className="text-sm font-semibold text-white truncate">{item.title}</h3>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(getMovieReleaseDate(item)).getFullYear()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrendingSection; 