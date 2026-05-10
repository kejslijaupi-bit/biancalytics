import { Link } from "react-router-dom";

export default function Contact() {
  return (
    <div className="min-h-screen bg-[#071b16] text-white px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="text-[#54e0a5]">← Back home</Link>
        <h1 className="text-4xl font-bold mt-10 mb-4">Contact</h1>
        <p className="text-[#9fc9bd] leading-relaxed">
          Add your email, contact form, or social links here.
        </p>
      </div>
    </div>
  );
}
