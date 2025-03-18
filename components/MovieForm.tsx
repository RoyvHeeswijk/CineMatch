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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userInput.trim()) {
      alert('Please enter your movie preferences');
      return;
    }

    setLoading(true);

    // Show immediate loading indicators
    setPartialRecommendations([
      { id: 'loading-1', title: 'Loading...', description: '', posterPath: null, releaseDate: '', runtime: 0, rating: '', genres: '', director: '', comparison: '', cast: '', isLoading: true } as Movie,
      { id: 'loading-2', title: 'Loading...', description: '', posterPath: null, releaseDate: '', runtime: 0, rating: '', genres: '', director: '', comparison: '', cast: '', isLoading: true } as Movie,
      { id: 'loading-3', title: 'Loading...', description: '', posterPath: null, releaseDate: '', runtime: 0, rating: '', genres: '', director: '', comparison: '', cast: '', isLoading: true } as Movie
    ]);

    // Scroll to recommendations immediately
    setTimeout(() => {
      const recommendationsSection = document.getElementById('recommendations-section');
      if (recommendationsSection) {
        recommendationsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);

    try {
      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput: userInput
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get recommendations');
      }

      const data = await response.json();

      if (!data.recommendations || data.recommendations.length === 0) {
        throw new Error('No recommendations found');
      }

      setRecommendations(data.recommendations);

      // Ensure recommendations are visible with a better delay
      setTimeout(() => {
        const recommendationsSection = document.getElementById('recommendations-section');
        if (recommendationsSection) {
          recommendationsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });

          // Add highlight animation
          recommendationsSection.classList.add('highlight-section');
          setTimeout(() => {
            recommendationsSection.classList.remove('highlight-section');
          }, 2000);
        }
      }, 500); // Slightly longer delay for better reliability
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      alert('Sorry, we had trouble finding recommendations. Please try again.');
    } finally {
      setLoading(false);
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
          {userInput.trim() ? 'Finding Movies...' : 'Find My Movies'}
        </button>
      </div>
    </form>
  );
} 