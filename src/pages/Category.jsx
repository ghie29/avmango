import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import supabase from "../../supabaseClient";
import VideoCard from "../components/VideoCard";
import { categories } from "../data/categories";
import Sidebar from "../components/Sidebar";
import AdTopGrid from "../components/AdTopGrid";
import { Helmet } from "react-helmet";

export default function Category({ categoryName: propCategoryName }) {
    const { name } = useParams();
    const categoryName = propCategoryName || name;

    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentUIPage, setCurrentUIPage] = useState(1);
    const [totalUIPages, setTotalUIPages] = useState(1);
    const [currentAPIPage, setCurrentAPIPage] = useState(1);
    const [apiPageData, setApiPageData] = useState([]);
    const [nextAPIPageData, setNextAPIPageData] = useState(null);

    const videosPerUIPage = 24;
    const videosPerAPIPage = 1000;

    // Format display name for heading
    const displayName = categoryName
        ? categoryName
            .replace(/([A-Z])/g, " $1")
            .replace(/_/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase())
        : "";

    useEffect(() => {
        async function fetchSupabase() {
            setLoading(true);
            setError(null);
            try {
                const category = categories[categoryName];
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

                    const allVideos = videosData.map((video) => ({
                        urlId: video.slug || video.code || video.id,
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
                    await fetchAPIPage(1);
                }
            } catch (err) {
                setError(err.message || "Error fetching videos");
                setLoading(false);
            }
        }

        fetchSupabase();
    }, [categoryName]);

    const fetchAPIPage = async (apiPage, preloadNext = true) => {
        setLoading(true);
        setError(null);
        try {
            const category = categories[categoryName];
            const res = await fetch(`${category.url}&page=${apiPage}`);
            const json = await res.json();
            const list = Array.isArray(json.list) ? json.list : json.id ? [json] : [];

            const mappedVideos = list.map((v) => ({
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

            if (preloadNext && apiPage < json.pagecount) {
                const nextRes = await fetch(`${category.url}&page=${apiPage + 1}`);
                const nextJson = await nextRes.json();
                const nextList = Array.isArray(nextJson.list) ? nextJson.list : nextJson.id ? [nextJson] : [];
                const nextMapped = nextList.map((v) => ({
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

    const startIndex = ((currentUIPage - 1) * videosPerUIPage) % videosPerAPIPage;
    const paginatedVideos = apiPageData.slice(startIndex, startIndex + videosPerUIPage);

    const handlePageChange = async (uiPage) => {
        if (uiPage < 1 || uiPage > totalUIPages) return;

        const newAPIPage = Math.ceil((uiPage * videosPerUIPage) / videosPerAPIPage);

        if (newAPIPage === currentAPIPage) {
            setCurrentUIPage(uiPage);
        } else if (nextAPIPageData && newAPIPage === currentAPIPage + 1) {
            setApiPageData(nextAPIPageData);
            setCurrentAPIPage(newAPIPage);
            setCurrentUIPage(uiPage);
            setNextAPIPageData(null);
            await fetchAPIPage(newAPIPage + 1, true);
        } else {
            await fetchAPIPage(newAPIPage, true);
            setCurrentUIPage(uiPage);
        }
    };

    const getPageNumbers = () => {
        const pages = [];

        if (window.innerWidth < 640) {
            const maxPages = 5;
            let start = Math.max(1, currentUIPage - 2);
            let end = start + maxPages - 1;
            if (end > totalUIPages) {
                end = totalUIPages;
                start = Math.max(1, end - maxPages + 1);
            }
            for (let i = start; i <= end; i++) pages.push(i);
        } else {
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

    return (
        <>
            <Helmet>
                <title>{displayName} Videos – AVMANGO</title>
                <meta
                    name="description"
                    content={`Explore ${displayName} adult videos on AVMANGO, curated for lovers of Korean, Censored, Uncensored, Amateur, Chinese AV, and English Subtitled content.`}
                />
                <meta
                    name="keywords"
                    content={`AVMANGO, ${displayName}, adult videos, AV, streaming, download`}
                />
                <meta name="robots" content="index, follow" />
                <meta property="og:title" content={`${displayName} Videos – AVMANGO`} />
                <meta property="og:description" content={`Browse ${displayName} adult videos on AVMANGO.`} />
                <meta property="og:type" content="website" />
            </Helmet>

            <h1 className="ml-1 text-3xl font-extrabold mb-6 text-white capitalize">
                {displayName}
            </h1>

            {loading && <p className="text-white ml-10">Loading...</p>}
            {error && <p className="text-red-500 ml-10">{error}</p>}
            {!loading && !error && paginatedVideos.length === 0 && (
                <p className="text-white ml-10">No videos found.</p>
            )}

            {!loading && !error && paginatedVideos.length > 0 && (
                <div className="flex flex-col lg:flex-row gap-6 max-w-[99%] mx-auto justify-center1">
                    <div className="flex-1 mt-2">
                        <AdTopGrid />
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                            {paginatedVideos.map((video) => {
                                const linkId = video.urlId || video.id;
                                return <VideoCard key={video.id} video={{ ...video, id: linkId }} />;
                            })}
                        </div>
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
                                        className={`px-3 py-1 rounded ${currentUIPage === number
                                                ? "bg-yellow-500 text-black font-bold"
                                                : "bg-gray-700 text-white hover:bg-gray-600"
                                            }`}
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
                    <Sidebar />
                </div>
            )}
        </>
    );
}
