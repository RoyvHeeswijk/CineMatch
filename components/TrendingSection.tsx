'use client';

import { useState } from 'react';

interface Movie {
    title: string;
    posterPath: string;
    overview?: string;
    rating?: string;
    releaseDate: string;
    runtime?: number;
    formattedRuntime?: string;
    genres?: string;
    director?: string;
    cast?: string;
}

interface TrendingProps {
    title: string;
    description: string;
    items: Movie[];
    type: 'movies' | 'shows';
}

export default function TrendingSection({ title, description, items, type }: TrendingProps) {
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    return (
        <section className="mb-24">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
                <p className="text-gray-400 text-sm">{description}</p>
            </div>

            <div className="relative">
                <div className="flex gap-6 overflow-x-auto pb-12 -mx-4 px-4 scrollbar-hide">
                    {items.map((item, index) => (
                        <div
                            key={index}
                            className="relative flex-none group cursor-pointer"
                            onClick={() => setSelectedMovie(item)}
                        >
                            {/* Large background number */}
                            <span className="absolute -left-6 -top-10 text-[200px] font-bold text-[#1a1a1a] z-0 select-none leading-none">
                                {index + 1}
                            </span>

                            {/* Movie Card */}
                            <div className="relative z-10 w-[240px]">
                                <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-xl transform transition-transform duration-300 group-hover:scale-105">
                                    <img
                                        src={item.posterPath}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Hover Overlay */}
                                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-300 flex items-center justify-center">
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-center p-4">
                                            <p className="font-bold mb-2">{item.title}</p>
                                            {item.formattedRuntime && (
                                                <p className="text-sm">{item.formattedRuntime}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Movie Details Modal */}
            {selectedMovie && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1a1a1a] rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-start mb-6">
                                <h3 className="text-3xl font-bold">{selectedMovie.title}</h3>
                                <button
                                    onClick={() => setSelectedMovie(null)}
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
                                    <div className="text-sm text-gray-400 mb-6 flex items-center gap-3">
                                        {selectedMovie.rating && (
                                            <span className="bg-blue-600 text-white px-2 py-1 rounded">
                                                ★ {selectedMovie.rating}
                                            </span>
                                        )}
                                        <span>{new Date(selectedMovie.releaseDate).getFullYear()}</span>
                                        {selectedMovie.formattedRuntime && (
                                            <span>{selectedMovie.formattedRuntime}</span>
                                        )}
                                        {selectedMovie.genres && (
                                            <span>{selectedMovie.genres}</span>
                                        )}
                                    </div>

                                    {selectedMovie.overview && (
                                        <div className="mb-6">
                                            <h4 className="text-lg font-semibold mb-2">Overview</h4>
                                            <p className="text-gray-300 leading-relaxed">{selectedMovie.overview}</p>
                                        </div>
                                    )}

                                    <div className="text-sm space-y-2">
                                        {selectedMovie.director && (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Director: </span>
                                                {selectedMovie.director}
                                            </p>
                                        )}
                                        {selectedMovie.cast && (
                                            <p className="text-gray-300">
                                                <span className="text-gray-400">Cast: </span>
                                                {selectedMovie.cast}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
} 