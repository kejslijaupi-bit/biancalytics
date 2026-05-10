import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="min-h-screen bg-[#071b16] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-[#54e0a5]">← Back home</Link>
        <h1 className="text-4xl font-bold mt-10 mb-4">About Biancalytics</h1>
        <p className="text-[#9fc9bd] leading-relaxed">
          Biancalytics helps founders, creators, and builders quickly check whether a website or app idea already exists.
        </p>
      </div>
    </div>
  );
}
