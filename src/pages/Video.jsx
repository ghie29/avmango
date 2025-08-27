import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Plyr from "plyr-react";
import "plyr-react/plyr.css";

export default function Video() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        async function fetchVideo() {
            setLoading(true);
            setError(null);

            try {
                let fetchedVideo = null;
                let categoryType = "unknown";

                // -------------------- Check Korean Supabase --------------------
                const { data: koreanBoard } = await supabase
                    .from("boards")
                    .select("id")
                    .eq("slug", "korean")
                    .single();

                const { data: koreanVideo } = await supabase
                    .from("videos")
                    .select("*")
                    .eq("id", id)
                    .eq("board_id", koreanBoard.id)
                    .single();

                if (koreanVideo) {
                    fetchedVideo = koreanVideo;
                    categoryType = "supabase";
                } else {
                    // -------------------- Check AVDB API --------------------
                    for (const [key, cat] of Object.entries(categories)) {
                        if (cat.type === "api") {
                            const res = await fetch(cat.url);
                            const json = await res.json();
                            const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];
                            const found = list.find(v => v.id == id);
                            if (found) {
                                fetchedVideo = found;
                                categoryType = "api";
                                break;
                            }
                        }
                    }
                }

                if (!fetchedVideo) throw new Error("Video not found");

                // -------------------- Normalize Video --------------------
                const linkEmbed = fetchedVideo.episodes?.server_data?.Full?.link_embed || "";
                const normalizedVideo = {
                    id: fetchedVideo.id,
                    title: fetchedVideo.title || fetchedVideo.name || fetchedVideo.origin_name || "No Title",
                    origin_name: fetchedVideo.origin_name || "",
                    slug: fetchedVideo.slug,
                    description: fetchedVideo.description || "No description available.",
                    thumbnail: fetchedVideo.poster_url || fetchedVideo.thumb_url || "https://via.placeholder.com/640x360",
                    videoUrl: categoryType === "supabase" ? fetchedVideo.video_url : linkEmbed,
                    type: categoryType,
                    actors: fetchedVideo.actor || [],
                    director: fetchedVideo.director || [],
                    movie_code: fetchedVideo.movie_code || fetchedVideo.slug || fetchedVideo.id.toString(),
                    category: fetchedVideo.category || [],
                    country: fetchedVideo.country?.join(", ") || "",
                    year: fetchedVideo.year,
                    quality: fetchedVideo.quality,
                    status: fetchedVideo.status,
                    server_name: fetchedVideo.episodes?.server_name || "",
                };

                setVideo(normalizedVideo);

                // -------------------- Fetch Related Videos --------------------
                let relatedVideos = [];
                if (categoryType === "supabase") {
                    const { data: rel } = await supabase
                        .from("videos")
                        .select("*")
                        .eq("board_id", koreanBoard.id)
                        .neq("id", id)
                        .limit(8);
                    relatedVideos = rel.map(v => ({
                        id: v.id,
                        title: v.title,
                        thumbnail: v.thumbnail || "https://via.placeholder.com/320x180",
                        views: v.views || 0,
                    }));
                } else if (categoryType === "api") {
                    const apiCategory = Object.values(categories).find(
                        c => c.type === "api" && fetchedVideo.id // fallback, category URL is not always reliable
                    );
                    if (apiCategory) {
                        const res = await fetch(apiCategory.url);
                        const json = await res.json();
                        const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];
                        relatedVideos = list
                            .filter(v => v.id != id)
                            .slice(0, 8)
                            .map(v => ({
                                id: v.id,
                                title: v.title || v.name || v.origin_name || "No Title",
                                thumbnail: v.poster_url || v.thumb_url || "https://via.placeholder.com/320x180",
                                views: v.vod_play || "0",
                            }));
                    }
                }

                setRelated(relatedVideos);
            } catch (err) {
                console.error(err);
                setError(err.message || "Error loading video");
            }

            setLoading(false);
        }

        fetchVideo();
    }, [id]);

    if (loading) return <p className="text-white p-6 text-center">Loading...</p>;
    if (error) return <p className="text-red-500 p-6 text-center">{error}</p>;
    if (!video) return null;

    return (
        <div className="flex flex-col items-center w-full">
            {/* Video Player */}
            <div className="w-full max-w-4xl mb-6">
                {video.type === "supabase" ? (
                    <Plyr
                        type="video"
                        url={video.videoUrl}
                        poster={video.thumbnail}
                        controls={["play", "progress", "current-time", "mute", "volume", "fullscreen"]}
                    />
                ) : (
                    <div className="relative pt-[56.25%] rounded shadow-lg overflow-hidden">
                        <iframe
                            src={video.videoUrl}
                            title={video.title}
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>
                )}

                <h1 className="text-2xl text-white font-bold mt-4 text-center neon-text">{video.title}</h1>
                <p className="text-gray-400 mt-2 text-center">{video.description}</p>
            </div>

            {/* Related Videos */}
            {related.length > 0 && (
                <div className="w-full max-w-7xl mt-8">
                    <h2 className="text-xl text-white font-bold mb-4 text-center neon-text">Related Videos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
                        {related.map(v => <VideoCard key={v.id} video={v} />)}
                    </div>
                </div>
            )}
        </div>
    );
}
