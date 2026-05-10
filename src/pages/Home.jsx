import { Link } from "react-router-dom";
import { Sparkles, Lightbulb, Globe2 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#071b16] text-white font-inter flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,#1e8d6d_1px,transparent_1px)] [background-size:32px_32px]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_45%,rgba(198,165,64,.18),transparent_35%),radial-gradient(circle_at_30%_60%,rgba(35,171,129,.12),transparent_32%)]" />

      <header className="relative z-10 max-w-6xl mx-auto w-full px-6 py-7 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-[#54e0a5] flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-[#062016]" />
          </div>
          <span className="font-bold text-lg">Biancalytics</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-8 text-sm text-[#a6cfc3]">
          <Link to="/how-it-works" className="hover:text-white">How it works</Link>
          <Link to="/about" className="hover:text-white">About</Link>
          <Link to="/contact" className="hover:text-white">Contact</Link>
        </nav>
      </header>

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="inline-flex items-center gap-2 border border-[#2fc78f]/40 bg-[#123d31]/80 text-[#54e0a5] text-xs font-bold tracking-widest px-5 py-2 rounded-full mb-9">
          <Sparkles className="h-3.5 w-3.5" /> AI IDEA VALIDATOR
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.05] mb-8">
          Does your website idea<br />
          <span className="text-[#54e0a5]">already exist?</span>
        </h1>

        <p className="text-lg sm:text-xl text-[#9fc9bd] max-w-2xl leading-relaxed mb-16">
          Tell us your idea or paste your site link — we'll search the internet and
          give you an honest, friendly answer in seconds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl w-full text-left">
          <Link to="/app" className="group rounded-2xl border border-[#31544b] bg-[#0d241e]/80 p-6 hover:border-[#54e0a5]/70 transition">
            <Lightbulb className="h-7 w-7 text-[#9fc9bd] mb-4" />
            <h2 className="font-bold mb-2">I have an idea</h2>
            <p className="text-sm text-[#9fc9bd]">Describe your concept and we'll search for similar things</p>
          </Link>

          <Link to="/app" className="group rounded-2xl border border-[#31544b] bg-[#0d241e]/80 p-6 hover:border-[#54e0a5]/70 transition">
            <Globe2 className="h-7 w-7 text-[#9fc9bd] mb-4" />
            <h2 className="font-bold mb-2">I already built something</h2>
            <p className="text-sm text-[#9fc9bd]">Paste your site link and we'll check who's doing the same</p>
          </Link>
        </div>
      </main>

      <footer className="relative z-10 max-w-6xl mx-auto w-full px-6 pb-6 text-sm text-[#9fc9bd] flex gap-6">
        <Link to="/about">About</Link>
        <Link to="/how-it-works">How It Works</Link>
        <Link to="/contact">Contact</Link>
      </footer>
    </div>
  );
}
