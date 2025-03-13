import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_BASE = 'https://api.themoviedb.org/3';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    const { id, userPreferences } = req.query;

    if (!id) {
        return res.status(400).json({ error: 'Movie ID is required' });
    }

    try {
        // Get detailed movie information
        const detailsResponse = await axios.get(`${TMDB_API_BASE}/movie/${id}`, {
            params: {
                api_key: TMDB_API_KEY,
                append_to_response: 'credits,similar,recommendations,watch/providers'
            }
        });
        
        const movieDetails = detailsResponse.data;
        
        // Extract streaming providers (focus on US market, but can be expanded)
        const watchProviders = movieDetails['watch/providers']?.results?.US?.flatrate || [];
        const streamingServices = watchProviders.map((provider: any) => ({
            provider_id: provider.provider_id,
            provider_name: provider.provider_name,
            logo_path: provider.logo_path
        }));
        
        // Check if movie matches user preferences (if provided)
        let preferenceMatch = {};
        if (userPreferences) {
            const preferences = typeof userPreferences === 'string' 
                ? JSON.parse(userPreferences) 
                : userPreferences;
                
            // Check genre matches
            if (preferences.selectedGenres && preferences.selectedGenres.length > 0) {
                const genreNames = movieDetails.genres.map((g: any) => g.name.toLowerCase());
                const preferredGenres = preferences.selectedGenres.map((g: string) => g.toLowerCase());
                const matchingGenres = preferredGenres.filter((g: string) => 
                    genreNames.some((mg: string) => mg.includes(g) || g.includes(mg))
                );
                
                preferenceMatch = {
                    ...preferenceMatch,
                    genreMatch: matchingGenres.length > 0,
                    matchingGenres: matchingGenres
                };
            }
            
            // Check streaming service matches
            if (preferences.streamingServices && preferences.streamingServices.length > 0) {
                const streamingNames = streamingServices.map((s: any) => s.provider_name.toLowerCase());
                const preferredServices = preferences.streamingServices.map((s: string) => s.toLowerCase());
                const matchingServices = preferredServices.filter((s: string) => 
                    streamingNames.some((ms: string) => ms.includes(s) || s.includes(ms))
                );
                
                preferenceMatch = {
                    ...preferenceMatch,
                    streamingMatch: matchingServices.length > 0,
                    matchingServices: matchingServices
                };
            }
        }
        
        return res.status(200).json({
            ...movieDetails,
            streamingServices,
            preferenceMatch
        });
        
    } catch (error) {
        console.error('Error fetching movie details:', error);
        return res.status(500).json({ error: 'Failed to fetch movie details' });
    }
} 