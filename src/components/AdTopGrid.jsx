// src/components/AdTopGrid.jsx
import React from "react";

export default function AdTopGrid() {
    const ads = [
        { id: 1, link: "https://t.me/csghie29", text: "Advertise Now!", telegram: "@csghie29" },
        { id: 2, link: "https://t.me/csghie29", text: "Advertise Now!", telegram: "@csghie29" },
    ];

    return (
        <div className="w-full mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 -mt-2">
                {ads.map(ad => (
                    <a
                        key={ad.id}
                        href={ad.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-[100px] bg-yellow-500 flex flex-col items-center justify-center text-black font-bold hover:bg-yellow-600 transition-colors"
                    >
                        <span>{ad.text}</span>
                        <span className="text-sm">{`Telegram: ${ad.telegram}`}</span>
                    </a>
                ))}
            </div>
        </div>
    );
}
