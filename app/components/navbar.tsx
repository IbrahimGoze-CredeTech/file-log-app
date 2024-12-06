import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <div className="flex space-x-6">
          <Link href="/" className="text-lg hover:underline">
            Home
          </Link>
          <Link href="/logs" className="text-lg hover:underline">
            Logs
          </Link>
          <Link href="/upload" className="text-lg hover:underline">
            Upload
          </Link>
          <Link href="/delete" className="text-lg hover:underline">
            Delete
          </Link>
        </div>

        <Link href="/" className="flex-1 text-center mx-auto">
          <h1 className="text-2xl font-bold cursor-pointer hover:underline">
            Log Management and File Storage
          </h1>
        </Link>
      </div>
    </nav>
  );
}
