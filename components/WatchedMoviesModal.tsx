import React, { useState, useEffect } from 'react';
import { useWatched } from '@/context/WatchedContext';
import Toast from './Toast';

interface WatchedMoviesModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const WatchedMoviesModal: React.FC<WatchedMoviesModalProps> = ({ isOpen, onClose }) => {
    const { watchedMovies, removeFromWatched, updateWatchedDate, clearWatched } = useWatched();
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
    const [movieDetails, setMovieDetails] = useState<any>(null);
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [view, setView] = useState<'grid' | 'list'>('grid');

    useEffect(() => {
        if (toast.show) {
            const timer = setTimeout(() => {
                setToast({ ...toast, show: false });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [toast]);

    if (!isOpen) return null;

    // Sort watched movies with most recently watched first
    const sortedWatchedMovies = [...watchedMovies].sort((a, b) => {
        return new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime();
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const handleRemoveFromWatched = (movieId: string) => {
        removeFromWatched(movieId);
        setToast({
            show: true,
            message: 'Movie removed from watched list',
            type: 'info'
        });
    };

    const handleDateUpdate = (movieId: string, newDate: string) => {
        updateWatchedDate(movieId, newDate);
        setEditingDate(null);
        setToast({
            show: true,
            message: 'Watch date updated',
            type: 'success'
        });
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80" onClick={onClose}>
            <div className="min-h-screen flex items-center justify-center p-4">
                <div
                    className="bg-gradient-to-b from-gray-900 to-blue-900/90 rounded-xl overflow-hidden shadow-2xl w-full max-w-6xl animate-scaleIn"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="sticky top-0 bg-gray-900/90 z-10 px-6 py-4 border-b border-white/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-white">Your Watched Movies</h2>
                                <p className="text-blue-300/70 text-sm mt-1">Keep track of your movie watching history</p>
                            </div>
                            <div className="flex items-center gap-4">
                                {/* View toggle buttons */}
                                <div className="flex bg-gray-800 rounded-lg p-1">
                                    <button
                                        onClick={() => setView('grid')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'grid'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        Grid
                                    </button>
                                    <button
                                        onClick={() => setView('list')}
                                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${view === 'list'
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        List
                                    </button>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-6">
                        {watchedMovies.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="mx-auto w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-medium text-white mb-3">No watched movies yet</h3>
                                <p className="text-blue-300/70 text-lg mb-8">
                                    Start marking movies as watched to track your viewing history
                                </p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                                >
                                    Browse Movies
                                </button>
                            </div>
                        ) : (
                            <>
                                {view === 'grid' ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {sortedWatchedMovies.map((movie) => (
                                            <div
                                                key={movie.id}
                                                className="bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-300"
                                            >
                                                <div className="relative aspect-[2/3]">
                                                    {movie.posterPath ? (
                                                        <img
                                                            src={movie.posterPath}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                                                            <span className="text-gray-400 text-sm text-center px-2">{movie.title}</span>
                                                        </div>
                                                    )}

                                                    {/* Remove button */}
                                                    <button
                                                        onClick={() => handleRemoveFromWatched(movie.id)}
                                                        className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </div>

                                                <div className="p-4">
                                                    <h3 className="text-sm font-semibold text-white mb-2 line-clamp-1">{movie.title}</h3>

                                                    {/* Watched date with edit functionality */}
                                                    <div className="mt-2">
                                                        {editingDate === movie.id ? (
                                                            <input
                                                                type="date"
                                                                defaultValue={movie.watchedDate?.split('T')[0]}
                                                                onChange={(e) => handleDateUpdate(movie.id, e.target.value)}
                                                                className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1"
                                                                onBlur={() => setEditingDate(null)}
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => setEditingDate(movie.id)}
                                                                className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1"
                                                            >
                                                                <span>Watched: {formatDate(movie.watchedDate)}</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {sortedWatchedMovies.map((movie) => (
                                            <div
                                                key={movie.id}
                                                className="flex items-center bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-800/70 transition-all duration-300"
                                            >
                                                <div className="w-16 h-24 flex-shrink-0">
                                                    {movie.posterPath ? (
                                                        <img
                                                            src={movie.posterPath}
                                                            alt={movie.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                                                            <span className="text-gray-400 text-xs text-center px-2">{movie.title}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 p-4">
                                                    <h3 className="text-white font-semibold">{movie.title}</h3>
                                                    <div className="mt-1">
                                                        {editingDate === movie.id ? (
                                                            <input
                                                                type="date"
                                                                defaultValue={movie.watchedDate?.split('T')[0]}
                                                                onChange={(e) => handleDateUpdate(movie.id, e.target.value)}
                                                                className="bg-gray-700 text-white text-sm rounded px-2 py-1"
                                                                onBlur={() => setEditingDate(null)}
                                                            />
                                                        ) : (
                                                            <button
                                                                onClick={() => setEditingDate(movie.id)}
                                                                className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1"
                                                            >
                                                                <span>Watched: {formatDate(movie.watchedDate)}</span>
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                </svg>
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveFromWatched(movie.id)}
                                                    className="p-4 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Clear all button */}
                                {watchedMovies.length > 0 && (
                                    <div className="mt-8 text-center">
                                        <button
                                            onClick={() => {
                                                if (confirm('Are you sure you want to clear your watched movies list?')) {
                                                    clearWatched();
                                                    setToast({
                                                        show: true,
                                                        message: 'Watched movies list cleared',
                                                        type: 'info'
                                                    });
                                                }
                                            }}
                                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm"
                                        >
                                            Clear Watched Movies
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Toast notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default WatchedMoviesModal; 