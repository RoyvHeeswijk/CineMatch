import { NextResponse } from 'next/server';
import axios from 'axios';

const TMDB_API_BASE = 'https://api.themoviedb.org/3';

async function fetchTrending(mediaType: 'movie' | 'tv') {
  const response = await axios.get(`${TMDB_API_BASE}/trending/${mediaType}/week`, {
    params: {
      api_key: process.env.TMDB_API_KEY,
    },
  });

  return response.data.results.slice(0, 10).map((item: any) => ({
    title: item.title || item.name,
    posterPath: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
    releaseDate: item.release_date || item.first_air_date,
    overview: item.overview,
    rating: item.vote_average
  }));
}

export async function GET() {
  try {
    const [movies, shows] = await Promise.all([
      fetchTrending('movie'),
      fetchTrending('tv')
    ]);

    return NextResponse.json({
      movies,
      shows
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Failed to fetch trending content' }, { status: 500 });
  }
} 