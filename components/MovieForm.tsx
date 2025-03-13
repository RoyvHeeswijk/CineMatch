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
      {/* Single Text Input for All Preferences */}
      <div className="group">
        <label className="block text-lg font-medium text-blue-200 mb-2">Tell Me What You're Looking For</label>
        <textarea
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Describe what you're looking for in a movie. For example: 'I want action movies with plot twists like Inception, preferably on Netflix, or sci-fi movies from the last 5 years with a rating above 7.'"
          className="w-full bg-white/5 border border-blue-300/20 rounded-lg px-4 py-3 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
          rows={6}
        />
        <p className="mt-2 text-xs text-blue-300/70">
          Include movies you like, genres, actors, directors, streaming services, release years, ratings, or any other preferences.
        </p>
      </div>

      <div className="pt-4">
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-medium py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-cyan-500/25"
        >
          Find My Movies
        </button>
      </div>
    </form>
  );
} 