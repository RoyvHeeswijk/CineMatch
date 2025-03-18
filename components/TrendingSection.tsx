'use client';

import React, { useState } from 'react';
import { useWishlist } from '@/context/WishlistContext';
import { useScreenSize } from '@/hooks/useScreenSize';

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
    const [showAllMovies, setShowAllMovies] = useState(false);
    const { isMobile } = useScreenSize();

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

    const visibleMovies = isMobile && !showAllMovies
        ? items.slice(0, 6)
        : items;

    return (
        <div className="mb-4 md:mb-12">
            <div className="flex justify-between items-end mb-2 md:mb-4">
                <div>
                    <h2 className="text-base md:text-xl font-bold text-white">{title}</h2>
                    <p className="text-[10px] md:text-sm text-blue-300">{description}</p>
                </div>
            </div>

            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 md:gap-4">
                {visibleMovies.map((item, index) => (
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
                                    <span className="text-[10px] md:text-sm px-2 text-center">{item.title}</span>
                                </div>
                            )}

                            {/* Rank badge - smaller on mobile */}
                            <div className="absolute top-0.5 left-0.5 md:top-2 md:left-2 bg-blue-600/80 text-white px-1 md:px-2 py-0.5 rounded text-[8px] md:text-xs font-bold">
                                #{index + 1}
                            </div>

                            {/* Rating badge - smaller on mobile */}
                            {getMovieRating(item) > 0 && (
                                <div className="absolute top-0.5 right-0.5 md:top-2 md:right-2 bg-yellow-600/80 text-white px-1 md:px-2 py-0.5 rounded text-[8px] md:text-xs">
                                    ★ {getMovieRating(item)}
                                </div>
                            )}

                            {/* Like Button - smaller on mobile */}
                            <button
                                className={`absolute bottom-0.5 right-0.5 md:bottom-2 md:right-2 p-1 md:p-1.5 rounded-full transition-colors ${item.isInWishlist
                                    ? 'bg-pink-600/90 text-white'
                                    : 'bg-black/40 backdrop-blur-sm text-white/90 hover:bg-black/60'
                                    }`}
                                onClick={(e) => onLikeToggle(item, e)}
                                aria-label={item.isInWishlist ? "Unlike" : "Like"}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-2.5 w-2.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-1 md:p-3">
                            <h3 className="text-[10px] md:text-sm font-semibold text-white truncate">{item.title}</h3>
                            <p className="text-[8px] md:text-xs text-gray-400 mt-0.5 md:mt-1">
                                {new Date(getMovieReleaseDate(item)).getFullYear()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Show More/Less button - only on mobile and when there are more than 6 movies */}
            {isMobile && items.length > 6 && (
                <div className="mt-4 text-center">
                    <button
                        onClick={() => setShowAllMovies(!showAllMovies)}
                        className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-xs px-4 py-2 rounded-full transition-colors"
                    >
                        {showAllMovies ? 'Show Less' : `Show More Movies (${items.length - 6} more)`}
                    </button>
                </div>
            )}
        </div>
    );
};

export default TrendingSection; 