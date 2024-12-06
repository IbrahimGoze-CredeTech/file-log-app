import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black-100">
      <h1 className="text-3xl font-bold mb-8">
        Log Management and File Storage
      </h1>
      <div className="space-x-4">
        <Link href="/logs">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
            Log Management
          </button>
        </Link>
        <Link href="/upload">
          <button className="px-6 py-2 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition">
            File Storage
          </button>
        </Link>
      </div>
    </div>
  );
}
