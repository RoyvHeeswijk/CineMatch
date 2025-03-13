import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Fetch trending movies from TMDB
    const response = await axios.get(`${TMDB_API_BASE}/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
      },
    });

    const data = response.data;

    // Make sure we normalize the API response format
    const normalizedMovies = data.results.map((movie: any) => ({
      id: `tmdb-${movie.id}`,
      title: movie.title,
      poster_path: movie.poster_path,
      release_date: movie.release_date,
      vote_average: movie.vote_average,
      overview: movie.overview,
      // Add any other properties we're using
    }));

    return res.status(200).json({ movies: normalizedMovies });
  } catch (error) {
    console.error('Error fetching trending movies:', error);
    return res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
} 