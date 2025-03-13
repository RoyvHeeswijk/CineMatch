export interface Movie {
  id: string;
  title: string;
  description: string;
  posterPath: string | null;
  releaseDate: string;
  runtime: number;
  rating: string;
  genres: string;
  director: string;
  comparison: string;
  cast: string;
  tmdbId?: string;
  isLoading?: boolean;
} 