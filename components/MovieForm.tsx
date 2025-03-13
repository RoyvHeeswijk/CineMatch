'use client';

import { useState } from 'react';

interface MovieFormProps {
  setRecommendations: (recommendations: any[]) => void;
  setLoading: (loading: boolean) => void;
}

export default function MovieForm({ setRecommendations, setLoading }: MovieFormProps) {
  const [moviePreferences, setMoviePreferences] = useState('');

  // Simple function to generate a random ID
  const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ preferences: moviePreferences }),
      });

      const data = await response.json();

      // Format recommendations to match TrendingSection expectations
      const formattedRecommendations = data.recommendations.map((movie: any) => ({
        id: movie.id || generateId(), // Use our custom ID generator
        title: movie.title,
        posterPath: movie.posterPath,
        releaseDate: movie.releaseDate,
        overview: movie.description,
        rating: movie.rating,
        runtime: movie.runtime,
        genres: movie.genres,
        director: movie.director,
        comparison: movie.comparison,
        cast: movie.cast
      }));

      setRecommendations(formattedRecommendations);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">
          Tell us about movies you like:
        </label>
        <textarea
          className="w-full p-3 rounded-lg bg-gray-800 text-white"
          rows={4}
          value={moviePreferences}
          onChange={(e) => setMoviePreferences(e.target.value)}
          placeholder="E.g., I like action movies with strong character development, similar to The Dark Knight and Inception..."
          required
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
      >
        Get Recommendations
      </button>
    </form>
  );
} 