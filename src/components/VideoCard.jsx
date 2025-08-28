import { Link } from "react-router-dom";

export default function VideoCard({ video }) {
    return (
        <div className="group relative bg-gradient-to-br from-gray-900 via-gray-800 to-black 
      border border-yellow-600/30 rounded-1xl overflow-hidden shadow-lg 
      hover:shadow-yellow-700/40 transition-all duration-300 hover:scale-105">

            {/* Use the id passed from Category.jsx (could be slug, code, or UUID) */}
            <Link to={`/video/${video.id}`}>
                {/* ✅ Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                    <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Glow Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent 
    opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>

                {/* ✅ Info */}
                <div className="p-2">
                    <h3 className="font-bold text-white text-sm line-clamp-2 
            group-hover:text-transparent group-hover:bg-clip-text 
            group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-yellow-600 
            transition-all duration-300">
                        {video.title}
                    </h3>
                </div>
            </Link>
        </div>
    );
}
