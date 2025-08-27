import { useEffect, useState } from "react";
import VideoCard from "../components/VideoCard";
import supabase from "../../supabaseClient";

export default function Home() {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchKoreanVideos() {
            setLoading(true);
            try {
                // Get the Korean board ID
                const { data: boardData, error: boardError } = await supabase
                    .from("boards")
                    .select("id")
                    .eq("slug", "korean")
                    .single();

                if (boardError) throw boardError;

                // Fetch latest 8 videos
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
                }));

                setVideos(normalized);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }

        fetchKoreanVideos();
    }, []);

    return (
        <div className="p-8 flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1">
                <h1 className="text-2xl text-white mb-6 font-bold">Videos being watched</h1>

                {loading ? (
                    <p className="text-white">Loading...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {videos.map(video => <VideoCard key={video.id} video={video} />)}
                    </div>
                )}
            </div>

            {/* Right Sidebar */}
            <aside className="hidden lg:block w-[300px] flex-shrink-0 space-y-6 mt-14">

                {/* 🟡 Ad Block 1 */}
                <div className="border border-yellow-600/40 overflow-hidden shadow-lg">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <img
                            src="https://ggonggane.com/storage/banner-image/20250530-1748596600489363.jpg"
                            alt="Ad Banner"
                            className="w-full h-auto"
                        />
                    </a>
                </div>

                {/* 🟡 Ad Block 2 */}
                <div className="border border-yellow-600/40 overflow-hidden shadow-lg">
                    <a href="#" target="_blank" rel="noopener noreferrer">
                        <img
                            src="https://ggonggane.com/storage/banner-image/20241018-1729178186610724.jpg"
                            alt="Ad Banner"
                            className="w-full h-auto"
                        />
                    </a>
                </div>

                {/* 🟡 Widget Example */}
                <div className="bg-gray-900 p-4 rounded-xl border border-yellow-600/20 shadow-md">
                    <h2 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">
                        Sponsored
                    </h2>
                    <p className="text-gray-400 text-sm mt-2">
                        Place text ads, affiliate banners, or trending offers here.
                    </p>
                </div>

            </aside>
        </div>
    );
}
