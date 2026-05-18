import { Link } from 'wouter';

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-gray-950/90 backdrop-blur border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-primary">
          Close By
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-300">
          <Link href="/browse" className="hover:text-accent transition">Browse</Link>
          <Link href="/hush" className="hover:text-accent transition">Hush</Link>
          <Link href="/create" className="bg-primary hover:bg-primary-600 px-4 py-2 rounded-lg transition text-white font-medium">
            Post Listing
          </Link>
          <Link href="/signin" className="hover:text-accent transition">Sign In</Link>
        </div>
      </div>
    </nav>
  );
}
