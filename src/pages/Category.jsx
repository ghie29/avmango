import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";

export default function Category() {
    const { name } = useParams();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const videosPerPage = 24;
    const preLoadPages = 3;

    useEffect(() => {
        async function fetchVideos() {
            setLoading(true);
            setError(null);

            try {
                const category = categories[name];
                if (!category) throw new Error("Category not found");

                let fetchedVideos = [];

                if (category.type === "supabase") {
                    // Korean Supabase videos
                    const { data: boardData } = await supabase
                        .from("boards")
                        .select("id")
                        .eq("slug", category.slug)
                        .single();

                    const { data: videosData } = await supabase
                        .from("videos")
                        .select("*")
                        .eq("board_id", boardData.id)
                        .order("created_at", { ascending: false });

                    fetchedVideos = videosData.map(video => ({
                        id: video.id,
                        title: video.title || "No Title",
                        views: video.views || "0",
                        thumbnail: video.thumbnail || "https://via.placeholder.com/320x180",
                    }));

                    setVideos(fetchedVideos);
                    setTotalPages(Math.ceil(fetchedVideos.length / videosPerPage));
                    setCurrentPage(1);
                } else {
                    // AVDB API videos
                    const resFirst = await fetch(`${category.url}&page=1`);
                    const jsonFirst = await resFirst.json();

                    const pageCount = jsonFirst.pagecount || 1;
                    setTotalPages(pageCount);

                    let initialVideos = [];
                    // Preload first 3 pages
                    for (let page = 1; page <= Math.min(preLoadPages, pageCount); page++) {
                        const res = page === 1 ? jsonFirst : await fetch(`${category.url}&page=${page}`).then(r => r.json());
                        const list = Array.isArray(res.list) ? res.list : res.id ? [res] : [];
                        initialVideos.push(...list.map(v => ({
                            id: v.id,
                            title: v.title || v.name || v.origin_name || "No Title",
                            views: v.vod_play || "0",
                            thumbnail: v.poster_url || v.thumb_url || "https://via.placeholder.com/320x180",
                        })));
                    }

                    setVideos(initialVideos);
                    setCurrentPage(1);

                    // Load remaining pages in the background
                    (async () => {
                        for (let page = preLoadPages + 1; page <= pageCount; page++) {
                            try {
                                const res = await fetch(`${category.url}&page=${page}`);
                                const json = await res.json();
                                const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];
                                if (list.length > 0) {
                                    setVideos(prev => [
                                        ...prev,
                                        ...list.map(v => ({
                                            id: v.id,
                                            title: v.title || v.name || v.origin_name || "No Title",
                                            views: v.vod_play || "0",
                                            thumbnail: v.poster_url || v.thumb_url || "https://via.placeholder.com/320x180",
                                        }))
                                    ]);
                                }
                            } catch (err) {
                                console.error("Background fetch error page", page, err);
                            }
                            await new Promise(r => setTimeout(r, 300)); // small delay to avoid flooding
                        }
                    })();
                }
            } catch (err) {
                setError(err.message || "Error fetching videos");
            }

            setLoading(false);
        }

        fetchVideos();
    }, [name]);

    const displayName = name
        ? name.replace(/([A-Z])/g, " $1").replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase())
        : "";

    // Pagination logic
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    const currentVideos = videos.slice(indexOfFirstVideo, indexOfLastVideo);

    const handlePrev = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNext = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));

    const getPageNumbers = () => {
        const delta = 2;
        const pages = [];

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            const left = Math.max(2, currentPage - delta);
            const right = Math.min(totalPages - 1, currentPage + delta);

            pages.push(1);
            if (left > 2) pages.push("...");
            for (let i = left; i <= right; i++) pages.push(i);
            if (right < totalPages - 1) pages.push("...");
            pages.push(totalPages);
        }

        return pages;
    };

    return (
        <>
            <h1 className="text-3xl font-extrabold mb-6 pl-6 text-left 
                ml-1 text-transparent bg-clip-text 
                bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 
                animate-gradient-x bg-[length:200%_200%] 
                drop-shadow-lg">
                {displayName}
            </h1>

            {loading && <p className="text-white">Loading...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && videos.length === 0 && <p className="text-white">No videos found.</p>}

            {!loading && !error && videos.length > 0 && (
                <>
                    <div className="flex justify-center">
                        <div className="max-w-[95%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {currentVideos.map(video => <VideoCard key={video.id} video={video} />)}
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center mt-6 space-x-2 flex-wrap">
                        <button
                            onClick={handlePrev}
                            disabled={currentPage === 1}
                            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                        >
                            Prev
                        </button>

                        {getPageNumbers().map((number, index) => (
                            <span key={index}>
                                {number === "..." ? (
                                    <span className="px-2 py-1 text-white">…</span>
                                ) : (
                                    <button
                                        onClick={() => setCurrentPage(number)}
                                        className={`px-3 py-1 rounded ${currentPage === number
                                            ? "bg-yellow-500 text-black font-bold"
                                            : "bg-gray-700 text-white hover:bg-gray-600"
                                            }`}
                                    >
                                        {number}
                                    </button>
                                )}
                            </span>
                        ))}

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 rounded bg-gray-700 text-white disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                </>
            )}
        </>
    );
}
