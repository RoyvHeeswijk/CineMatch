import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

async function getMovieDetails(movieId: number) {
    try {
        const response = await axios.get(`${TMDB_API_BASE}/movie/${movieId}`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                append_to_response: 'credits'
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return null;
    }
}

async function searchMovie(title: string) {
    try {
        // Clean the movie title for search
        const cleanTitle = title.replace(/[^\w\s]/gi, '').trim();

        const searchResponse = await axios.get(`${TMDB_API_BASE}/search/movie`, {
            params: {
                api_key: process.env.TMDB_API_KEY,
                query: cleanTitle,
                language: 'en-US',
            },
        });

        if (!searchResponse.data.results.length) {
            console.log(`No results found for: ${cleanTitle}`);
            return null;
        }

        const movie = searchResponse.data.results[0];
        const details = await getMovieDetails(movie.id);

        if (!details || !details.runtime) {
            console.log(`No details found for: ${cleanTitle}`);
            return null;
        }

        // Format runtime
        const hours = Math.floor(details.runtime / 60);
        const minutes = details.runtime % 60;
        const formattedRuntime = `${hours}h ${minutes}m`;

        return {
            title: movie.title,
            description: movie.overview,
            posterPath: movie.poster_path
                ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                : null,
            releaseDate: movie.release_date,
            runtime: details.runtime,
            formattedRuntime,
            rating: details.vote_average.toFixed(1),
            genres: details.genres.map((g: any) => g.name).join(', '),
            director: details.credits.crew.find((c: any) => c.job === 'Director')?.name || 'Unknown',
            cast: details.credits.cast.slice(0, 3).map((actor: any) => actor.name).join(', ')
        };
    } catch (error) {
        console.error('Movie search error:', error);
        return null;
    }
}

// Enhanced function to fetch TMDB data with user preferences
async function fetchTMDBDataWithUserPreferences(recommendations: any[], userPreferences: any) {
    try {
        // Map through recommendations and fetch enhanced data from TMDB
        const enhancedRecommendations = await Promise.all(recommendations.map(async (movie) => {
            // Try to find the movie in TMDB
            const searchResponse = await axios.get(`${TMDB_API_BASE}/search/movie`, {
                params: {
                    api_key: TMDB_API_KEY,
                    query: movie.title,
                    year: movie.releaseYear // Use release year if available
                }
            });
            
            const searchResults = searchResponse.data.results;
            
            // If no results found, return original recommendation with better fallback handling
            if (!searchResults || searchResults.length === 0) {
                return {
                    ...movie,
                    id: movie.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
                    posterPath: movie.posterPath || null,
                    tmdbMatched: false
                };
            }
            
            // Get the first (most relevant) result
            const tmdbMovie = searchResults[0];
            const tmdbId = tmdbMovie.id;
            
            // Get detailed movie information
            const detailsResponse = await axios.get(`${TMDB_API_BASE}/movie/${tmdbId}`, {
                params: {
                    api_key: TMDB_API_KEY,
                    append_to_response: 'credits,watch/providers'
                }
            });
            
            const movieDetails = detailsResponse.data;
            
            // Extract streaming providers
            const watchProviders = movieDetails['watch/providers']?.results?.US?.flatrate || [];
            const streamingServices = watchProviders.map((provider: any) => provider.provider_name);
            
            // Handle preferences text-based matching
            let isOnPreferredService = false;
            let genreMatchScore = 0;
            
            if (userPreferences.preferences) {
                const preferencesLower = userPreferences.preferences.toLowerCase();
                
                // Check for streaming services mentions in preferences
                const commonStreamingServices = ['netflix', 'hulu', 'disney', 'amazon', 'prime', 'hbo', 'max', 'paramount', 'apple'];
                const mentionedServices = commonStreamingServices.filter(service => 
                    preferencesLower.includes(service)
                );
                
                if (mentionedServices.length > 0) {
                    isOnPreferredService = streamingServices.some(service => 
                        mentionedServices.some(mentioned => 
                            service.toLowerCase().includes(mentioned)
                        )
                    );
                }
                
                // Extract potential genres from preferences text
                const commonGenres = ['action', 'comedy', 'drama', 'horror', 'thriller', 'sci-fi', 'science fiction', 
                                     'romance', 'documentary', 'animation', 'adventure', 'fantasy', 'mystery'];
                const mentionedGenres = commonGenres.filter(genre => 
                    preferencesLower.includes(genre)
                );
                
                if (mentionedGenres.length > 0 && movieDetails.genres) {
                    const movieGenres = movieDetails.genres.map((g: any) => g.name.toLowerCase());
                    const matchingGenres = mentionedGenres.filter(genre => 
                        movieGenres.some(mg => mg.includes(genre) || genre.includes(mg))
                    );
                    
                    genreMatchScore = matchingGenres.length / mentionedGenres.length;
                }
            }
            
            // Format data consistently
            return {
                ...movie,
                id: `tmdb-${tmdbId}`,
                tmdbId: tmdbId.toString(),
                title: movieDetails.title,
                posterPath: movieDetails.poster_path 
                    ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
                    : movie.posterPath,
                releaseDate: movieDetails.release_date || movie.releaseDate,
                runtime: movieDetails.runtime,
                overview: movieDetails.overview,
                description: movieDetails.overview || movie.description,
                rating: movieDetails.vote_average.toString(),
                genres: movieDetails.genres?.map((genre: any) => genre.name).join(', ') || movie.genres,
                director: movieDetails.credits?.crew?.find((person: any) => person.job === 'Director')?.name || movie.director,
                cast: movieDetails.credits?.cast?.slice(0, 5).map((person: any) => person.name).join(', ') || movie.cast,
                streamingAvailability: streamingServices.length > 0 ? streamingServices : movie.streamingAvailability,
                isOnPreferredService,
                genreMatchScore,
                tmdbMatched: true
            };
        }));
        
        // Return recommendations with consistent structure
        return enhancedRecommendations;
        
    } catch (error) {
        console.error('Error fetching TMDB data:', error);
        // Return original recommendations with minimal formatting to ensure they display properly
        return recommendations.map(rec => ({
            ...rec,
            id: rec.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
            posterPath: rec.posterPath || null
        }));
    }
}

// Update the handler to process a single text input
export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { userInput } = req.body;

        if (!userInput || !userInput.trim()) {
            return res.status(400).json({ error: 'Please provide your movie preferences' });
        }

        // Optimize the OpenAI API call for faster responses - but with correct model name
        const prompt = `Based on this input: "${userInput}", recommend 10 suitable movies with title, year, and a brief description.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Use the standard model that works
            messages: [
                { role: "system", content: "You are a fast movie recommendation engine. Provide concise movie suggestions in JSON format with a 'recommendations' array containing objects with 'title', 'description', and 'releaseYear' fields." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500, // A bit higher to ensure complete responses
            temperature: 0.7,
        });

        const responseContent = completion.choices[0].message.content;
        
        try {
            // Parse the JSON response
            const parsedResponse = JSON.parse(responseContent || '{}');
            let recommendations = parsedResponse.recommendations || [];
            
            // Ensure we have at least some recommendations
            if (recommendations.length === 0) {
                console.warn('No recommendations returned from AI, using backup method');
                // Create some fallback recommendations based on user input
                const keywords = userInput.split(/\s+/).filter(word => word.length > 3);
                if (keywords.length > 0) {
                    // Try to search for movies using keywords from user input
                    try {
                        const fallbackResults = await Promise.all(keywords.slice(0, 3).map(async (keyword) => {
                            const searchResponse = await axios.get(`${TMDB_API_BASE}/search/movie`, {
                                params: {
                                    api_key: TMDB_API_KEY,
                                    query: keyword,
                                    sort_by: 'popularity.desc'
                                }
                            });
                            return searchResponse.data.results.slice(0, 3);
                        }));
                        
                        // Flatten and deduplicate results
                        const flatResults = fallbackResults.flat();
                        const uniqueIds = new Set();
                        recommendations = flatResults
                            .filter(movie => {
                                if (uniqueIds.has(movie.id)) return false;
                                uniqueIds.add(movie.id);
                                return true;
                            })
                            .map(movie => ({
                                title: movie.title,
                                description: movie.overview,
                                releaseYear: new Date(movie.release_date).getFullYear(),
                                releaseDate: movie.release_date,
                                rating: movie.vote_average.toString(),
                                posterPath: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null
                            }))
                            .slice(0, 10);
                    } catch (fallbackError) {
                        console.error('Error in fallback search:', fallbackError);
                    }
                }
            }
            
            // First add user input to recommendations for context
            const recommendationsWithContext = recommendations.map((movie: any) => ({
                ...movie,
                userInput: userInput // Store the original user input with each recommendation
            }));
            
            // Then enhance with TMDB data
            const enhancedRecommendations = await fetchTMDBDataWithUserInput(
                recommendationsWithContext, 
                userInput
            );
            
            return res.status(200).json({ recommendations: enhancedRecommendations });
            
        } catch (error) {
            console.error('Error parsing AI response:', error);
            return res.status(500).json({ error: 'Failed to parse recommendations' });
        }
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return res.status(500).json({ error: 'Failed to generate recommendations' });
    }
}

// Updated function to use the user input text
async function fetchTMDBDataWithUserInput(recommendations: any[], userInput: string) {
    try {
        // Extract useful information from user input for matching
        const userInputLower = userInput.toLowerCase();
        
        // Common streaming services to look for in the input
        const streamingServices = ['netflix', 'hulu', 'disney+', 'amazon prime', 'hbo max', 'apple tv+', 'paramount+'];
        const mentionedServices = streamingServices.filter(service => userInputLower.includes(service.toLowerCase()));
        
        // Common genres to look for in the input
        const genres = ['action', 'adventure', 'animation', 'comedy', 'crime', 'documentary', 'drama', 'family', 
                        'fantasy', 'history', 'horror', 'music', 'mystery', 'romance', 'science fiction', 'sci-fi',
                        'thriller', 'war', 'western'];
        const mentionedGenres = genres.filter(genre => userInputLower.includes(genre.toLowerCase()));
        
        // Map through recommendations and fetch enhanced data from TMDB
        const enhancedRecommendations = await Promise.all(recommendations.map(async (movie) => {
            try {
                // Try to find the movie in TMDB
                const searchResponse = await axios.get(`${TMDB_API_BASE}/search/movie`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        query: movie.title,
                        year: movie.releaseYear || new Date(movie.releaseDate).getFullYear() // Use release year if available
                    }
                });
                
                const searchResults = searchResponse.data.results;
                
                // If no results found, return original recommendation
                if (!searchResults || searchResults.length === 0) {
                    return {
                        ...movie,
                        id: movie.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
                        posterPath: movie.posterPath || null,
                        tmdbMatched: false,
                        matchDetails: {
                            mentionedServices,
                            mentionedGenres,
                            originalInput: userInput
                        }
                    };
                }
                
                // Get the first (most relevant) result
                const tmdbMovie = searchResults[0];
                const tmdbId = tmdbMovie.id;
                
                // Get detailed movie information
                const detailsResponse = await axios.get(`${TMDB_API_BASE}/movie/${tmdbId}`, {
                    params: {
                        api_key: TMDB_API_KEY,
                        append_to_response: 'credits,watch/providers'
                    }
                });
                
                const movieDetails = detailsResponse.data;
                
                // Extract streaming providers
                const watchProviders = movieDetails['watch/providers']?.results?.US?.flatrate || [];
                const streamingServices = watchProviders.map((provider: any) => provider.provider_name);
                
                // Check if movie is available on any of the mentioned streaming services
                const isOnMentionedService = mentionedServices.length > 0 ? 
                    streamingServices.some(service => 
                        mentionedServices.some(mentioned => 
                            service.toLowerCase().includes(mentioned)
                        )
                    ) : false;
                
                // Check genre matches
                let genreMatchScore = 0;
                if (mentionedGenres.length > 0 && movieDetails.genres) {
                    const movieGenres = movieDetails.genres.map((g: any) => g.name.toLowerCase());
                    const matchingGenres = mentionedGenres.filter(genre => 
                        movieGenres.some(mg => mg.includes(genre) || genre.includes(mg))
                    );
                    
                    genreMatchScore = matchingGenres.length / mentionedGenres.length;
                }
                
                // Format data consistently
                return {
                    ...movie,
                    id: `tmdb-${tmdbId}`,
                    tmdbId: tmdbId.toString(),
                    title: movieDetails.title,
                    posterPath: movieDetails.poster_path 
                        ? `https://image.tmdb.org/t/p/w500${movieDetails.poster_path}`
                        : movie.posterPath,
                    releaseDate: movieDetails.release_date || movie.releaseDate,
                    runtime: movieDetails.runtime,
                    overview: movieDetails.overview,
                    description: movie.description || movieDetails.overview,
                    rating: movieDetails.vote_average.toString(),
                    genres: movieDetails.genres?.map((genre: any) => genre.name).join(', ') || movie.genres,
                    director: movieDetails.credits?.crew?.find((person: any) => person.job === 'Director')?.name || movie.director,
                    cast: movieDetails.credits?.cast?.slice(0, 5).map((person: any) => person.name).join(', ') || movie.cast,
                    streamingAvailability: streamingServices.length > 0 ? streamingServices : movie.streamingAvailability,
                    isOnPreferredService: isOnMentionedService,
                    genreMatchScore,
                    tmdbMatched: true,
                    matchDetails: {
                        mentionedServices,
                        mentionedGenres,
                        originalInput: userInput
                    }
                };
            } catch (error) {
                console.error(`Error processing movie ${movie.title}:`, error);
                return {
                    ...movie,
                    id: movie.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
                    posterPath: movie.posterPath || null,
                    matchDetails: {
                        mentionedServices,
                        mentionedGenres,
                        originalInput: userInput
                    }
                };
            }
        }));
        
        return enhancedRecommendations;
    } catch (error) {
        console.error('Error processing with TMDB:', error);
        return recommendations.map(rec => ({
            ...rec,
            id: rec.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
            posterPath: rec.posterPath || null,
            matchDetails: {
                originalInput: userInput
            }
        }));
    }
}

