import { useState, useEffect } from 'react';
import MovieForm from '@/components/MovieForm';
import TrendingSection from '@/components/TrendingSection';
import RecommendationList from '@/components/RecommendationList';
import Head from 'next/head';
import WishlistButton from '@/components/WishlistButton';
import { useWishlist } from '@/context/WishlistContext';
import { WishlistProvider } from '@/context/WishlistContext';

export default function Home() {
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const { wishlistCount } = useWishlist();

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

    return (
        <WishlistProvider>
            <Head>
                <title>Movie Recommender</title>
                <meta name="description" content="Find your next favorite movie" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white font-['Montserrat']">
                {/* Background overlay */}
                <div className="absolute inset-0 bg-[url('/images/cinema-pattern.png')] opacity-5 z-0"></div>

                {/* Wishlist Button */}
                <div className="fixed top-6 right-6 z-50">
                    <WishlistButton count={wishlistCount} />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            Movie Recommender
                        </h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                            Discover your next favorite film based on your preferences
                        </p>
                    </div>

                    {/* Search Section */}
                    <div className="mb-20 max-w-2xl mx-auto backdrop-blur-sm bg-black/30 p-8 rounded-xl shadow-2xl border border-gray-800">
                        <h2 className="text-2xl font-semibold mb-6">Find Movies For You</h2>
                        <MovieForm setRecommendations={setRecommendations} setLoading={setLoading} />

                        {loading && (
                            <div className="text-center mt-8">
                                <div className="animate-spin h-10 w-10 border-4 border-purple-500 rounded-full border-t-transparent mx-auto" />
                                <p className="mt-4 text-gray-400">Finding perfect matches for you...</p>
                            </div>
                        )}
                    </div>

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <div className="mb-20 backdrop-blur-sm bg-black/30 p-8 rounded-xl border border-gray-800 shadow-xl">
                            <RecommendationList 
                                recommendations={recommendations} 
                                title="Your Recommended Movies"
                                description="Based on your preferences, here are some movies you might enjoy."
                            />
                        </div>
                    )}

                    {/* Trending Movies Section */}
                    <div className="backdrop-blur-sm bg-black/30 p-8 rounded-xl border border-gray-800 shadow-xl">
                        <TrendingSection
                            title="Top 10 movies this week"
                            description="Check out this week's most popular movies and find out where to watch them."
                            items={trendingMovies}
                            type="movies"
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 text-center py-10 text-gray-400 text-sm border-t border-gray-800 mt-20">
                    <div className="max-w-7xl mx-auto px-4">
                        <p>© {new Date().getFullYear()} Movie Recommender. Find your perfect movie match.</p>
                        <div className="mt-4 flex justify-center space-x-6">
                            <a href="#" className="hover:text-white transition-colors">About</a>
                            <a href="#" className="hover:text-white transition-colors">Privacy</a>
                            <a href="#" className="hover:text-white transition-colors">Terms</a>
                            <a href="#" className="hover:text-white transition-colors">Contact</a>
                        </div>
                    </div>
                </footer>
            </main>

            <style jsx global>{`
                body {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.5;
                    }
                }
                .animate-pulse {
                    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
            `}</style>
        </WishlistProvider>
    );
}