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
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        const { preferences } = req.body;

        // Get movie suggestions from OpenAI
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a movie recommendation expert. Suggest exactly 10 well-known movies based on the user's preferences. Include a mix of classic and modern films. Return ONLY the movie titles separated by commas, nothing else."
                },
                {
                    role: "user",
                    content: `Suggest movies similar to these preferences: ${preferences}`
                }
            ],
            temperature: 0.7,
        });

        const movieTitles = completion.choices[0].message.content?.split(',').map(title => title.trim()) || [];
        console.log('Suggested titles:', movieTitles);

        // Get movie details
        let recommendations = [];
        for (const title of movieTitles) {
            const movie = await searchMovie(title);
            if (movie) {
                recommendations.push(movie);
            }

            // Break if we have 10 movies
            if (recommendations.length === 10) break;
        }

        // If we don't have enough recommendations, get popular movies
        if (recommendations.length < 10) {
            const popularResponse = await axios.get(`${TMDB_API_BASE}/movie/popular`, {
                params: {
                    api_key: process.env.TMDB_API_KEY,
                    language: 'en-US',
                    page: 1
                }
            });

            const popularMovies = popularResponse.data.results;
            for (const movie of popularMovies) {
                if (recommendations.length >= 10) break;

                const details = await getMovieDetails(movie.id);
                if (details) {
                    const hours = Math.floor(details.runtime / 60);
                    const minutes = details.runtime % 60;

                    recommendations.push({
                        title: movie.title,
                        description: movie.overview,
                        posterPath: movie.poster_path
                            ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                            : null,
                        releaseDate: movie.release_date,
                        runtime: details.runtime,
                        formattedRuntime: `${hours}h ${minutes}m`,
                        rating: details.vote_average.toFixed(1),
                        genres: details.genres.map((g: any) => g.name).join(', '),
                        director: details.credits.crew.find((c: any) => c.job === 'Director')?.name || 'Unknown',
                        cast: details.credits.cast.slice(0, 3).map((actor: any) => actor.name).join(', ')
                    });
                }
            }
        }

        return res.status(200).json({ recommendations });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Failed to get recommendations',
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
} 