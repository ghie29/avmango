import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Sidebar from "../components/Sidebar";

export default function Category() {
    const { name } = useParams();
    const [videos, setVideos] = useState([]); // videos from current API page
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentUIPage, setCurrentUIPage] = useState(1); // UI page (24 per page)
    const [totalUIPages, setTotalUIPages] = useState(1); // total UI pages
    const [currentAPIPage, setCurrentAPIPage] = useState(1); // current API page
    const [apiPageData, setApiPageData] = useState([]); // 1000 videos from API
    const [nextAPIPageData, setNextAPIPageData] = useState(null); // preloaded next API page

    const videosPerUIPage = 24;
    const videosPerAPIPage = 1000;

    useEffect(() => {
        async function fetchSupabase() {
            setLoading(true);
            setError(null);
            try {
                const category = categories[name];
                if (!category) throw new Error("Category not found");

                if (category.type === "supabase") {
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

                    const allVideos = videosData.map(video => ({
                        id: video.id,
                        title: video.title || "No Title",
                        views: video.views || "0",
                        thumbnail: video.thumbnail || "https://via.placeholder.com/320x180",
                    }));

                    setApiPageData(allVideos);
                    setCurrentUIPage(1);
                    setTotalUIPages(Math.ceil(allVideos.length / videosPerUIPage));
                    setLoading(false);
                } else {
                    await fetchAPIPage(1); // fetch first API page
                }
            } catch (err) {
                setError(err.message || "Error fetching videos");
                setLoading(false);
            }
        }

        fetchSupabase();
    }, [name]);

    // Fetch API page
    const fetchAPIPage = async (apiPage, preloadNext = true) => {
        setLoading(true);
        setError(null);
        try {
            const category = categories[name];
            const res = await fetch(`${category.url}&page=${apiPage}`);
            const json = await res.json();
            const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];

            const mappedVideos = list.map(v => ({
                id: v.id,
                title: v.title || v.name || v.origin_name || v.vod_name || "No Title",
                views: v.vod_play || "0",
                thumbnail: v.poster_url || v.thumb_url || v.pic || "https://via.placeholder.com/320x180",
            }));

            setApiPageData(mappedVideos);
            setCurrentAPIPage(apiPage);

            const totalUI = (json.pagecount || 1) * (videosPerAPIPage / videosPerUIPage);
            setTotalUIPages(Math.ceil(totalUI));
            setCurrentUIPage(1);

            // Preload next API page in background
            if (preloadNext && apiPage < json.pagecount) {
                const nextRes = await fetch(`${category.url}&page=${apiPage + 1}`);
                const nextJson = await nextRes.json();
                const nextList = Array.isArray(nextJson.list) ? nextJson.list : nextJson.id ? [nextJson] : [];
                const nextMapped = nextList.map(v => ({
                    id: v.id,
                    title: v.title || v.name || v.origin_name || v.vod_name || "No Title",
                    views: v.vod_play || "0",
                    thumbnail: v.poster_url || v.thumb_url || v.pic || "https://via.placeholder.com/320x180",
                }));
                setNextAPIPageData(nextMapped);
            } else {
                setNextAPIPageData(null);
            }

        } catch (err) {
            setError("Error fetching API page " + apiPage);
        }
        setLoading(false);
    };

    // Slice 24 per UI page from current API page
    const startIndex = ((currentUIPage - 1) * videosPerUIPage) % videosPerAPIPage;
    const paginatedVideos = apiPageData.slice(startIndex, startIndex + videosPerUIPage);

    const handlePageChange = async (uiPage) => {
        if (uiPage < 1 || uiPage > totalUIPages) return;

        const newAPIPage = Math.ceil((uiPage * videosPerUIPage) / videosPerAPIPage);

        if (newAPIPage === currentAPIPage) {
            setCurrentUIPage(uiPage);
        } else if (nextAPIPageData && newAPIPage === currentAPIPage + 1) {
            // Use preloaded next API page
            setApiPageData(nextAPIPageData);
            setCurrentAPIPage(newAPIPage);
            setCurrentUIPage(uiPage);
            setNextAPIPageData(null);

            // Preload the following page
            await fetchAPIPage(newAPIPage + 1, true);
        } else {
            // Fetch normally if skipping pages
            await fetchAPIPage(newAPIPage, true);
            setCurrentUIPage(uiPage);
        }
    };

    const getPageNumbers = () => {
        const pages = [];

        if (window.innerWidth < 640) {
            // Mobile: show max 5 pages
            const maxPages = 5;
            let start = Math.max(1, currentUIPage - 2);
            let end = start + maxPages - 1;

            if (end > totalUIPages) {
                end = totalUIPages;
                start = Math.max(1, end - maxPages + 1);
            }

            for (let i = start; i <= end; i++) pages.push(i);
        } else {
            // Desktop: use ellipsis logic
            const delta = 2;
            if (totalUIPages <= 7) {
                for (let i = 1; i <= totalUIPages; i++) pages.push(i);
            } else {
                const left = Math.max(2, currentUIPage - delta);
                const right = Math.min(totalUIPages - 1, currentUIPage + delta);

                pages.push(1);
                if (left > 2) pages.push("...");
                for (let i = left; i <= right; i++) pages.push(i);
                if (right < totalUIPages - 1) pages.push("...");
                pages.push(totalUIPages);
            }
        }

        return pages;
    };


    const displayName = name
        ? name
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\b\w/g, l => l.toUpperCase())
        : "";

    return (
        <>
            <h1 className="ml-10 text-3xl font-extrabold mb-6 text-white capitalize">
                {displayName}
            </h1>

            {loading && <p className="text-white ml-10">Loading...</p>}
            {error && <p className="text-red-500 ml-10">{error}</p>}
            {!loading && !error && paginatedVideos.length === 0 && (
                <p className="text-white ml-10">No videos found.</p>
            )}

            {!loading && !error && paginatedVideos.length > 0 && (
                <div className="flex flex-col lg:flex-row gap-6 max-w-[95%] mx-auto justify-center">
                    {/* Left: Video Grid */}
                    <div className="flex-1">
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedVideos.map(video => (
                                <VideoCard key={video.id} video={video} />
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-6 space-x-2 flex-wrap">
                            <button
                                onClick={() => handlePageChange(currentUIPage - 1)}
                                disabled={currentUIPage === 1}
                                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                            >
                                Prev
                            </button>

                            {getPageNumbers().map((number, idx) =>
                                number === "..." ? (
                                    <span key={idx} className="px-2 py-1 text-white">…</span>
                                ) : (
                                    <button
                                        key={idx}
                                        onClick={() => handlePageChange(number)}
                                        className={`px-3 py-1 rounded ${currentUIPage === number ? "bg-yellow-500 text-black font-bold" : "bg-gray-700 text-white hover:bg-gray-600"}`}
                                    >
                                        {number}
                                    </button>
                                )
                            )}

                            <button
                                onClick={() => handlePageChange(currentUIPage + 1)}
                                disabled={currentUIPage === totalUIPages}
                                className="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                    {/* Right Sidebar */}
                    <Sidebar />
                </div>
            )}
        </>
    );
}
