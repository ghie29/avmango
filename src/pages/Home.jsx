import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import supabase from "../../supabaseClient";
import Sidebar from "../components/Sidebar";
import { categories } from "../data/categories";
import AdTopGrid from "../components/AdTopGrid";
import { Helmet } from 'react-helmet';

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [extraSections, setExtraSections] = useState({});
    const [loadingExtras, setLoadingExtras] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredVideos, setFilteredVideos] = useState([]);
    const [filteredExtraSections, setFilteredExtraSections] = useState({});

    // -------------------- Search Filtering --------------------
    useEffect(() => {
        if (!searchTerm) {
            setFilteredVideos(videos);
            setFilteredExtraSections(extraSections);
            return;
        }

        const term = searchTerm.toLowerCase();

        const filteredMain = videos.filter(video =>
            video.title.toLowerCase().includes(term)
        );
        setFilteredVideos(filteredMain);

        const filteredExtras = {};
        for (const [slug, vids] of Object.entries(extraSections)) {
            filteredExtras[slug] = vids.filter(video =>
                video.title.toLowerCase().includes(term)
            );
        }
        setFilteredExtraSections(filteredExtras);
    }, [searchTerm, videos, extraSections]);

    // -------------------- Fetch Videos --------------------
    useEffect(() => {
        async function fetchKoreanVideos() {
            setLoading(true);
            try {
                const { data: boardData, error: boardError } = await supabase
                    .from("boards")
                    .select("id")
                    .eq("slug", "korean")
                    .single();
                if (boardError) throw boardError;

                const { data: videosData, error: videosError } = await supabase
                    .from("videos")
                    .select("*")
                    .eq("board_id", boardData.id)
                    .order("created_at", { ascending: false })
                    .limit(8);
                if (videosError) throw videosError;

                const normalized = videosData.map(video => ({
                    id: video.slug || video.code || video.id, // SEO-friendly
                    title: video.title || "No Title",
                    views: video.views || "0",
                    thumbnail: video.thumbnail || "https://via.placeholder.com/320x180",
                    source: "supabase",
                    type: "supabase",
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
                for (const [slug, cat] of Object.entries(categories)) {
                    if (cat.type === "supabase") continue;

                    try {
                        const res = await fetch(cat.url);
                        const data = await res.json();

                        if (data?.list) {
                            results[slug] = data.list.slice(0, 4).map(video => ({
                                id: video.id, // ✅ always use numeric ID for API videos
                                title: video.name || video.title || "No Title",
                                thumbnail: video.thumb_url || video.poster_url || "https://via.placeholder.com/320x180",
                                source: "api",
                                type: "api",
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
        <div className="p-2 flex flex-col lg:flex-row gap-2 mt-2">
            <Helmet>
                <title>AVMANGO – Your Ultimate Adult Video Platform</title>
                <meta name="description" content="AVMANGO is your ultimate adult video platform, featuring Korean, Censored, Uncensored, Amateur, Chinese AV, and English Subtitled content." />
                <meta name="keywords" content="AVMANGO, adult videos, Korean AV, Censored AV, Uncensored AV, Amateur AV, Chinese AV, English Subtitles" />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content="AVMANGO – Adult Video Platform" />
                <meta property="og:description" content="Browse, explore, and indulge in a modern adult video experience like never before." />
                <meta property="og:type" content="website" />
            </Helmet>
            {/* Main content */}
            <div className="flex-1 -mt-10 space-y-2 mt-2">

                {/* Ad Block */}
                <AdTopGrid />

                {/* Korean Section */}
                <div>
                    <h1 className="text-2xl text-white mb-2 font-bold">Mango Korean +19</h1>
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

                {/* API Extra Sections */}
                {Object.entries(categories)
                    .filter(([slug, cat]) => cat.type === "api")
                    .map(([slug, cat]) => (
                        <div key={slug} className="mb-10">
                            <h2 className="text-xl text-white mb-2 font-semibold">
                                {cat.label || slug.replace("-", " ")}
                            </h2>

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
