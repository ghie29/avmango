import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Sidebar from "../components/Sidebar";
import Hls from "hls.js";
import { validate as isUuid } from "uuid";

export default function Video() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // -------------------- Fetch Video --------------------
    useEffect(() => {
        async function fetchVideo() {
            setLoading(true);
            setError(null);

            try {
                let fetchedVideo = null;
                let categoryType = "unknown";

                // 1️⃣ Check API categories
                for (const cat of Object.values(categories)) {
                    if (cat.type === "api") {
                        const res = await fetch(cat.url);
                        const json = await res.json();
                        const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];
                        const found = list.find((v) => v.id == id);
                        if (found) {
                            fetchedVideo = found;
                            categoryType = "api";
                            break;
                        }
                    }
                }

                // 2️⃣ Korean Supabase
                if (!fetchedVideo) {
                    const query = isUuid(id)
                        ? `id.eq.${id}`
                        : `slug.eq.${id},code.eq.${id}`;

                    const { data: koreanVideo, error: fetchError } = await supabase
                        .from("videos")
                        .select("*")
                        .or(query)
                        .maybeSingle();

                    if (fetchError) throw fetchError;

                    if (koreanVideo) {
                        fetchedVideo = koreanVideo;
                        categoryType = "supabase";
                        // Prefer .m3u8 URL if available
                        fetchedVideo.videoUrl = koreanVideo.video_url_m3u8 || koreanVideo.video_url;
                    }
                }

                if (!fetchedVideo) throw new Error("Video not found");

                const videoUrl =
                    categoryType === "supabase"
                        ? fetchedVideo.videoUrl
                        : fetchedVideo.episodes?.server_data?.Full?.link_embed || "";

                setVideo({
                    id: fetchedVideo.id,
                    title: fetchedVideo.title || fetchedVideo.name || fetchedVideo.origin_name || "No Title",
                    videoUrl,
                    type: categoryType,
                    description: fetchedVideo.description || "No description available",
                    thumbnail:
                        fetchedVideo.poster_url ||
                        fetchedVideo.thumb_url ||
                        "https://via.placeholder.com/640x360",
                });

                // -------------------- Related Videos --------------------
                let relatedVideos = [];
                if (categoryType === "supabase") {
                    const { data: rel } = await supabase
                        .from("videos")
                        .select("*")
                        .neq("slug", fetchedVideo.slug)
                        .limit(8);
                    relatedVideos = rel.map((v) => ({
                        id: v.id,
                        title: v.title,
                        thumbnail: v.thumbnail || "https://via.placeholder.com/320x180",
                        views: v.views || 0,
                    }));
                } else if (categoryType === "api") {
                    const apiCategory = Object.values(categories).find((c) => c.type === "api");
                    if (apiCategory) {
                        const res = await fetch(apiCategory.url);
                        const json = await res.json();
                        const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];
                        relatedVideos = list
                            .filter((v) => v.id != id)
                            .slice(0, 8)
                            .map((v) => ({
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
        <div className="flex flex-col lg:flex-row w-full px-2 gap-6 mt-2">
            <div className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[100%] mx-auto mb-6">
                    {video.type === "supabase" ? (
                        <div className="w-full aspect-video rounded-lg overflow-hidden">
                            <video
                                className="w-full h-full"
                                controls
                                autoPlay={false}
                                playsInline
                                ref={(videoEl) => {
                                    if (!videoEl) return;
                                    if (video.videoUrl.endsWith(".m3u8") && Hls.isSupported()) {
                                        const hls = new Hls();
                                        hls.loadSource(video.videoUrl);
                                        hls.attachMedia(videoEl);
                                    } else {
                                        videoEl.src = video.videoUrl;
                                    }
                                }}
                            />
                        </div>
                    ) : (
                        <iframe
                            src={video.videoUrl}
                            title={video.title}
                            allowFullScreen
                            loading="lazy"
                            className="w-full aspect-video rounded-lg"
                        />
                    )}

                    <h1 className="font-bold mt-2 text-left text-white neon-text line-clamp-2 text-2xl">
                        {video.title}
                    </h1>
                    <p className="mt-2 text-left text-white line-clamp-3">{video.description}</p>
                </div>

                {related.length > 0 && (
                    <div className="w-full max-w-7xl mt-8">
                        <h2 className="text-xl text-white font-bold mb-4 text-center neon-text">
                            More Videos
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
                            {related.map((v) => (
                                <VideoCard key={v.id} video={v} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <Sidebar />
        </div>
    );
}