// Implement batch processing to limit concurrent API calls
async function fetchTMDBDataWithBatching(recommendations: any[], userInput: string) {
    // Process in batches of 3 to avoid overwhelming TMDB API
    const batchSize = 3;
    const enhancedRecommendations = [];
    
    for (let i = 0; i < recommendations.length; i += batchSize) {
        const batch = recommendations.slice(i, i + batchSize);
        const batchResults = await Promise.all(
            batch.map(movie => enhanceMovieWithTMDB(movie, userInput))
        );
        enhancedRecommendations.push(...batchResults);
        
        // Small delay between batches to respect rate limits
        if (i + batchSize < recommendations.length) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    return enhancedRecommendations;
}

// Simplified TMDB data fetching for essential information only
async function enhanceMovieWithTMDB(movie, userInput) {
    try {
        // First, just get basic search results
        const searchResponse = await axios.get(`${TMDB_API_BASE}/search/movie`, {
            params: {
                api_key: TMDB_API_KEY,
                query: movie.title,
            }
        });
        
        if (!searchResponse.data.results.length) {
            return {
                ...movie,
                id: movie.id || `rec-${Math.random().toString(36).substr(2, 9)}`,
                posterPath: null
            };
        }
        
        const tmdbMovie = searchResponse.data.results[0];
        
        // Return with just essential data first
        return {
            ...movie,
            id: `tmdb-${tmdbMovie.id}`,
            tmdbId: tmdbMovie.id.toString(),
            posterPath: tmdbMovie.poster_path ? 
                `https://image.tmdb.org/t/p/w500${tmdbMovie.poster_path}` : null,
            releaseDate: tmdbMovie.release_date || movie.releaseDate,
            rating: tmdbMovie.vote_average.toString()
        };
    } catch (error) {
        return movie;
    }
} 