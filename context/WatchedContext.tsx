import React, { createContext, useContext, useState, useEffect } from 'react';

interface WatchedMovie {
    id: string;
    title: string;
    posterPath: string;
    watchedDate: string;
}

interface WatchedContextType {
    watchedMovies: WatchedMovie[];
    addToWatched: (movie: WatchedMovie) => void;
    removeFromWatched: (movieId: string) => void;
    updateWatchedDate: (movieId: string, newDate: string) => void;
    isWatched: (movieId: string) => boolean;
    clearWatched: () => void;
    watchedCount: number;
}

const WatchedContext = createContext<WatchedContextType | undefined>(undefined);

export const WatchedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [watchedMovies, setWatchedMovies] = useState<WatchedMovie[]>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('watchedMovies');
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });

    useEffect(() => {
        localStorage.setItem('watchedMovies', JSON.stringify(watchedMovies));
    }, [watchedMovies]);

    const addToWatched = (movie: WatchedMovie) => {
        setWatchedMovies(prev => {
            if (!prev.some(m => m.id === movie.id)) {
                return [...prev, { ...movie, watchedDate: movie.watchedDate || new Date().toISOString() }];
            }
            return prev;
        });
    };

    const removeFromWatched = (movieId: string) => {
        setWatchedMovies(prev => prev.filter(movie => movie.id !== movieId));
    };

    const updateWatchedDate = (movieId: string, newDate: string) => {
        setWatchedMovies(prev => prev.map(movie =>
            movie.id === movieId ? { ...movie, watchedDate: new Date(newDate).toISOString() } : movie
        ));
    };

    const isWatched = (movieId: string) => {
        return watchedMovies.some(movie => movie.id === movieId);
    };

    const clearWatched = () => {
        setWatchedMovies([]);
    };

    return (
        <WatchedContext.Provider value={{
            watchedMovies,
            addToWatched,
            removeFromWatched,
            updateWatchedDate,
            isWatched,
            clearWatched,
            watchedCount: watchedMovies.length
        }}>
            {children}
        </WatchedContext.Provider>
    );
};

export const useWatched = () => {
    const context = useContext(WatchedContext);
    if (context === undefined) {
        throw new Error('useWatched must be used within a WatchedProvider');
    }
    return context;
}; 