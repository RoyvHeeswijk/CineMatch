import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import axios from 'axios';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

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

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { 
            likedMovies, 
            selectedGenres, 
            minRating, 
            minYear,
            maxYear, 
            additionalPreferences 
        } = req.body;

        if (!likedMovies || likedMovies.length === 0) {
            return res.status(400).json({ error: 'At least one movie is required' });
        }

        // Build a prompt that incorporates all user preferences
        let prompt = `Recommend 5 movies`;
        
        // Add liked movies to the prompt
        if (likedMovies.length === 1) {
            prompt += ` similar to "${likedMovies[0]}"`;
        } else {
            prompt += ` for someone who likes ${likedMovies.map((m: string) => `"${m}"`).join(', ')}`;
        }
        
        // Add genre preferences if provided
        if (selectedGenres && selectedGenres.length > 0) {
            if (selectedGenres.length === 1) {
                prompt += ` in the ${selectedGenres[0]} genre`;
            } else {
                const lastGenre = selectedGenres.pop();
                prompt += ` in the ${selectedGenres.join(', ')} and ${lastGenre} genres`;
                // Put the genre back for the response
                selectedGenres.push(lastGenre);
            }
        }
        
        // Add rating and year filters
        if (minRating && minRating !== '0') {
            prompt += ` with a minimum rating of ${minRating}/10`;
        }
        
        if (minYear || maxYear) {
            prompt += ` released`;
            if (minYear) prompt += ` after ${minYear}`;
            if (minYear && maxYear) prompt += ` and`;
            if (maxYear) prompt += ` before or during ${maxYear}`;
        }
        
        // Add any additional preferences
        if (additionalPreferences) {
            prompt += `. Additional preferences: ${additionalPreferences}`;
        }
        
        prompt += `. For each movie, provide the title, a brief description, release year, TMDB ID if available, director, cast, genres, and an estimated rating out of 10. Also explain why this movie would be a good match based on my preferences.`;

        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful movie recommendation assistant. Provide detailed, accurate recommendations based on user preferences. Format your response as JSON." },
                { role: "user", content: prompt }
            ],
            response_format: { type: "json_object" },
        });

        const responseContent = completion.choices[0].message.content;
        let recommendations;

        try {
            // Parse the JSON response
            const parsedResponse = JSON.parse(responseContent || '{}');
            recommendations = parsedResponse.recommendations || [];
            
            // Enhance the recommendations with the user's preferences
            recommendations = recommendations.map((movie: any) => ({
                ...movie,
                // Add additional data based on user input
                requestedGenres: selectedGenres,
                preferenceDetails: {
                    basedOn: likedMovies,
                    minRating: minRating,
                    yearRange: { min: minYear, max: maxYear },
                    additionalRequests: additionalPreferences || undefined
                }
            }));
            
        } catch (error) {
            console.error('Error parsing AI response:', error);
            recommendations = [];
        }

        return res.status(200).json({ recommendations });
    } catch (error) {
        console.error('Error generating recommendations:', error);
        return res.status(500).json({ error: 'Failed to generate recommendations' });
    }
} 