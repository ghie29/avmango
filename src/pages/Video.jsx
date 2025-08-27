import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Plyr from "plyr";
import Hls from "hls.js";
import "plyr-react/plyr.css";

export default function Video() {
    const { id } = useParams(); // Korean: slug or numeric ID
    const [video, setVideo] = useState(null);
    const [related, setRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const playerContainerRef = useRef(null);

    useEffect(() => {
        async function fetchVideo() {
            setLoading(true);
            setError(null);

            try {
                let fetchedVideo = null;
                let categoryType = "unknown";

                // -------------------- AVDB API first --------------------
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

                // -------------------- Korean Supabase videos --------------------
                if (!fetchedVideo) {
                    const { data: koreanVideo, error: fetchError } = await supabase
                        .from("videos")
                        .select("*")
                        .or(`id.eq.${id},slug.eq.${id}`)
                        .maybeSingle();
                    if (fetchError) throw fetchError;

                    if (koreanVideo) {
                        fetchedVideo = koreanVideo;
                        categoryType = "supabase";
                    }
                }

                if (!fetchedVideo) throw new Error("Video not found");

                // -------------------- Normalize video URL --------------------
                let videoUrl = "";
                if (categoryType === "supabase") {
                    if (fetchedVideo.video_url) {
                        videoUrl = fetchedVideo.video_url;
                    } else if (fetchedVideo.episodes?.server_data?.Full?.link_embed) {
                        videoUrl = fetchedVideo.episodes.server_data.Full.link_embed;
                    }
                } else {
                    videoUrl = fetchedVideo.episodes?.server_data?.Full?.link_embed || "";
                }

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
                        .neq("slug", id)
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

    // -------------------- Plyr Setup for Korean Supabase --------------------
    useEffect(() => {
        if (!video || !video.videoUrl || video.type !== "supabase") return;

        const container = playerContainerRef.current;
        let plyrInstance;

        if (container) {
            const videoEl = document.createElement("video");
            videoEl.className = "w-full h-full rounded-lg";
            videoEl.setAttribute("playsinline", "");
            videoEl.setAttribute("controls", "");
            container.innerHTML = "";
            container.appendChild(videoEl);

            if (video.videoUrl.endsWith(".m3u8") && Hls.isSupported()) {
                const hls = new Hls();
                hls.loadSource(video.videoUrl);
                hls.attachMedia(videoEl);
            } else {
                videoEl.src = video.videoUrl;
            }

            plyrInstance = new Plyr(videoEl, {
                autoplay: false,
                ratio: "16:9",
                tooltips: { controls: true, seek: true },
            });
        }

        return () => plyrInstance?.destroy();
    }, [video]);

    if (loading) return <p className="text-white p-6 text-center">Loading...</p>;
    if (error) return <p className="text-red-500 p-6 text-center">{error}</p>;
    if (!video) return null;

    return (
        <div className="flex flex-col items-center w-full">
            {/* Video Player */}
            <div ref={playerContainerRef} className="w-full max-w-4xl mb-6">
                {video.type !== "supabase" && video.videoUrl && (
                    <div className="relative pt-[56.25%] rounded shadow-lg overflow-hidden">
                        <iframe
                            src={video.videoUrl}
                            title={video.title}
                            allowFullScreen
                            className="absolute top-0 left-0 w-full h-full"
                        />
                    </div>
                )}
                {!video.videoUrl && <p className="text-white text-center">No video URL available</p>}

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
