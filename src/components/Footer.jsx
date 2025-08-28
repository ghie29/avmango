
export default function Footer() {
    return (
        <footer className="text-gray-300 px-6 py-10 mt-8 border-t border-yellow-600/40">
            <div className="max-w-[100%] mx-auto grid grid-cols-1 md:grid-cols-3 gap-10">

                {/* 🌟 About Section */}
                <div className="">
                    <h2 className="text-2xl md:text-2xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-200 drop-shadow-lg">
                        Welcome to AVMANGO
                    </h2>
                    <p className="text-md md:text-md text-gray-200 leading-relaxed">
                        AVMANGO is your ultimate adult video platform, curated for lovers of
                        <span className="text-yellow-400 font-semibold"> Korean, Censored, Uncensored, Amateur, Chinese AV,</span>
                        and <span className="text-yellow-300 font-semibold">English Subtitled</span> content.
                    </p>
                    <p className="text-md md:text-md text-gray-300 leading-relaxed">
                        Browse, explore, and indulge in a modern adult video experience like never before!
                    </p>
                </div>


                {/* 🌟 Quick Links */}
                <div>
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r 
from-yellow-300 via-yellow-500 to-yellow-200 
font-extrabold text-2xl mb-3 drop-shadow-lg">
                        Quick Links
                    </h3>
                    <ul className="space-y-2 text-md">
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


                {/* 🌟 Partner / Contact */}
                <div>
                    <h3 className="text-transparent bg-clip-text bg-gradient-to-r 
from-yellow-300 via-yellow-500 to-yellow-200 
font-extrabold text-2xl mb-3 drop-shadow-lg">
                        Partner
                    </h3>
                    <p className="text-md font-medium text-gray-200">
                        ThePornDude
                    </p>
                    <p className="mt-6 text-sm text-gray-400">
                        &copy; {new Date().getFullYear()}
                        <span className="ml-1 text-yellow-400 font-semibold">AVMANGO</span>.
                        All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
