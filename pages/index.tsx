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
            </Head>

            <main className="min-h-screen bg-black text-white">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    {/* Search Section */}
                    <div className="mb-16">
                        <h1 className="text-4xl font-bold mb-8">Movie Recommender</h1>
                        <div className="max-w-2xl">
                            <MovieForm setRecommendations={setRecommendations as React.Dispatch<React.SetStateAction<any[]>>} setLoading={setLoading} />
                        </div>

                        {loading && (
                            <div className="text-center mt-8">
                                <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent mx-auto" />
                            </div>
                        )}
                    </div>

                    {/* Recommendations Section */}
                    {recommendations.length > 0 && (
                        <TrendingSection
                            title="Your Recommended Movies"
                            description="Based on your preferences, here are some movies you might enjoy."
                            items={recommendations}
                            type="movies"
                        />
                    )}

                    {/* Trending Movies Section */}
                    <TrendingSection
                        title="Top 10 movies this week"
                        description="Check out this week's most popular movies and find out where to watch them."
                        items={trendingMovies}
                        type="movies"
                    />
                </div>
            </main>
        </>
    );
} 