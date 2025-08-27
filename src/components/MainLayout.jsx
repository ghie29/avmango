import Header from "./Header";
import Footer from "./Footer";

export default function MainLayout({ children }) {
  return (
    <div className="bg-black min-h-screen flex flex-col items-center">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex flex-col items-center w-full max-w-6xl p-2">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
