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
                <title>CineMatch | Find Your Next Favorite Movie</title>
                <meta name="description" content="Discover movies tailored to your taste" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white font-['Inter']">
                {/* Hero Section with 3D particles effect */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="stars-container"></div>
                </div>

                {/* Blurry blue orbs for decorative background */}
                <div className="fixed top-1/4 -left-40 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"></div>
                <div className="fixed top-1/2 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>
                <div className="fixed bottom-1/4 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-3xl"></div>

                {/* Wishlist Button - Now floating with glass effect */}
                <div className="fixed top-6 right-6 z-50">
                    <div className="backdrop-blur-md bg-white/10 p-1 rounded-full border border-white/20 shadow-lg">
                        <WishlistButton count={wishlistCount} />
                    </div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                    {/* Header Section */}
                    <div className="text-center mb-24">
                        <div className="mb-4 flex justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12 text-blue-400">
                                <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                            </svg>
                        </div>
                        <h1 className="text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-300">
                            CineMatch
                        </h1>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Discover your perfect movie match with personalized recommendations
                        </p>
                    </div>

                    {/* Search Section - Now with glass morphism */}
                    <div className="mb-32 max-w-3xl mx-auto backdrop-blur-xl bg-white/5 p-8 rounded-2xl shadow-xl border border-white/10">
                        <h2 className="text-2xl font-semibold mb-8 text-center bg-gradient-to-r from-blue-300 to-cyan-200 bg-clip-text text-transparent">Find Your Perfect Match</h2>
                        <MovieForm setRecommendations={setRecommendations} setLoading={setLoading} />

                        {loading && (
                            <div className="text-center mt-12">
                                <div className="animate-spin h-12 w-12 border-4 border-cyan-400 rounded-full border-t-transparent mx-auto opacity-75" />
                                <p className="mt-6 text-blue-200 font-light">Finding your perfect movie matches...</p>
                            </div>
                        )}
                    </div>

                    {/* Content wrapper with subtle gradient background */}
                    <div className="rounded-3xl bg-gradient-to-b from-blue-900/50 to-slate-900/50 backdrop-blur-sm border border-white/5 overflow-hidden shadow-2xl">
                        {/* Recommendations Section */}
                        {recommendations.length > 0 && (
                            <div className="p-8 border-b border-white/10">
                                <RecommendationList 
                                    recommendations={recommendations} 
                                    title="Your Personalized Recommendations"
                                    description="Curated movies based on your preferences"
                                />
                            </div>
                        )}

                        {/* Trending Movies Section */}
                        <div className="p-8">
                            <TrendingSection
                                title="Trending This Week"
                                description="The movies everyone's talking about right now"
                                items={trendingMovies}
                                type="movies"
                            />
                        </div>
                    </div>

                    {/* Footer with glass effect */}
                    <footer className="relative z-10 text-center py-12 mt-24 backdrop-blur-md bg-white/5 rounded-xl border border-white/10">
                        <div className="max-w-7xl mx-auto px-4">
                            <div className="mb-6">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-blue-400 mx-auto">
                                    <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
                                </svg>
                            </div>
                            <p className="text-blue-200 text-sm">© {new Date().getFullYear()} CineMatch. All rights reserved.</p>
                            <div className="mt-6 flex justify-center space-x-8">
                                <a href="#" className="text-blue-300 hover:text-cyan-300 transition-colors text-sm">About</a>
                                <a href="#" className="text-blue-300 hover:text-cyan-300 transition-colors text-sm">Privacy</a>
                                <a href="#" className="text-blue-300 hover:text-cyan-300 transition-colors text-sm">Terms</a>
                                <a href="#" className="text-blue-300 hover:text-cyan-300 transition-colors text-sm">Contact</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </main>

            {/* Add custom animation styles */}
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
            `}</style>
        </WishlistProvider>
    );
}