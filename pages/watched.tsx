import { useState, useEffect } from 'react';
import { useWatched } from '@/context/WatchedContext';
import Toast from '@/components/Toast';
import Head from 'next/head';
import Link from 'next/link';

export default function WatchedMovies() {
    const { watchedMovies, removeFromWatched, updateWatchedDate, clearWatched } = useWatched();
    const [editingDate, setEditingDate] = useState<string | null>(null);
    const [tempDate, setTempDate] = useState<string>('');
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });
    const [view, setView] = useState<'grid' | 'list'>('grid');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Sort watched movies with most recently watched first
    const sortedWatchedMovies = [...watchedMovies].sort((a, b) => {
        return new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime();
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Date not set';
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC'
        }).format(date);
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

    return (
        <>
            <Head>
                <title>CineMatch | Your Watched Movies</title>
                <meta name="description" content="Your watched movies history" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white font-['Inter']">
                {/* Background elements */}
                <div className="absolute inset-0 overflow-hidden hidden md:block">
                    <div className="stars-container"></div>
                </div>

                <div className="fixed top-1/4 -left-40 w-96 h-96 bg-blue-500/30 rounded-full hidden md:block"></div>
                <div className="fixed top-1/2 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full hidden md:block"></div>
                <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full hidden md:block"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            <Link href="/">CineMatch</Link>
                        </h1>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-colors text-sm md:text-base"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                                <span>Home</span>
                            </Link>
                            <div className="flex bg-white/10 hover:bg-white/15 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-colors text-sm md:text-base">
                                <button
                                    onClick={() => setView('grid')}
                                    className={`flex items-center gap-2 ${view === 'grid' ? 'text-blue-400' : 'text-white'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <span className="mx-2 text-gray-500">|</span>
                                <button
                                    onClick={() => setView('list')}
                                    className={`flex items-center gap-2 ${view === 'list' ? 'text-blue-400' : 'text-white'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Page Title */}
                    <div className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 md:h-6 md:w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Your Watched Movies
                        </h2>
                        <p className="text-blue-300/70 text-sm md:text-base">Keep track of your movie watching history</p>
                    </div>

                    {isClient ? (
                        watchedMovies.length === 0 ? (
                            <div className="bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                <div className="mx-auto w-20 h-20 rounded-full bg-blue-600/10 flex items-center justify-center mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">No watched movies yet</h3>
                                <p className="text-blue-300 mb-6">Start marking movies as watched to build your collection</p>
                                <Link
                                    href="/"
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                                >
                                    Discover Movies
                                </Link>
                            </div>
                        ) : (
                            <>
                                {view === 'grid' ? (
                                    <div className="space-y-8">
                                        {(() => {
                                            const { grouped, sortedMonths } = groupMoviesByMonth(sortedWatchedMovies);

                                            return sortedMonths.map(monthYear => (
                                                <div key={monthYear} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                                    <div className="bg-white/5 px-6 py-3 border-b border-white/10">
                                                        <h3 className="text-lg font-semibold text-white">{monthYear}</h3>
                                                    </div>
                                                    <div className="p-4">
                                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-4">
                                                            {grouped[monthYear].map((movie) => (
                                                                <div
                                                                    key={movie.id}
                                                                    className="bg-gray-800/80 rounded-lg overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 hover:bg-gray-700/80 relative flex flex-col"
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

                                                                        {/* Date badge */}
                                                                        <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white rounded overflow-hidden">
                                                                            <div className="bg-blue-500/80 px-2 py-0.5 text-[10px] font-medium">
                                                                                {new Intl.DateTimeFormat('en-US', {
                                                                                    month: 'short',
                                                                                    timeZone: 'UTC'
                                                                                }).format(new Date(movie.watchedDate))}
                                                                            </div>
                                                                            <div className="px-2 py-0.5 text-xs font-bold">
                                                                                {new Intl.DateTimeFormat('en-US', {
                                                                                    day: 'numeric',
                                                                                    timeZone: 'UTC'
                                                                                }).format(new Date(movie.watchedDate))}
                                                                            </div>
                                                                        </div>

                                                                        {/* Remove button */}
                                                                        <button
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleRemoveFromWatched(movie.id);
                                                                            }}
                                                                            className="absolute top-2 right-2 bg-black/50 hover:bg-red-600 text-white p-1.5 rounded-full transition-colors"
                                                                        >
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                            </svg>
                                                                        </button>
                                                                    </div>

                                                                    <div className="p-4">
                                                                        <h3 className="text-sm font-semibold text-white mb-2 line-clamp-1">{movie.title}</h3>

                                                                        {/* Edit date button */}
                                                                        {editingDate === movie.id ? (
                                                                            <input
                                                                                type="date"
                                                                                value={tempDate}
                                                                                onChange={(e) => setTempDate(e.target.value)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                onKeyDown={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (e.key === 'Enter') {
                                                                                        handleDateUpdate(movie.id, tempDate);
                                                                                    }
                                                                                    if (e.key === 'Escape') {
                                                                                        setEditingDate(null);
                                                                                        setTempDate('');
                                                                                    }
                                                                                }}
                                                                                className="w-full bg-gray-700 text-white text-xs rounded px-2 py-1 cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                onBlur={() => {
                                                                                    if (tempDate) {
                                                                                        handleDateUpdate(movie.id, tempDate);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDateEditStart(movie.id, movie.watchedDate);
                                                                                }}
                                                                                className="text-xs text-blue-300 hover:text-blue-200 flex items-center gap-1"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                </svg>
                                                                                <span>Edit date</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ));
                                        })()}
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {(() => {
                                            const { grouped, sortedMonths } = groupMoviesByMonth(sortedWatchedMovies);

                                            return sortedMonths.map(monthYear => (
                                                <div key={monthYear} className="bg-white/5 rounded-xl overflow-hidden border border-white/10">
                                                    <div className="bg-white/5 px-6 py-3 border-b border-white/10">
                                                        <h3 className="text-lg font-semibold text-white">{monthYear}</h3>
                                                    </div>
                                                    <div className="divide-y divide-white/10">
                                                        {grouped[monthYear].map((movie) => (
                                                            <div
                                                                key={movie.id}
                                                                className="flex items-center hover:bg-white/5 transition-colors"
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
                                                                    <div className="mt-1 flex items-center gap-4">
                                                                        <div className="flex items-center gap-2">
                                                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                                            </svg>
                                                                            <span className="text-blue-300/70 text-sm">
                                                                                {new Intl.DateTimeFormat('en-US', {
                                                                                    day: 'numeric',
                                                                                    month: 'short',
                                                                                    timeZone: 'UTC'
                                                                                }).format(new Date(movie.watchedDate))}
                                                                            </span>
                                                                        </div>
                                                                        {editingDate === movie.id ? (
                                                                            <input
                                                                                type="date"
                                                                                value={tempDate}
                                                                                onChange={(e) => setTempDate(e.target.value)}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                onKeyDown={(e) => {
                                                                                    e.stopPropagation();
                                                                                    if (e.key === 'Enter') {
                                                                                        handleDateUpdate(movie.id, tempDate);
                                                                                    }
                                                                                    if (e.key === 'Escape') {
                                                                                        setEditingDate(null);
                                                                                        setTempDate('');
                                                                                    }
                                                                                }}
                                                                                className="bg-gray-700 text-white text-sm rounded px-2 py-1 cursor-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                                                onBlur={() => {
                                                                                    if (tempDate) {
                                                                                        handleDateUpdate(movie.id, tempDate);
                                                                                    }
                                                                                }}
                                                                            />
                                                                        ) : (
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleDateEditStart(movie.id, movie.watchedDate);
                                                                                }}
                                                                                className="text-sm text-blue-300 hover:text-blue-200 flex items-center gap-1"
                                                                            >
                                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                                                                </svg>
                                                                                <span>Edit date</span>
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleRemoveFromWatched(movie.id);
                                                                    }}
                                                                    className="p-4 text-gray-400 hover:text-red-500 transition-colors"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ));
                                        })()}
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
                                            className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm font-medium"
                                        >
                                            Clear Watched Movies
                                        </button>
                                    </div>
                                )}
                            </>
                        )
                    ) : (
                        <div className="animate-pulse bg-white/5 rounded-2xl p-8">
                            <div className="h-8 bg-white/10 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-white/10 rounded w-1/4"></div>
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