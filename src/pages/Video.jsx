import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Sidebar from "../components/Sidebar";
import Hls from "hls.js";
import { validate as isUuid } from "uuid";
import AdTopGrid from "../components/AdTopGrid";
import FakeStats from "../components/FakeStats";
import { Helmet } from "react-helmet";

export default function Video() {
    const { id } = useParams();
    const [video, setVideo] = useState(null);
    const [related, setRelated] = useState([]);
    const [displayedRelated, setDisplayedRelated] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [relatedBatch, setRelatedBatch] = useState(12);

    useEffect(() => {
        window.scrollTo(0, 0);

        async function fetchVideo() {
            setLoading(true);
            setError(null);

            try {
                let fetchedVideo = null;
                let categoryType = "unknown";

                // API categories
                for (const cat of Object.values(categories)) {
                    if (cat.type === "api") {
                        const res = await fetch(cat.url);
                        const json = await res.json();
                        const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];
                        const found = list.find((v) => v.id == id);
                        if (found) {
                            fetchedVideo = found;
                            categoryType = "api";
                            fetchedVideo.videoUrl =
                                found.episodes?.server_data?.Full?.link_embed || found.video_url || "";
                            break;
                        }
                    }
                }

                // Supabase Korean
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
                        fetchedVideo.videoUrl = koreanVideo.video_url_m3u8 || koreanVideo.video_url;
                    }
                }

                if (!fetchedVideo) throw new Error("Video not found");

                // Related videos
                let relatedVideos = [];
                if (categoryType === "supabase") {
                    const { data: rel, error: relError } = await supabase
                        .from("videos")
                        .select("*")
                        .not("id", "eq", fetchedVideo.id);
                    if (relError) console.error(relError);

                    relatedVideos = (rel || []).map((v) => ({
                        id: v.id,
                        slug: v.slug,
                        title: v.title || v.name || "No Title",
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
                            .map((v) => ({
                                id: v.id,
                                title: v.title || v.name || v.origin_name || "No Title",
                                thumbnail: v.poster_url || v.thumb_url || "https://via.placeholder.com/320x180",
                                views: v.vod_play || "0",
                            }));
                    }
                }

                relatedVideos = relatedVideos.sort(() => Math.random() - 0.5);

                setVideo({
                    id: fetchedVideo.id,
                    title: fetchedVideo.title || fetchedVideo.name || "No Title",
                    videoUrl: fetchedVideo.videoUrl || fetchedVideo.video_url,
                    type: categoryType,
                    description: fetchedVideo.description || "No description available",
                    thumbnail: fetchedVideo.poster_url || fetchedVideo.thumb_url || "https://via.placeholder.com/640x360",
                });

                setRelated(relatedVideos);
                setDisplayedRelated(relatedVideos.slice(0, relatedBatch));
            } catch (err) {
                console.error(err);
                setError(err.message || "Error loading video");
            }

            setLoading(false);
        }

        fetchVideo();
    }, [id, relatedBatch]);

    const loadMore = () => {
        setDisplayedRelated((prev) => {
            const nextCount = prev.length + relatedBatch;
            return related.slice(0, nextCount);
        });
    };

    return (
        <div className="flex flex-col lg:flex-row w-full px-2 gap-6 mt-2">
            {/* Helmet SEO */}
            {video && (
                <Helmet>
                    <title>{video.title} – AVMANGO</title>
                    <meta name="description" content={video.description} />
                    <meta
                        name="keywords"
                        content={`AVMANGO, adult video, ${video.title}, streaming, download, Korean AV, Uncensored, Amateur`}
                    />
                    <meta name="robots" content="index, follow" />
                    <meta property="og:title" content={`${video.title} – AVMANGO`} />
                    <meta property="og:description" content={video.description} />
                    <meta property="og:type" content="video.other" />
                    <meta property="og:image" content={video.thumbnail} />
                    <meta property="og:video" content={video.videoUrl} />

                    <script type="application/ld+json">
                        {JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "VideoObject",
                            "name": video.title,
                            "description": video.description,
                            "thumbnailUrl": video.thumbnail,
                            "uploadDate": new Date().toISOString(),
                            "contentUrl": video.videoUrl,
                            "embedUrl": video.videoUrl,
                            "publisher": {
                                "@type": "Organization",
                                "name": "AVMANGO",
                                "logo": {
                                    "@type": "ImageObject",
                                    "url": "https://avmango.com/logo.png"
                                }
                            }
                        })}
                    </script>
                </Helmet>
            )}

            <div className="flex-1 flex flex-col items-center mt-2">
                {loading && <p className="text-white p-6 text-center">Loading...</p>}
                {error && <p className="text-red-500 p-6 text-center">{error}</p>}
                {video && (
                    <>
                        <div className="w-full max-w-[100%] mx-auto mb-6">
                            <AdTopGrid />
                            <FakeStats video={video} />

                            {/* Video Player */}
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

                        {/* Related Videos */}
                        {displayedRelated.length > 0 ? (
                            <div className="w-full max-w-7xl mt-8 mx-auto">
                                <h2 className="text-2xl sm:text-2xl md:text-3xl text-white font-bold mb-6 text-center neon-text">
                                    More Videos AVMANGO
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {displayedRelated.map((v) => (
                                        <VideoCard key={v.id} video={v} onClick={() => window.scrollTo(0, 0)} />
                                    ))}
                                </div>

                                {displayedRelated.length < related.length && (
                                    <div className="text-center mt-4">
                                        <button
                                            onClick={loadMore}
                                            className="px-6 py-2 bg-yellow-600 text-black font-bold rounded-lg hover:bg-yellow-700 transition-all"
                                        >
                                            Load More
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-gray-400 text-center mt-4">No related videos found.</p>
                        )}
                    </>
                )}
            </div>

            <Sidebar />
        </div>
    );
}
