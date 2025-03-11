import { useState, useEffect } from 'react';
import MovieForm from '@/components/MovieForm';
import TrendingSection from '@/components/TrendingSection';
import RecommendationList from '@/components/RecommendationList';
import Head from 'next/head';

export default function Home() {
    const [recommendations, setRecommendations] = useState([]);
    const [trendingMovies, setTrendingMovies] = useState([]);
    const [loading, setLoading] = useState(false);

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
        <>
            <Head>
                <title>Movie Recommender</title>
                <meta name="description" content="Find your next favorite movie" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white font-['Poppins']">
                {/* Background elements */}
                <div className="fixed inset-0 z-0">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-purple-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                    <div className="absolute top-40 right-10 w-72 h-72 bg-blue-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                    <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-indigo-700 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
                </div>

                {/* Content */}
                <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
                    {/* Header Section */}
                    <div className="text-center mb-16">
                        <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Movie Recommender</h1>
                        <p className="text-xl text-gray-300 max-w-2xl mx-auto">Discover your next favorite film based on your preferences</p>
                    </div>

                    {/* Search Section */}
                    <div className="mb-20 max-w-2xl mx-auto backdrop-blur-lg bg-black/30 p-8 rounded-xl shadow-2xl border border-gray-800">
                        <h2 className="text-2xl font-semibold mb-6">Find Movies For You</h2>
                        <MovieForm setRecommendations={setRecommendations as React.Dispatch<React.SetStateAction<any[]>>} setLoading={setLoading} />

                        {loading && (
                            <div className="text-center mt-8">
                                <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent mx-auto" />
                                <p className="mt-4 text-gray-400">Finding perfect matches for you...</p>
                            </div>
                        )}
                    </div>

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <div className="mb-20 backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-gray-800">
                            <TrendingSection
                                title="Your Recommended Movies"
                                description="Based on your preferences, here are some movies you might enjoy."
                                items={recommendations}
                                type="movies"
                            />
                        </div>
                    )}

                    {/* Trending Movies Section */}
                    <div className="backdrop-blur-sm bg-black/20 p-6 rounded-xl border border-gray-800">
                        <TrendingSection
                            title="Top 10 movies this week"
                            description="Check out this week's most popular movies and find out where to watch them."
                            items={trendingMovies}
                            type="movies"
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="relative z-10 text-center py-8 text-gray-400 text-sm">
                    <p>© {new Date().getFullYear()} Movie Recommender. Find your perfect movie match.</p>
                </footer>
            </main>

            {/* Add CSS for animations */}
            <style jsx global>{`
                @keyframes blob {
                    0% { transform: scale(1); }
                    33% { transform: scale(1.1); }
                    66% { transform: scale(0.9); }
                    100% { transform: scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
} 