import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import supabase from "../../supabaseClient";
import Sidebar from "../components/Sidebar";
import { categories } from "../data/categories"; // ✅ import categories.js

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [extraSections, setExtraSections] = useState({});
    const [loadingExtras, setLoadingExtras] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [filteredExtraSections, setFilteredExtraSections] = useState({});

    useEffect(() => {
        if (!searchTerm) {
            setFilteredVideos(videos);
            setFilteredExtraSections(extraSections);
            return;
        }

        const term = searchTerm.toLowerCase();

        // Filter Korean / Supabase videos
        const filteredMain = videos.filter(video =>
            video.title.toLowerCase().includes(term)
        );
        setFilteredVideos(filteredMain);

        // Filter all API categories
        const filteredExtras = {};
        for (const [slug, vids] of Object.entries(extraSections)) {
            filteredExtras[slug] = vids.filter(video =>
                video.title.toLowerCase().includes(term)
            );
        }
        setFilteredExtraSections(filteredExtras);
    }, [searchTerm, videos, extraSections]);

    useEffect(() => {
        async function fetchKoreanVideos() {
            setLoading(true);
            try {
                // ✅ Get Korean board
                const { data: boardData, error: boardError } = await supabase
                    .from("boards")
                    .select("id")
                    .eq("slug", "korean")
                    .single();

                if (boardError) throw boardError;

                // ✅ Fetch videos from Supabase
                const { data: videosData, error: videosError } = await supabase
                    .from("videos")
                    .select("*")
                    .eq("board_id", boardData.id)
                    .order("created_at", { ascending: false })
                    .limit(8);

                if (videosError) throw videosError;

                const normalized = videosData.map(video => ({
                    id: video.id,
                    title: video.title || "No Title",
                    views: video.views || "0",
                    thumbnail: video.thumbnail || "https://via.placeholder.com/320x180",
                    source: "supabase",
                }));

                setVideos(normalized);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        async function fetchExtraSections() {
            setLoadingExtras(true);
            try {
                const results = {};
                // ✅ Loop through categories object (skip korean, handled above)
                for (const [slug, cat] of Object.entries(categories)) {
                    if (cat.type === "supabase") continue;

                    try {
                        const res = await fetch(cat.url);
                        const data = await res.json();

                        if (data?.list) {
                            results[slug] = data.list.slice(0, 4).map(video => ({
                                id: video.vod_id || video.id, // ✅ always unique
                                title: video.name || "No Title", // ✅ use API's title
                                thumbnail: video.thumb_url || "https://via.placeholder.com/320x180", // ✅ use API's thumbnail
                                source: "api",
                            }));
                        }
                    } catch (err) {
                        console.error(`Error fetching ${slug}:`, err);
                    }
                }
                setExtraSections(results);
            } catch (err) {
                console.error("Extra fetch error:", err);
            } finally {
                setLoadingExtras(false);
            }
        }

        fetchKoreanVideos();
        fetchExtraSections();
    }, []);

    return (
        <div className="p-2 flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 -mt-10 space-y-10">
                {/* Korean Section */}
                <div>
                    {/* Top Ads Block - hidden by default */}
                    <div
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 mt-10">
                        {/* Ad 1 */}
                        <div className="border border-yellow-600/40 overflow-hidden shadow-lg h-30">
                            <a href="https://t.me/csghie29" target="_blank" rel="noopener noreferrer">
                                <img
                                    src="https://ggonggane.com/storage/banner-image/eurostar-580x120.jpg"
                                    alt="Ad Banner 1"
                                    className="w-full h-auto"
                                    loading="lazy"
                                />
                            </a>
                        </div>

                        {/* Ad 2 - Placeholder */}
                        <div className="border border-yellow-600/40 overflow-hidden shadow-lg flex items-center justify-center bg-gray-800 text-white text-lg font-semibold h-30">
                            Boost Your Business Here!
                        </div>

                    </div>
                    <h1 className="text-2xl text-white mb-2 font-bold">Videos being watched</h1>
                    {loading ? (
                        <p className="text-white">Loading...</p>
                    ) : videos.length === 0 ? (
                        <p className="text-gray-400">No videos found.</p>
                    ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {filteredVideos.map(video => (
                                        <VideoCard key={`${video.source}-${video.id}`} video={video} />
                                    ))}
                                </div>
                    )}
                </div>

                {Object.entries(categories)
                    .filter(([slug, cat]) => cat.type === "api")
                    .map(([slug, cat]) => (
                        <div key={slug} className="mb-10">
                            {/* Category Title */}
                            <h2 className="text-xl text-white mb-2 font-semibold">
                                {cat.label || slug.replace("-", " ")}
                            </h2>

                            {/* Videos */}
                            {loadingExtras ? (
                                <p className="text-white">Loading...</p>
                            ) : filteredExtraSections[slug]?.length > 0 ? (
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {filteredExtraSections[slug].map(video => (
                                        <VideoCard key={`${video.source}-${video.id}`} video={video} />
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400">No videos found.</p>
                            )}

                            {/* ✅ Ad Block (multiple ads per category) */}
                            {cat.ads && cat.ads.length > 0 && (
                                <div className="my-6 grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {cat.ads.map((ad, idx) => (
                                        <a key={idx} href={ad.link} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={ad.image}
                                                alt={`Ad ${idx + 1}`}
                                                className="shadow-lg w-full h-auto"
                                                loading="lazy"
                                            />
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
            </div>

            {/* Sidebar */}
            <Sidebar />
        </div>
    );
}
