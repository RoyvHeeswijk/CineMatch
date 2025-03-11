interface Movie {
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
}

interface RecommendationListProps {
    recommendations: Movie[];
}

export default function RecommendationList({ recommendations }: RecommendationListProps) {
    if (!recommendations.length) return null;

    const formatRuntime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    return (
        <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Recommended Movies</h2>
            <div className="grid gap-8">
                {recommendations.map((movie, index) => (
                    <div key={index} className="relative bg-gray-900 rounded-lg overflow-hidden">
                        <div className="flex flex-col md:flex-row">
                            {/* Poster */}
                            <div className="md:w-1/3 relative">
                                {movie.posterPath && (
                                    <img
                                        src={movie.posterPath}
                                        alt={movie.title}
                                        className="w-full h-full object-cover"
                                    />
                                )}
                                <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-full">
                                    {movie.rating} ★
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1">
                                <h3 className="text-2xl font-bold mb-2">{movie.title}</h3>
                                <div className="text-sm text-gray-400 mb-4">
                                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                                    <span className="mx-2">•</span>
                                    <span>{formatRuntime(movie.runtime)}</span>
                                    <span className="mx-2">•</span>
                                    <span>{movie.genres}</span>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold mb-2">Overview</h4>
                                    <p className="text-gray-300">{movie.description}</p>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-lg font-semibold mb-2">Why You Might Like It</h4>
                                    <p className="text-gray-300">{movie.comparison}</p>
                                </div>

                                <div className="text-sm text-gray-400">
                                    <p><span className="font-semibold">Director:</span> {movie.director}</p>
                                    <p><span className="font-semibold">Starring:</span> {movie.cast}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 