import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid movie ID' });
  }

  try {
    const response = await axios.get(`${TMDB_API_BASE}/movie/${id}`, {
      params: {
        api_key: TMDB_API_KEY,
        append_to_response: 'credits,watch/providers'
      }
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return res.status(500).json({ error: 'Failed to fetch movie details' });
  }
} 