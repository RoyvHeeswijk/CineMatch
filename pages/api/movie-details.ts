import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Movie ID is required' });
  }

  try {
    // Fetch movie details
    const movieResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.TMDB_API_KEY}&language=en-US`
    );
    
    if (!movieResponse.ok) {
      throw new Error(`Failed to fetch movie details: ${movieResponse.status}`);
    }
    
    const movieData = await movieResponse.json();
    
    // Fetch credits (cast and crew)
    const creditsResponse = await fetch(
      `https://api.themoviedb.org/3/movie/${id}/credits?api_key=${process.env.TMDB_API_KEY}&language=en-US`
    );
    
    if (!creditsResponse.ok) {
      throw new Error(`Failed to fetch movie credits: ${creditsResponse.status}`);
    }
    
    const creditsData = await creditsResponse.json();
    
    // Combine the data
    const combinedData = {
      ...movieData,
      credits: creditsData
    };
    
    return res.status(200).json(combinedData);
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return res.status(500).json({ error: 'Failed to fetch movie details' });
  }
} 