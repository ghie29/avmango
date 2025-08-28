import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import VideoCard from "../components/VideoCard";
import supabase from "../../supabaseClient";
import axios from "axios";

export default function Search() {
    const { term } = useParams(); // from /search/:term
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchSearchResults() {
            setLoading(true);
            try {
                // -------------------- 1️⃣ Supabase --------------------
                const { data: supabaseData, error: supabaseError } = await supabase
                    .from("videos")
                    .select("*")
                    .ilike("title", `%${term}%`);

                if (supabaseError) throw supabaseError;

                const normalizedSupabase = supabaseData.map(video => ({
                    id: video.slug || video.code || video.id, // ✅ route-safe ID
                    title: video.title || "No Title",
                    thumbnail: video.thumbnail || "https://via.placeholder.com/320x180",
                    views: video.views || "0",
                    source: "supabase",
                    video_url: video.video_url || "",
                }));

                // -------------------- 2️⃣ AVDB API --------------------
                const avdbResponse = await axios.get(
                    `https://avdbapi.com/api.php/provide/vod?ac=detail&wd=${encodeURIComponent(term)}`
                );
                const avdbData = avdbResponse.data.list || [];

                const normalizedAPI = avdbData.map(video => ({
                    id: video.slug || video.code || video.vod_id || video.id, // ✅ route-safe ID
                    title: video.name || video.title || "No Title",
                    thumbnail: video.thumb_url || video.poster_url || "https://via.placeholder.com/320x180",
                    views: video.vod_hits || "0",
                    source: "api",
                    video_url: video.vod_play_url || "",
                }));

                // -------------------- Combine --------------------
                setVideos([...normalizedSupabase, ...normalizedAPI]);
            } catch (err) {
                console.error("Search error:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchSearchResults();
    }, [term]);

    return (
        <div className="p-8">
            <h1 className="text-2xl text-white mb-4">
                Search Results for: <span className="text-yellow-400">{term}</span>
            </h1>

            {loading ? (
                <p className="text-white">Loading...</p>
            ) : videos.length === 0 ? (
                <p className="text-gray-400">No results found.</p>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {videos.map(video => (
                        <VideoCard key={`${video.source}-${video.id}`} video={video} />
                    ))}
                </div>
            )}
        </div>
    );
}
