'use client';

import { useState } from 'react';
import { Movie } from '@/types/movie';
import { Logger } from '@/types/logger';

interface Props {
  setRecommendations: (data: any) => void;
  setLoading: (isLoading: boolean) => void;
}

interface StreamingService {
  name: string;
  label: string;
  color: string;
}

// Update the logger utility in MovieForm.tsx
const logger: Logger = {
  log: (message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log('\x1b[36m%s\x1b[0m', `[${timestamp}] MovieForm: ${message}`);
    if (data) {
      console.log('\x1b[33m%s\x1b[0m', 'Data:', JSON.stringify(data, null, 2));
    }
  },
  error: (message: string, error: any) => {
    const timestamp = new Date().toISOString();
    console.error('\x1b[31m%s\x1b[0m', `[${timestamp}] MovieForm ERROR: ${message}`);
    console.error('\x1b[31m%s\x1b[0m', 'Error details:', error);
  },
  success: (message: string) => {
    const timestamp = new Date().toISOString();
    console.log('\x1b[32m%s\x1b[0m', `[${timestamp}] MovieForm SUCCESS: ${message}`);
  },
  warn: (message: string) => {
    const timestamp = new Date().toISOString();
    console.warn('\x1b[33m%s\x1b[0m', `[${timestamp}] MovieForm WARNING: ${message}`);
  }
};

export default function MovieForm({ setRecommendations, setLoading }: Props) {
  const [userInput, setUserInput] = useState('');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'error' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });

  const streamingServices: StreamingService[] = [
    { name: 'netflix', label: 'Netflix', color: 'bg-red-600' },
    { name: 'disney', label: 'Disney+', color: 'bg-blue-600' },
    { name: 'hulu', label: 'Hulu', color: 'bg-green-600' },
    { name: 'amazon', label: 'Prime', color: 'bg-blue-500' },
    { name: 'hbo', label: 'HBO Max', color: 'bg-purple-600' },
    { name: 'apple', label: 'Apple TV+', color: 'bg-gray-600' }
  ];

  // Add logging to service selection
  const handleServiceSelect = (serviceName: string) => {
    logger.log(`Streaming service selected`, { service: serviceName });
    setSelectedService(serviceName === selectedService ? null : serviceName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    logger.log('Submitting form', {
      userInput,
      selectedService
    });

    try {
      setLoading(true);
      setRecommendations([]); // Clear previous recommendations
      setError(null);

      logger.log('Sending request to API', {
        userInput,
        selectedService
      });

      const response = await fetch('/api/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInput,
          streamingService: selectedService,
        }),
      });

      const data = await response.json();
      logger.log('Received response from API', {
        recommendationsCount: data.recommendations?.length,
        message: data.message
      });

      if (data.recommendations) {
        if (data.recommendations.length > 0) {
          logger.success(`Found ${data.recommendations.length} recommendations`);
          setRecommendations(data.recommendations);
        } else {
          logger.warn('No recommendations found');
        }

        if (data.message) {
          setToast({
            show: true,
            message: data.message,
            type: data.recommendations.length === 12 ? 'info' : 'error'
          });
        }
      } else {
        logger.warn('No recommendations data in response');
      }

    } catch (err) {
      logger.error('Error fetching recommendations:', err);
      setError('Failed to get movie recommendations. Please try again.');
      setRecommendations([]);
    } finally {
      setLoading(false);
      logger.log('Request completed');
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

      {/* Streaming Services Selection */}
      <div className="flex flex-wrap gap-2">
        {streamingServices.map((service) => (
          <button
            key={service.name}
            type="button"
            onClick={() => handleServiceSelect(service.name)}
            className={`px-3 py-1.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 flex items-center gap-1.5
              ${service.name === selectedService
                ? `${service.color} text-white ring-2 ring-white/50`
                : 'bg-white/5 hover:bg-white/10 text-white/90'}`}
          >
            {service.label}
            {service.name === selectedService && (
              <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
            )}
          </button>
        ))}
      </div>

      <div className="pt-2 md:pt-4">
        <button
          type="submit"
          className={`w-full font-medium py-2.5 md:py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg
            ${!userInput.trim()
              ? 'bg-blue-500/50 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 hover:shadow-cyan-500/25'}`}
          disabled={!userInput.trim()}
        >
          {selectedService
            ? `Find Movies on ${streamingServices.find(s => s.name === selectedService)?.label}`
            : 'Find My Movies'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mt-2 text-center">
          {error}
        </div>
      )}

      {/* Selected Service Indicator */}
      {selectedService && (
        <div className="text-center text-sm text-blue-300">
          Searching for movies on {streamingServices.find(s => s.name === selectedService)?.label}
        </div>
      )}
    </form>
  );
} 