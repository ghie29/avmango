import { useState } from "react";
import VideoCard from "../components/VideoCard";
import supabase from "../../supabaseClient";
import { categories } from "../data/categories";

export default function Search() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!query) return;

        setLoading(true);
        setError(null);
        setResults([]);

        try {
            let allResults = [];

            // Search Korean videos
            const { data: koreanBoard } = await supabase
                .from("boards")
                .select("id")
                .eq("slug", "korean")
                .single();

            const { data: koreanVideos } = await supabase
                .from("videos")
                .select("*")
                .ilike("title", `%${query}%`)
                .eq("board_id", koreanBoard.id);

            allResults = koreanVideos.map(v => ({
                id: v.id,
                title: v.title,
                views: v.views || 0,
                thumbnail: v.thumbnail || "https://via.placeholder.com/320x180",
            }));

            // Search avdbapi categories
            for (const [key, cat] of Object.entries(categories)) {
                if (cat.type === "api") {
                    const res = await fetch(cat.url);
                    const json = await res.json();
                    const filtered = (json.list || []).filter(video =>
                        video.title?.toLowerCase().includes(query.toLowerCase())
                    );
                    const normalized = filtered.map(v => ({
                        id: v.id,
                        title: v.title || v.name || "No Title",
                        views: v.views || "0",
                        thumbnail: v.pic || "https://via.placeholder.com/320x180",
                    }));
                    allResults = [...allResults, ...normalized];
                }
            }

            setResults(allResults);
        } catch (err) {
            setError(err.message || "Error fetching search results");
        }

        setLoading(false);
    };

    return (
        <>
            <h1 className="text-3xl text-white font-bold mb-6 text-center neon-text">Search</h1>

            <form onSubmit={handleSearch} className="mb-6 flex w-full max-w-md mx-auto">
                <input
                    type="text"
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    placeholder="Search videos..."
                    className="flex-1 px-3 py-2 rounded-l bg-gray-800 text-white focus:outline-none"
                />
                <button
                    type="submit"
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-r"
                >
                    Search
                </button>
            </form>

            {loading && <p className="text-white text-center">Searching...</p>}
            {error && <p className="text-red-500 text-center">{error}</p>}
            {!loading && !error && results.length === 0 && <p className="text-white text-center">No results found.</p>}

            {!loading && !error && results.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                    {results.map(video => <VideoCard key={video.id} video={video} />)}
                </div>
            )}
        </>
    );
}
