import { useState } from "react";
import { NavLink } from "react-router-dom";
import { Search } from "lucide-react";

// ✅ Define categories with label + slug
const categories = [
    { label: "Korean", slug: "korean" },
    { label: "Censored", slug: "censored" },
    { label: "Uncensored", slug: "uncensored" },
    { label: "U-Leaked", slug: "uncensored-leaked" },
    { label: "Amateur", slug: "amateur" },
    { label: "Chinese AV", slug: "chinese-av" },
    { label: "English Subtitle", slug: "english-subtitle" },
];

export default function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <header className="text-white p-1 mt-2">
            {/* Top row */}
            <div className="flex items-center justify-between max-w-[100%] mx-auto">
                {/* Logo */}
                <a href="/">
                    <div className="flex-shrink-0 text-5xl font-extrabold flex items-center select-none">
                        <span className="text-white drop-shadow-md">AV</span>
                        <span
                            className="ml-1 text-transparent bg-clip-text bg-gradient-to-r 
              from-yellow-300 via-yellow-500 to-yellow-200 
              animate-gradient-x bg-[length:200%_200%] drop-shadow-lg"
                        >
                            MANGO
                        </span>
                    </div>
                </a>

                {/* Desktop: search with icon */}
                <div className="hidden md:flex flex-1 justify-center">
                    <div className="relative w-1/2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-yellow-400
                focus:bg-gradient-to-r focus:from-gray-800 focus:via-gray-900 focus:to-gray-800
                transition-all duration-300"
                        />
                    </div>
                </div>

                {/* Right: Hamburger for mobile / Ad for desktop */}
                <div className="md:hidden">
                    <button
                        className="text-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 bg-clip-text text-transparent"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        ☰
                    </button>
                </div>

                <div
                    className="hidden md:flex flex-shrink-0 w-[470px] h-[60px] 
          items-center justify-center text-white font-semibold
          bg-gradient-to-r from-gray-800 via-gray-900 to-gray-800
          border border-yellow-400/30  hover:scale-105
          transition-all duration-300"
                >
                    Ad 470x60
                </div>
            </div>

            {/* Mobile: Search bar below top row */}
            <div className="md:hidden mt-2">
                <div className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                        type="text"
                        placeholder="Search..."
                        className="w-full pl-10 pr-4 py-2 rounded 
              bg-gray-800 text-white focus:outline-none
              border border-yellow-400/20
              shadow-md shadow-yellow-500/10
              focus:border-yellow-400 focus:shadow-yellow-400/30
              transition-all duration-300"
                    />
                </div>
            </div>

            {/* Mobile: menu items */}
            {mobileMenuOpen && (
                <nav className="md:hidden mt-2 bg-gray-900 rounded-lg p-3 shadow-lg shadow-black/50">
                    <ul className="flex flex-col space-y-2">
                        {categories.map((cat) => (
                            <li key={cat.slug}>
                                <NavLink
                                    to={`/category/${cat.slug}`}
                                    onClick={() => setMobileMenuOpen(false)} // ✅ auto-close menu
                                    className={({ isActive }) =>
                                        `block px-4 py-3 rounded-lg font-semibold text-base transition-all
                    ${isActive
                                            ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-md shadow-yellow-500/20"
                                            : "text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600 hover:shadow-md hover:shadow-yellow-500/10"
                                        }`
                                    }
                                >
                                    {cat.label}
                                </NavLink>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}

            {/* Desktop: category menu */}
            <nav className="hidden md:block mt-10 w-full">
                <ul
                    className="flex flex-nowrap px-2 md:px-0 space-x-4 md:space-x-6 
          bg-gradient-to-r from-gray-900 via-yellow-900 to-gray-900 
          border border-yellow-600/40 rounded-md shadow-lg shadow-yellow-700/30 p-2"
                >
                    {/* ✅ Home link */}
                    <li className="flex-shrink-0">
                        <NavLink
                            to="/"
                            end
                            className={({ isActive }) =>
                                `px-4 py-3 font-bold text-lg transition-all whitespace-nowrap 
                ${isActive
                                    ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-md"
                                    : "text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600"
                                }`
                            }
                        >
                            Home
                        </NavLink>
                    </li>

                    {/* ✅ Categories */}
                    {categories.map((cat) => (
                        <li key={cat.slug} className="flex-shrink-0">
                            <NavLink
                                to={`/category/${cat.slug}`}
                                className={({ isActive }) =>
                                    `px-4 py-3 font-bold text-lg transition-all whitespace-nowrap 
                  ${isActive
                                        ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-md"
                                        : "text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600"
                                    }`
                                }
                            >
                                {cat.label}
                            </NavLink>
                        </li>
                    ))}

                    {/* ✅ Banner Inquiry at the END */}
                    <li className="flex-shrink-0 ml-auto">
                        <NavLink
                            to="https://t.me/csghie29"
                            className={({ isActive }) =>
                                `px-4 py-3 font-bold text-lg transition-all whitespace-nowrap 
                ${isActive
                                    ? "text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-md"
                                    : "text-white hover:text-transparent hover:bg-clip-text hover:bg-gradient-to-r hover:from-yellow-400 hover:to-yellow-600"
                                }`
                            }
                        >
                            Banner Inquiry
                        </NavLink>
                    </li>
                </ul>
            </nav>
        </header>
    );
}
