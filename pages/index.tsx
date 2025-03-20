import { useState, useEffect } from 'react';
import MovieForm from '@/components/MovieForm';
import TrendingSection from '@/components/TrendingSection';
import RecommendationList from '@/components/RecommendationList';
import Head from 'next/head';
import { useWishlist } from '@/context/WishlistContext';
import Toast from '@/components/Toast';
import WishlistModal from '@/components/WishlistModal';
import WatchedMoviesModal from '@/components/WatchedMoviesModal';
import { useWatched } from '@/context/WatchedContext';
import Link from 'next/link';

export default function Home() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { wishlistCount, addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
    const { addToWatched, removeFromWatched, isWatched } = useWatched();
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info';
    }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [showWishlist, setShowWishlist] = useState(false);

    // State for movie details modal
    const [selectedMovie, setSelectedMovie] = useState<any | null>(null);
    const [movieDetails, setMovieDetails] = useState<any>(null);

    // Add state for watched movies modal
    const [showWatchedMovies, setShowWatchedMovies] = useState(false);

    useEffect(() => {
        // Fetch trending movies when the page loads
        fetchTrending();
    }, []);

    // Fetch movie details when a movie is selected
    useEffect(() => {
        if (selectedMovie?.tmdbId || selectedMovie?.id) {
            const movieId = selectedMovie.tmdbId || selectedMovie.id;

            fetch(`/api/movie/${movieId}`)
                .then(res => res.json())
                .then(data => {
                    setMovieDetails(data);
                })
                .catch(err => {
                    console.error('Error fetching movie details:', err);
                });
        } else {
            setMovieDetails(null);
        }
    }, [selectedMovie]);

    const fetchTrending = async () => {
        try {
            const response = await fetch('/api/trending');
            const data = await response.json();
            setTrendingMovies(data.movies);
        } catch (error) {
            console.error('Error fetching trending:', error);
        }
    };

    // Scroll to recommendations when they're loaded
    useEffect(() => {
        if (recommendations.length > 0) {
            // Wait a bit for the DOM to update
            setTimeout(() => {
                const recommendationsSection = document.getElementById('recommendations-section');
                if (recommendationsSection) {
                    recommendationsSection.scrollIntoView({ behavior: 'smooth' });
                }
            }, 300);
        }
    }, [recommendations]);

    const handleSubmit = async (input: string) => {
        setIsLoading(true);
        setRecommendations([]); // Clear previous recommendations

        try {
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userInput: input }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch recommendations');
            }

            const data = await response.json();

            if (data.recommendations && data.recommendations.length > 0) {
                // Remove duplicates based on movie ID
                const uniqueRecommendations = data.recommendations.filter((movie: any, index: number, self: any[]) =>
                    index === self.findIndex((m: any) => m.id === movie.id)
                );
                setRecommendations(uniqueRecommendations);
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions for movie data
    const getMoviePosterPath = (movie: any): string => {
        return movie.posterPath || movie.poster_path ?
            (movie.posterPath ? movie.posterPath : `https://image.tmdb.org/t/p/w500${movie.poster_path}`) :
            '';
    };

    const getMovieReleaseDate = (movie: any): string => {
        return movie.releaseDate || movie.release_date || '';
    };

    const getMovieOverview = (movie: any): string => {
        return movie.description || movie.overview || '';
    };

    const getMovieRating = (movie: any): number => {
        return movie.rating || movie.vote_average || 0;
    };

    const formatRuntime = (minutes: number) => {
        if (!minutes) return '';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    // Handle liking/unliking a movie
    const handleLikeToggle = (movie: any, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation(); // Prevent opening movie details when clicking like button
        }

        if (isInWishlist(movie.id)) {
            removeFromWishlist(movie.id);
            setToast({
                show: true,
                message: `${movie.title} removed from likes`,
                type: 'info'
            });
        } else {
            addToWishlist({
                id: movie.id,
                title: movie.title,
                posterPath: getMoviePosterPath(movie),
                releaseDate: getMovieReleaseDate(movie),
                description: getMovieOverview(movie),
                rating: getMovieRating(movie).toString(),
                source: movie.source || 'recommended'
            });
            setToast({
                show: true,
                message: `${movie.title} added to likes`,
                type: 'info'
            });
        }
    };

    // Add this handler function with your other handlers
    const handleWatchedToggle = (movie: any, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
        }

        const movieData = {
            id: movie.id,
            title: movie.title,
            posterPath: getMoviePosterPath(movie),
            watchedDate: new Date().toISOString()
        };

        if (isWatched(movie.id)) {
            removeFromWatched(movie.id);
            setToast({
                show: true,
                message: `${movie.title} removed from watched movies`,
                type: 'info'
            });
        } else {
            addToWatched(movieData);
            setToast({
                show: true,
                message: `${movie.title} added to watched movies`,
                type: 'success'
            });
        }
    };

    return (
        <>
            <Head>
                <title>CineMatch | Find Your Perfect Movie Match</title>
                <meta name="description" content="Get personalized movie recommendations based on your preferences" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white font-['Inter']">
                {/* Background elements - hide on mobile */}
                <div className="absolute inset-0 overflow-hidden hidden md:block">
                    <div className="stars-container"></div>
                </div>

                <div className="fixed top-1/4 -left-40 w-96 h-96 bg-blue-500/30 rounded-full hidden md:block"></div>
                <div className="fixed top-1/2 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full hidden md:block"></div>
                <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full hidden md:block"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    {/* Header with logo and wishlist */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            CineMatch
                        </h1>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/watched"
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-colors text-sm md:text-base"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                <span>Watched Movies</span>
                            </Link>
                            <button
                                onClick={() => setShowWishlist(true)}
                                className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-3 md:px-4 py-1.5 md:py-2 rounded-full transition-colors text-sm md:text-base"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 md:h-5 md:w-5 text-pink-500"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                    />
                                </svg>
                                <span>Liked Movies {wishlistCount > 0 && <span className="bg-pink-600 text-white text-xs px-1.5 rounded-full ml-1">{wishlistCount}</span>}</span>
                            </button>
                        </div>
                    </div>

                    {/* Main content - adjust layout for mobile */}
                    <div className="mt-4 md:mt-8">
                        <div className="flex flex-col lg:flex-row lg:gap-8">
                            <div className="w-full lg:w-1/3 mb-4 lg:mb-0">
                                <div className="bg-white/5 p-3 md:p-6 rounded-xl md:rounded-2xl shadow-xl border border-white/10">
                                    <h2 className="text-base md:text-xl font-bold mb-3 md:mb-6 text-white flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 mr-1.5 md:mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        Find Your Perfect Movie
                                    </h2>
                                    <MovieForm setRecommendations={setRecommendations} setLoading={setIsLoading} />
                                </div>
                            </div>

                            <div className="w-full lg:w-2/3 space-y-4 md:space-y-8">
                                {/* Recommendations Section */}
                                <div id="recommendations-section" className="scroll-mt-16">
                                    <div className="bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                        <div className="flex items-center mb-6">
                                            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg px-3 py-1 text-white text-sm font-semibold mr-3">
                                                RECOMMENDED
                                            </div>
                                            <h2 className="text-xl md:text-2xl font-bold text-white">
                                                {isLoading ? "Finding Recommendations..." : "Your Movie Recommendations"}
                                            </h2>
                                        </div>

                                        <RecommendationList
                                            recommendations={recommendations}
                                            isLoading={isLoading}
                                            onSelectMovie={setSelectedMovie}
                                        />
                                    </div>
                                </div>

                                {/* Trending Section with Clear Heading */}
                                <div className="bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                    <TrendingSection
                                        title="Top 10 Movies This Week"
                                        description="Most popular movies right now"
                                        items={trendingMovies.slice(0, 10)}
                                        type="movies"
                                        onSelectMovie={setSelectedMovie}
                                        onLikeToggle={handleLikeToggle}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <footer className="text-center text-blue-300/50 py-6">
                        <p>© {new Date().getFullYear()} CineMatch • Powered by TMDB & OpenAI</p>
                    </footer>
                </div>
            </main>

            {/* Styles */}
            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                    overflow-x: hidden;
                }
                
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                
                /* Stars animation */
                .stars-container {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    background-image: 
                        radial-gradient(2px 2px at 20px 30px, #ffffff15, transparent),
                        radial-gradient(2px 2px at 40px 70px, #ffffff10, transparent),
                        radial-gradient(2px 2px at 50px 160px, #ffffff15, transparent),
                        radial-gradient(2px 2px at 90px 40px, #ffffff10, transparent),
                        radial-gradient(2px 2px at 130px 80px, #ffffff15, transparent),
                        radial-gradient(2px 2px at 160px 120px, #ffffff10, transparent);
                    background-repeat: repeat;
                    background-size: 200px 200px;
                    opacity: 0.5;
                    animation: stars-move 100s linear infinite;
                }
                
                @keyframes stars-move {
                    0% {
                        background-position: 0 0;
                    }
                    100% {
                        background-position: 400px 400px;
                    }
                }
                
                /* Add fade-in animation for recommendations */
                .fade-in {
                    animation: fadeIn 0.5s ease-out forwards;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Add these animations to your global styles */
                @keyframes slideIn {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                @keyframes pulseHighlight {
                    0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.7); }
                    70% { box-shadow: 0 0 0 10px rgba(236, 72, 153, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
                }

                .animate-slideIn {
                    animation: slideIn 0.3s ease-out forwards;
                }

                .highlight-wishlist {
                    animation: pulseHighlight 1.5s cubic-bezier(0.4, 0, 0.6, 1) 1;
                }
            `}</style>

            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(prev => ({ ...prev, show: false }))}
                />
            )}

            {showWishlist && (
                <WishlistModal
                    isOpen={showWishlist}
                    onClose={() => setShowWishlist(false)}
                />
            )}

            {showWatchedMovies && (
                <WatchedMoviesModal
                    isOpen={showWatchedMovies}
                    onClose={() => setShowWatchedMovies(false)}
                />
            )}

            {/* Full-screen movie details modal */}
            {selectedMovie && (
                <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center" onClick={() => setSelectedMovie(null)}>
                    <div
                        className="bg-gradient-to-b from-gray-900/95 to-blue-900/95 rounded-xl overflow-hidden shadow-2xl max-w-5xl w-full mx-4 md:mx-8 animate-scaleIn"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <button
                            className="absolute top-4 right-4 text-white/80 hover:text-white z-20 bg-black/30 rounded-full p-2"
                            onClick={() => setSelectedMovie(null)}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="flex flex-col md:flex-row">
                            {/* Movie poster */}
                            <div className="w-full md:w-1/3 relative h-80 md:h-auto">
                                {getMoviePosterPath(selectedMovie) ? (
                                    <img
                                        src={getMoviePosterPath(selectedMovie)}
                                        alt={selectedMovie.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center bg-blue-900/50">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-blue-300/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                        </svg>
                                    </div>
                                )}
                            </div>

                            {/* Content */}
                            <div className="p-6 md:p-8 flex-1">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-3xl font-bold text-white mb-2">{selectedMovie.title}</h2>
                                    {getMovieRating(selectedMovie) > 0 && (
                                        <div className="flex items-center">
                                            <span className="text-yellow-400 mr-1">★</span>
                                            <span className="text-white font-medium">{getMovieRating(selectedMovie)}</span>
                                            <span className="text-blue-300 text-xs ml-1">/10</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center text-blue-300 text-sm space-x-3 mt-1 mb-6">
                                    <span>{new Date(getMovieReleaseDate(selectedMovie)).getFullYear()}</span>
                                    {movieDetails?.runtime && (
                                        <>
                                            <span>•</span>
                                            <span>{formatRuntime(movieDetails.runtime)}</span>
                                        </>
                                    )}
                                    {movieDetails?.genres && (
                                        <>
                                            <span>•</span>
                                            <span>{movieDetails.genres.map((g: any) => g.name).join(', ')}</span>
                                        </>
                                    )}
                                </div>

                                {/* Genre tags */}
                                {movieDetails?.genres && (
                                    <div className="flex flex-wrap gap-2 mb-6">
                                        {movieDetails.genres.map((genre: any) => (
                                            <span key={genre.id} className="bg-blue-800/40 text-blue-100 px-3 py-1 rounded-full text-xs">
                                                {genre.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Overview */}
                                <div className="mb-6">
                                    <h4 className="text-blue-200 font-medium mb-2">Overview</h4>
                                    <p className="text-blue-100 leading-relaxed">
                                        {getMovieOverview(selectedMovie) || movieDetails?.overview || 'No description available.'}
                                    </p>
                                </div>

                                {/* Cast and crew */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                    {/* Director */}
                                    {movieDetails?.credits?.crew?.find((c: any) => c.job === 'Director')?.name && (
                                        <div>
                                            <h4 className="text-blue-200 font-medium mb-2">Director</h4>
                                            <p className="text-white">
                                                {movieDetails.credits.crew.find((c: any) => c.job === 'Director').name}
                                            </p>
                                        </div>
                                    )}

                                    {/* Cast */}
                                    {movieDetails?.credits?.cast?.length > 0 && (
                                        <div>
                                            <h4 className="text-blue-200 font-medium mb-2">Cast</h4>
                                            <p className="text-white">
                                                {movieDetails.credits.cast.slice(0, 5).map((c: any) => c.name).join(', ')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Watch providers if available */}
                                {movieDetails?.['watch/providers']?.results?.US?.flatrate && (
                                    <div className="mb-6">
                                        <h4 className="text-blue-200 font-medium mb-2">Available on</h4>
                                        <div className="flex space-x-2">
                                            {movieDetails['watch/providers'].results.US.flatrate.slice(0, 5).map((provider: any) => (
                                                <div key={provider.provider_id} className="flex items-center bg-gray-800/50 px-3 py-1 rounded-full">
                                                    {provider.logo_path && (
                                                        <img
                                                            src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                                                            alt={provider.provider_name}
                                                            className="w-4 h-4 mr-1.5 rounded-full"
                                                        />
                                                    )}
                                                    <span className="text-xs">{provider.provider_name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Like and Watched buttons */}
                                <div className="mt-6 flex gap-3">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleLikeToggle(selectedMovie);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isInWishlist(selectedMovie.id)
                                            ? 'bg-pink-600 hover:bg-pink-700 text-white'
                                            : 'bg-white/10 hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                        </svg>
                                        {isInWishlist(selectedMovie.id) ? 'Unlike' : 'Like This Movie'}
                                    </button>

                                    {/* Watched indicator */}
                                    {isWatched(selectedMovie.id) ? (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600/20 text-green-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Watched
                                        </div>
                                    ) : (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleWatchedToggle(selectedMovie);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            Mark as Watched
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}