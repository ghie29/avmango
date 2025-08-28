import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Sidebar from "../components/Sidebar";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr/dist/plyr.css";
import { validate as isUuid } from "uuid";

export default function Video() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerContainerRef = useRef(null);

    // -------------------- Fetch Video --------------------
    useEffect(() => {
        async function fetchVideo() {
            setLoading(true);
            setError(null);

            try {
                let fetchedVideo = null;
                let categoryType = "unknown";

                // 1️⃣ AVDB API first
                for (const cat of Object.values(categories)) {
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

                // 2️⃣ Korean Supabase videos
                if (!fetchedVideo) {
                    const query = isUuid(id)
                        ? `id.eq.${id}`
                        : `slug.eq.${id},code.eq.${id}`; // ✅ unified slug/code/UUID support

                    const { data: koreanVideo, error: fetchError } = await supabase
                        .from("videos")
                        .select("*")
                        .or(query)
                        .maybeSingle();

                    if (fetchError) throw fetchError;
                    if (koreanVideo) {
                        fetchedVideo = koreanVideo;
                        categoryType = "supabase";
                    }
                }

                if (!fetchedVideo) throw new Error("Video not found");

                const videoUrl = categoryType === "supabase"
                    ? fetchedVideo.video_url
                    : fetchedVideo.episodes?.server_data?.Full?.link_embed || "";

                setVideo({
                    id: fetchedVideo.id,
                    title: fetchedVideo.title || fetchedVideo.name || fetchedVideo.origin_name || "No Title",
                    videoUrl,
                    type: categoryType,
                    description: fetchedVideo.description || "No description available",
                    thumbnail: fetchedVideo.poster_url || fetchedVideo.thumb_url || "https://via.placeholder.com/640x360",
                });

                // -------------------- Related Videos --------------------
                let relatedVideos = [];
                if (categoryType === "supabase") {
                    const { data: rel } = await supabase
                        .from("videos")
                        .select("*")
                        .neq("slug", fetchedVideo.slug)
                        .limit(8);
                    relatedVideos = rel.map(v => ({
                        id: v.id,
                        title: v.title,
                        thumbnail: v.thumbnail || "https://via.placeholder.com/320x180",
                        views: v.views || 0,
                    }));
                } else if (categoryType === "api") {
                    const apiCategory = Object.values(categories).find(c => c.type === "api");
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

    // -------------------- Plyr Setup --------------------
    useEffect(() => {
        if (!video || !video.videoUrl || video.type !== "supabase") return;

        const container = playerContainerRef.current;
        if (!container) return;

        // Clear container
        container.innerHTML = "";

        // Create video element
        const videoEl = document.createElement("video");
        videoEl.className = "w-full h-full rounded-lg";
        videoEl.setAttribute("playsinline", "");
        videoEl.setAttribute("webkit-playsinline", "");
        videoEl.setAttribute("controls", "");
        videoEl.muted = true; // ✅ for autoplay
        videoEl.autoplay = false;

        container.appendChild(videoEl);

        let plyrInstance;
        let hls;

        const initializePlyr = () => {
            if (!plyrInstance) {
                plyrInstance = new Plyr(videoEl, {
                    autoplay: false,
                    muted: true,
                    ratio: "16:9",
                    tooltips: { controls: true, seek: true },
                    controls: [
                        "play-large",
                        "play",
                        "progress",
                        "current-time",
                        "mute",
                        "volume",
                        "settings",
                        "fullscreen",
                    ],
                });
            }
        };

        // ✅ HLS handling
        if (video.videoUrl.endsWith(".m3u8")) {
            if (Hls.isSupported()) {
                hls = new Hls({ autoStartLoad: true, capLevelToPlayerSize: true });
                hls.loadSource(video.videoUrl);
                hls.attachMedia(videoEl);
                hls.on(Hls.Events.MANIFEST_PARSED, () => initializePlyr());
            } else if (videoEl.canPlayType("application/vnd.apple.mpegurl")) {
                // Safari
                videoEl.src = video.videoUrl;
                videoEl.type = "application/x-mpegURL";
                videoEl.addEventListener("loadedmetadata", () => initializePlyr());
            } else {
                // fallback
                videoEl.src = video.videoUrl;
                videoEl.addEventListener("loadedmetadata", () => initializePlyr());
            }
        } else {
            // MP4
            videoEl.src = video.videoUrl;
            videoEl.addEventListener("loadedmetadata", () => initializePlyr());
        }

        // Cleanup
        return () => {
            plyrInstance?.destroy();
            hls?.destroy();
        };
    }, [video]);


    if (loading) return <p className="text-white p-6 text-center">Loading...</p>;
    if (error) return <p className="text-red-500 p-6 text-center">{error}</p>;
    if (!video) return null;

    return (
        <div className="flex flex-col lg:flex-row w-full px-2 gap-6 mt-2">
            <div className="flex-1 flex flex-col items-center">
                <div className="w-full max-w-[100%] mx-auto mb-6">
                    {video.type === "supabase" ? (
                        <div ref={playerContainerRef} className="w-full mb-4"></div>
                    ) : (
                        <div className="relative w-full rounded-lg shadow-lg overflow-hidden aspect-video">
                            <iframe
                                src={video.videoUrl}
                                title={video.title}
                                allowFullScreen
                                loading="lazy"
                                className="absolute top-0 left-0 w-full h-full"
                            />
                        </div>
                    )}
                    <h1 className="font-bold mt-2 text-left text-white neon-text line-clamp-2 text-2xl">
                        {video.title}
                    </h1>
                    <p className="mt-2 text-left text-white line-clamp-3">{video.description}</p>
                </div>

                {related.length > 0 && (
                    <div className="w-full max-w-7xl mt-8">
                        <h2 className="text-xl text-white font-bold mb-4 text-center neon-text">More Videos</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 justify-items-center">
                            {related.map(v => <VideoCard key={v.id} video={v} />)}
                        </div>
                    </div>
                )}
            </div>

            <Sidebar />
        </div>
    );
}
