export default function Sidebar() {
    return (
        <aside className="hidden lg:block w-[300px] flex-shrink-0 space-y-1">

            {/* 🟡 Ad Block 1 */}
            <div className="border border-yellow-600/40 overflow-hidden shadow-lg">
                <a href="https://t.me/csghie29" target="_blank" rel="noopener noreferrer">
                    <img
                        src="https://ggonggane.com/storage/banner-image/20250530-1748596600489363.jpg"
                        alt="Ad Banner"
                        className="w-full h-auto"
                    />
                </a>
            </div>

            {/* 🟡 Ad Block 2 */}
            <div className="border border-yellow-600/40 overflow-hidden shadow-lg">
                <a href="https://t.me/csghie29" target="_blank" rel="noopener noreferrer">
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
                    Advertise Here!
                </h2>
                <p className="text-gray-400 text-sm mt-2">
                    Want to reach thousands of visitors? Place your banner or sponsored content here and get noticed!
                </p>
            </div>

        </aside>
    );
}
