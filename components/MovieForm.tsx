'use client';

import { useState } from 'react';
import { Movie } from '@/types/movie';

interface Props {
  setRecommendations: (data: any) => void;
  setLoading: (isLoading: boolean) => void;
}

export default function MovieForm({ setRecommendations, setLoading }: Props) {
  const [userInput, setUserInput] = useState('');
  const [partialRecommendations, setPartialRecommendations] = useState<Movie[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    try {
      // Set both loading states to true
      setLoading(true);
      setRecommendations([]); // Clear previous recommendations

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userInput: userInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get recommendations');
      }

      if (data.recommendations && data.recommendations.length > 0) {
        const uniqueRecommendations = data.recommendations.filter((movie: any, index: number, self: any[]) =>
          index === self.findIndex((m: any) => m.id === movie.id)
        );
        setRecommendations(uniqueRecommendations);
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('Failed to get movie recommendations. Please try again.');
      setRecommendations([]); // Clear recommendations on error
    } finally {
      setLoading(false); // Make sure to set loading to false when done
      setUserInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Tell me what kind of movies you like..."
          className="w-full bg-white/5 border border-white/10 rounded-lg p-3 md:p-4 text-sm md:text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent resize-none h-[80px] md:h-[120px]"
        />
      </div>

      <div className="pt-2 md:pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-medium py-2.5 md:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/25"
          disabled={!userInput.trim()}
        >
          {!userInput.trim() ? 'Find My Movies' : 'Finding Movies...'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mt-2 text-center">
          {error}
        </div>
      )}
    </form>
  );
} 