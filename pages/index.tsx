import { useState, useEffect } from 'react';
import MovieForm from '@/components/MovieForm';
import TrendingSection from '@/components/TrendingSection';
import RecommendationList from '@/components/RecommendationList';
import Head from 'next/head';
import { useWishlist } from '@/context/WishlistContext';
import { WishlistProvider } from '@/context/WishlistContext';
import Toast from '@/components/Toast';
import WishlistModal from '@/components/WishlistModal';

export default function Home() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const { wishlistCount } = useWishlist();
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

    useEffect(() => {
        // Fetch trending movies when the page loads
        fetchTrending();
    }, []);

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
                setRecommendations(data.recommendations);
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <WishlistProvider>
            <Head>
                <title>CineMatch | Find Your Perfect Movie Match</title>
                <meta name="description" content="Get personalized movie recommendations based on your preferences" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white font-['Inter']">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="stars-container"></div>
                </div>

                <div className="fixed top-1/4 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
                <div className="fixed top-1/2 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
                    {/* Header with logo and wishlist */}
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            CineMatch
                        </h1>
                        <button
                            onClick={() => setShowWishlist(true)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/15 px-4 py-2 rounded-full transition-colors"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-pink-500"
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

                    {/* Main content */}
                    <div className="mt-8">
                        <div className="lg:flex lg:gap-8">
                            <div className="lg:w-1/3 mb-8 lg:mb-0">
                                <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                    <h2 className="text-xl font-bold mb-6 text-white flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        Find Your Perfect Movie
                                    </h2>
                                    <MovieForm setRecommendations={setRecommendations} setLoading={setIsLoading} />
                                </div>
                            </div>

                            <div className="lg:w-2/3 space-y-8">
                                {/* Recommendations Section with Clear Heading */}
                                <div id="recommendations-section" className="scroll-mt-16">
                                    {recommendations.length > 0 ? (
                                        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                            <div className="flex items-center mb-6">
                                                <div className="bg-gradient-to-r from-blue-500 to-cyan-400 rounded-lg px-3 py-1 text-white text-sm font-semibold mr-3">
                                                    RECOMMENDED
                                                </div>
                                                <h2 className="text-xl md:text-2xl font-bold text-white">Your Personalized Recommendations</h2>
                                            </div>
                                            <RecommendationList recommendations={recommendations} isLoading={isLoading} />
                                        </div>
                                    ) : !isLoading && (
                                        <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                            <div className="text-center py-10">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-blue-400 mb-4 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                </svg>
                                                <h3 className="text-xl font-medium text-blue-200 mb-2">Discover Your Perfect Movie Match</h3>
                                                <p className="text-blue-300/70 max-w-md mx-auto">
                                                    Tell us what you like, and we'll recommend movies tailored just for you.
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Trending Section with Clear Heading */}
                                <div className="backdrop-blur-xl bg-white/5 p-6 rounded-2xl shadow-xl border border-white/10">
                                    <TrendingSection
                                        title="Top 10 Movies This Week"
                                        description="Most popular movies right now"
                                        items={trendingMovies.slice(0, 10)}
                                        type="movies"
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
        </WishlistProvider>
    );
}