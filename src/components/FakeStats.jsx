import React from "react";

// Random number generator
function getRandomViews(min = 100, max = 50000) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export default function FakeStats({ video }) {
    const views = getRandomViews();
    const rating = (Math.random() * 5).toFixed(1); // e.g., 3.4 / 5
    const uploadedDate = new Date().toLocaleDateString();

    return (
        <div className="flex flex-wrap justify-between items-center bg-[#1a1a1a] border border-gray-700 rounded-lg p-3 mb-4 shadow-md">
            <span className="text-white font-semibold neon-text">
                👁 {views.toLocaleString()} views
            </span>
            <span className="text-white font-semibold neon-text">
                ⭐ {rating} / 5
            </span>
            <span className="text-white font-semibold neon-text">
                📅 {uploadedDate}
            </span>
        </div>
    );
}
