import { Link } from "react-router-dom";

export default function HowItWorks() {
  return (
    <div className="min-h-screen bg-[#071b16] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-[#54e0a5]">← Back home</Link>
        <h1 className="text-4xl font-bold mt-10 mb-4">How it works</h1>
        <p className="text-[#9fc9bd] leading-relaxed">
          Enter your idea or website link. Biancalytics checks for similar products, competitors, and gives you a simple recommendation.
        </p>
      </div>
    </div>
  );
}
