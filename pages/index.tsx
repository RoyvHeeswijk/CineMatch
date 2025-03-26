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

            <main className="min-h-screen bg-[#0A0F1C] text-white font-['Inter']">
                {/* Top Navigation Bar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0F1729]/80 backdrop-blur-lg border-b border-white/10">
                    <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                            CineMatch
                        </h1>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/watched"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#1E293D] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                                Watched
                            </Link>

                            <button
                                onClick={() => setShowWishlist(true)}
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1A2333] hover:bg-[#1E293D] transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-400" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                                Liked {wishlistCount > 0 && <span className="ml-1 px-2 py-0.5 bg-pink-500/20 text-pink-300 rounded-full text-xs">{wishlistCount}</span>}
                            </button>
                        </div>
                    </div>
                </nav>

                {/* Main Content */}
                <div className="pt-16">
                    {/* Hero Section with Search */}
                    <div className="relative bg-gradient-to-b from-[#0F1729] to-[#0A0F1C] border-b border-white/10">
                        <div className="max-w-[1600px] mx-auto px-6 py-16">
                            <div className="flex gap-12 items-center">
                                <div className="flex-1 max-w-2xl">
                                    <h2 className="text-5xl font-bold mb-6 leading-tight">
                                        Find Your Perfect
                                        <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                                            Movie Match
                                        </span>
                                    </h2>
                                    <p className="text-lg text-gray-400 mb-8">
                                        Tell us what you love, and we'll find the perfect movies for you using AI-powered recommendations.
                                    </p>
                                    <div className="bg-[#1A2333] rounded-2xl p-6 border border-white/10">
                                        <MovieForm setRecommendations={setRecommendations} setLoading={setIsLoading} />
                                    </div>
                                </div>
                                <div className="flex-1 hidden lg:block">
                                    <div className="relative h-[400px] w-full">
                                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl backdrop-blur-3xl"></div>
                                        <div className="absolute -top-8 -right-8 w-72 h-72 bg-blue-500/30 rounded-full filter blur-3xl"></div>
                                        <div className="absolute -bottom-8 -left-8 w-72 h-72 bg-purple-500/30 rounded-full filter blur-3xl"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content Sections */}
                    <div className="max-w-[1600px] mx-auto px-6 py-12 space-y-12">
                        {/* Recommendations Section */}
                        <section id="recommendations-section">
                            <div className="bg-[#1A2333] rounded-2xl overflow-hidden shadow-xl border border-white/10">
                                <div className="p-6">
                                    <RecommendationList
                                        recommendations={recommendations}
                                        isLoading={isLoading}
                                        onSelectMovie={setSelectedMovie}
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Trending Section */}
                        <section>
                            <div className="bg-[#1A2333] rounded-2xl overflow-hidden shadow-xl border border-white/10">
                                <div className="p-6">
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
                        </section>
                    </div>

                    {/* Footer */}
                    <footer className="bg-[#0F1729] border-t border-white/10">
                        <div className="max-w-[1600px] mx-auto px-6 py-8">
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-gray-400">
                                    © {new Date().getFullYear()} CineMatch
                                </p>
                                <p className="text-sm text-gray-400">
                                    Powered by TMDB & OpenAI
                                </p>
                            </div>
                        </div>
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