import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex flex-col items-center">
        <Link
          href="/"
          className=" text-2xl font-bold cursor-pointer  text-center mb-4 "
        >
          Log Management and File Storage
        </Link>
        <div className="flex justify-start w-full space-x-6">
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
          <Link href="/update" className="text-lg hover:underline">
            Update
          </Link>
          <Link href="/download" className="text-lg hover:underline">
            Download
          </Link>
        </div>
      </div>
    </nav>
  );
}
