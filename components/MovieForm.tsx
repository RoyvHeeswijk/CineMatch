'use client';

import { useState, useEffect } from 'react';

interface Props {
    setRecommendations: (data: any) => void;
    setLoading: (isLoading: boolean) => void;
}

// Available genres for the multi-select
const GENRES = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 
    'Drama', 'Family', 'Fantasy', 'History', 'Horror', 'Music', 
    'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'
];

export default function MovieForm({ setRecommendations, setLoading }: Props) {
    const currentYear = new Date().getFullYear();
    
    const [formData, setFormData] = useState({
        likedMovies: [''],
        selectedGenres: [] as string[],
        minRating: '7',
        minYear: '1990',
        maxYear: currentYear.toString(),
        additionalPreferences: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Filter out any empty liked movies
        const filteredLikedMovies = formData.likedMovies.filter(movie => movie.trim() !== '');
        
        if (filteredLikedMovies.length === 0) {
            alert('Please enter at least one movie you like');
            return;
        }
        
        setLoading(true);
        
        try {
            const response = await fetch('/api/recommendations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    likedMovies: filteredLikedMovies
                }),
            });

            const data = await response.json();
            
            const enhancedRecommendations = data.recommendations?.map((movie: any) => ({
                ...movie,
                userPreferences: {
                    likedMovies: filteredLikedMovies,
                    requestedGenres: formData.selectedGenres,
                    minRating: formData.minRating,
                    yearRange: {
                        min: formData.minYear,
                        max: formData.maxYear
                    },
                    additionalPreferences: formData.additionalPreferences || undefined
                }
            })) || [];
            
            setRecommendations(enhancedRecommendations);
        } catch (error) {
            console.error('Error fetching recommendations:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    const handleLikedMovieChange = (index: number, value: string) => {
        const updatedLikedMovies = [...formData.likedMovies];
        updatedLikedMovies[index] = value;
        setFormData(prev => ({ ...prev, likedMovies: updatedLikedMovies }));
    };
    
    const addLikedMovie = () => {
        setFormData(prev => ({ 
            ...prev, 
            likedMovies: [...prev.likedMovies, ''] 
        }));
    };
    
    const removeLikedMovie = (index: number) => {
        if (formData.likedMovies.length <= 1) return; // Keep at least one input
        
        const updatedLikedMovies = formData.likedMovies.filter((_, i) => i !== index);
        setFormData(prev => ({ 
            ...prev, 
            likedMovies: updatedLikedMovies 
        }));
    };
    
    const toggleGenre = (genre: string) => {
        setFormData(prev => {
            const selectedGenres = [...prev.selectedGenres];
            
            if (selectedGenres.includes(genre)) {
                return { 
                    ...prev, 
                    selectedGenres: selectedGenres.filter(g => g !== genre) 
                };
            } else {
                return { 
                    ...prev, 
                    selectedGenres: [...selectedGenres, genre] 
                };
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                {/* Movies You Like */}
                <div className="group">
                    <label className="block text-sm font-medium text-blue-200 mb-2">Movies You Like</label>
                    <div className="space-y-3">
                        {formData.likedMovies.map((movie, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={movie}
                                    onChange={(e) => handleLikedMovieChange(index, e.target.value)}
                                    placeholder={`e.g. ${index === 0 ? 'The Dark Knight' : 'Inception'}`}
                                    className="flex-1 bg-white/5 border border-blue-300/20 rounded-lg px-4 py-3 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                                    required={index === 0}
                                />
                                <button 
                                    type="button"
                                    onClick={() => removeLikedMovie(index)}
                                    className="px-3 bg-white/5 hover:bg-red-500/20 border border-blue-300/20 rounded-lg text-white transition-all duration-300"
                                    aria-label="Remove movie"
                                    disabled={formData.likedMovies.length <= 1 && index === 0}
                                >
                                    ×
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={addLikedMovie}
                        className="mt-3 text-sm text-blue-300 hover:text-cyan-300 transition-colors flex items-center"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Add Another Movie
                    </button>
                </div>
                
                {/* Genres */}
                <div className="group">
                    <label className="block text-sm font-medium text-blue-200 mb-2">Preferred Genres (Select Multiple)</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                        {GENRES.map(genre => (
                            <div key={genre} className="flex items-center">
                                <button
                                    type="button"
                                    onClick={() => toggleGenre(genre)}
                                    className={`px-3 py-2 text-sm rounded-lg w-full text-left transition-all duration-300 ${
                                        formData.selectedGenres.includes(genre)
                                            ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white'
                                            : 'bg-white/5 text-blue-200 hover:bg-white/10'
                                    }`}
                                >
                                    {genre}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Rating and Years */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="group">
                        <label className="block text-sm font-medium text-blue-200 mb-2">Minimum Rating</label>
                        <select
                            name="minRating"
                            value={formData.minRating}
                            onChange={handleChange}
                            className="w-full bg-white/5 border border-blue-300/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 appearance-none"
                        >
                            <option value="0" className="bg-blue-900">Any rating</option>
                            <option value="5" className="bg-blue-900">5+</option>
                            <option value="6" className="bg-blue-900">6+</option>
                            <option value="7" className="bg-blue-900">7+</option>
                            <option value="8" className="bg-blue-900">8+</option>
                            <option value="9" className="bg-blue-900">9+</option>
                        </select>
                    </div>

                    <div className="group">
                        <label className="block text-sm font-medium text-blue-200 mb-2">Min Release Year</label>
                        <input
                            type="number"
                            name="minYear"
                            value={formData.minYear}
                            onChange={handleChange}
                            min="1900"
                            max={currentYear}
                            className="w-full bg-white/5 border border-blue-300/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 appearance-none"
                        />
                    </div>
                    
                    <div className="group">
                        <label className="block text-sm font-medium text-blue-200 mb-2">Max Release Year</label>
                        <input
                            type="number"
                            name="maxYear"
                            value={formData.maxYear}
                            onChange={handleChange}
                            min={formData.minYear}
                            max={currentYear}
                            className="w-full bg-white/5 border border-blue-300/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 appearance-none"
                        />
                    </div>
                </div>

                {/* Additional Preferences */}
                <div className="group">
                    <label className="block text-sm font-medium text-blue-200 mb-2">Additional Preferences (Optional)</label>
                    <textarea
                        name="additionalPreferences"
                        value={formData.additionalPreferences}
                        onChange={handleChange}
                        placeholder="e.g. movies with plot twists, specific actors, or themes you enjoy"
                        className="w-full bg-white/5 border border-blue-300/20 rounded-lg px-4 py-3 text-white placeholder-blue-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300"
                        rows={3}
                    />
                </div>
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