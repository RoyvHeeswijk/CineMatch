import { useState, useEffect } from 'react';
import { useWatched } from '@/context/WatchedContext';
import Toast from '@/components/Toast';
import Head from 'next/head';
import Link from 'next/link';

export default function WatchedMovies() {
    const { watchedMovies, removeFromWatched, updateWatchedDate, clearWatched, updateWatchedMovie } = useWatched();
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState<string>('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [isClient, setIsClient] = useState(false);
    const [editingLabels, setEditingLabels] = useState<string | null>(null);
    const [newLabel, setNewLabel] = useState('');

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Sort watched movies with most recently watched first
    const sortedWatchedMovies = [...watchedMovies].sort((a, b) => {
        return new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime();
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Unknown date';
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
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
        if (!newDate) return; // Don't update if date is empty
        updateWatchedDate(movieId, newDate);
        setEditingDate(null);
        setTempDate('');
        setToast({
            show: true,
            message: 'Watch date updated',
            type: 'success'
        });
    };

    const handleDateEditStart = (movieId: string, currentDate: string) => {
        setEditingDate(movieId);
        setTempDate(currentDate.split('T')[0]);
    };

    const handleDateInputClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent card click events
    };

    // Add this helper function at the top of your component
    const groupMoviesByMonth = (movies: any[]) => {
        const grouped = movies.reduce((acc: { [key: string]: any[] }, movie) => {
            const date = new Date(movie.watchedDate);
            const monthYear = new Intl.DateTimeFormat('en-US', {
                month: 'long',
                year: 'numeric',
                timeZone: 'UTC'
            }).format(date);

            if (!acc[monthYear]) {
                acc[monthYear] = [];
            }
            acc[monthYear].push(movie);
            return acc;
        }, {});

        // Sort movies within each month by date (newest first)
        Object.keys(grouped).forEach(month => {
            grouped[month].sort((a, b) =>
                new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime()
            );
        });

        // Sort months chronologically (newest first)
        const sortedMonths = Object.keys(grouped).sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateB.getTime() - dateA.getTime();
        });

        return { grouped, sortedMonths };
    };

    const handleAddLabel = (movieId: string, labelType: 'alone' | 'with' | 'custom', text?: string) => {
        const movie = watchedMovies.find(m => m.id === movieId);
        if (!movie) return;

        const newLabels = [...(movie.labels || [])];

        if (labelType === 'alone' && !newLabels.some(l => l.type === 'alone')) {
            newLabels.push({ type: 'alone', text: 'Watched alone' });
        } else if (labelType === 'with' && text) {
            newLabels.push({ type: 'with', text: `Watch with ${text}` });
        } else if (labelType === 'custom' && text) {
            newLabels.push({ type: 'custom', text });
        }

        updateWatchedMovie(movieId, { ...movie, labels: newLabels });
        setEditingLabels(null);
        setNewLabel('');
    };

    const handleRemoveLabel = (movieId: string, labelIndex: number) => {
        const movie = watchedMovies.find(m => m.id === movieId);
        if (!movie) return;

        const newLabels = [...(movie.labels || [])];
        newLabels.splice(labelIndex, 1);
        updateWatchedMovie(movieId, { ...movie, labels: newLabels });
    };

    return (
        <>
            <Head>
                <title>Watched Movies | CineMatch</title>
                <meta name="description" content="Your watched movies history" />
            </Head>

            <main className="min-h-screen bg-[#111827] text-white">
                {/* Top Navigation Bar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#1F2937]/95 backdrop-blur-lg border-b border-[#374151]">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <Link href="/" className="text-2xl font-bold text-white flex items-center gap-2">
                            <span>CineMatch</span>
                            <span className="text-sm font-normal text-indigo-400">AI Movie Finder</span>
                        </Link>

                        <Link
                            href="/"
                            className="flex items-center gap-2 px-5 py-2 rounded-full bg-[#374151] hover:bg-[#4B5563] transition-all duration-200 text-white"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Home
                        </Link>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="pt-24 pb-12 max-w-7xl mx-auto px-6">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-2">Your Watched Movies</h1>
                            <p className="text-gray-400">Keep track of all the movies you've watched</p>
                        </div>

                        {watchedMovies.length > 0 && (
                            <button
                                onClick={() => {
                                    if (confirm('Are you sure you want to clear your watched movies history?')) {
                                        clearWatched();
                                    }
                                }}
                                className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-colors text-sm font-medium"
                            >
                                Clear History
                            </button>
                        )}
                    </div>

                    {watchedMovies.length === 0 ? (
                        <div className="bg-[#1F2937] rounded-2xl p-12 text-center border border-[#374151]">
                            <div className="mx-auto w-20 h-20 rounded-full bg-[#374151] flex items-center justify-center mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-medium text-white mb-2">No watched movies yet</h3>
                            <p className="text-gray-400 mb-6">Start marking movies as watched to build your history</p>
                            <Link
                                href="/"
                                className="px-5 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors inline-flex items-center gap-2 font-medium"
                            >
                                Discover Movies
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {sortedWatchedMovies.map((movie) => (
                                <div
                                    key={movie.id}
                                    className="bg-[#1F2937] rounded-xl overflow-hidden hover:shadow-lg hover:scale-105 transition-all duration-300 border border-[#374151]"
                                >
                                    <div className="relative aspect-[2/3]">
                                        {movie.posterPath ? (
                                            <img
                                                src={movie.posterPath}
                                                alt={movie.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="absolute inset-0 bg-[#374151] flex items-center justify-center">
                                                <span className="text-gray-300 text-sm text-center px-2">{movie.title}</span>
                                            </div>
                                        )}

                                        {/* Remove button */}
                                        <button
                                            onClick={() => removeFromWatched(movie.id)}
                                            className="absolute top-2 right-2 bg-black/50 hover:bg-rose-600 text-white p-2 rounded-lg transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>

                                        {/* Watch date indicator */}
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent py-3 px-3">
                                            <p className="text-gray-300 text-xs">
                                                Watched on {formatDate(movie.watchedDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="p-3">
                                        <h3 className="text-sm font-semibold text-white truncate">{movie.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            {/* Toast notification */}
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </>
    );
} 