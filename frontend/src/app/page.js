import Link from "next/link";

export default function Home() {
  return (
      <div className="flex flex-col items-center justify-center min-h-screen p-8 sm:p-20 font-sans">
        <h1 className="text-4xl font-bold mb-6">Welcome to Trade Journal</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          Track, analyze, and improve your trading performance.
        </p>
        <Link href="/journal">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg hover:bg-blue-700 transition">
            Go to Journal
          </button>
        </Link>
      </div>
  );
}
