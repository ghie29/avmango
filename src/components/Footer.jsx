export default function Footer() {
    return (
        <footer className="text-gray-300 px-6 py-10 mt-16 border-t border-yellow-600/40">
            <div className="max-w-[100%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* 🌟 About Section */}
                <div>
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r 
            from-yellow-300 via-yellow-500 to-yellow-200 
            font-extrabold text-xl mb-3 drop-shadow-lg">
                        About AVMANGO
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-400">
                        AVMANGO is a curated adult video platform featuring
                        <span className="text-yellow-400"> Korean, Censored, Uncensored, Amateur, Chinese AV,</span>
                        and <span className="text-yellow-300">English-subtitled</span> content.
                        Browse, discover, and enjoy your favorite videos with a modern Adult Site.
                    </p>
                </div>

                {/* 🌟 Quick Links */}
                <div>
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r 
            from-yellow-300 via-yellow-500 to-yellow-200 
            font-extrabold text-xl mb-3 drop-shadow-lg">
                        Quick Links
                    </h3>
                    <ul className="space-y-2 text-sm">
                        {["Home", "Korean", "Censored", "Uncensored", "Amateur"].map(link => (
                            <li key={link}>
                                <a
                                    href={`/category/${link.toLowerCase()}`}
                                    className="hover:text-yellow-400 transition-colors duration-300"
                                >
                                    {link}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* 🌟 Social / Contact */}
                <div>
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r 
            from-yellow-300 via-yellow-500 to-yellow-200 
            font-extrabold text-xl mb-3 drop-shadow-lg">
                        Partner
                    </h3>
                    <div className="flex space-x-6 text-sm">
                        <a href="#" className="hover:text-yellow-400 transition-colors">Twitter</a>
                        <a href="#" className="hover:text-yellow-400 transition-colors">Instagram</a>
                        <a href="#" className="hover:text-yellow-400 transition-colors">Telegram</a>
                    </div>
                    <p className="mt-6 text-xs text-gray-500">
                        &copy; {new Date().getFullYear()}
                        <span className="ml-1 text-yellow-400 font-semibold">AVMANGO</span>.
                        All rights reserved.
                    </p>
                </div>

            </div>
        </footer>
    );
}
