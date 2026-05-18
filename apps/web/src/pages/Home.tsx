export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      {/* Hero */}
      <section className="text-center py-20">
        <h1 className="text-5xl font-extrabold mb-4">
          Welcome to <span className="text-primary">Close By</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
          Nigeria's campus marketplace — buy, sell, and connect with students near you.
        </p>
        <div className="flex gap-4 justify-center">
          <a href="/browse" className="bg-primary hover:bg-primary-600 px-6 py-3 rounded-lg font-semibold transition">
            Browse Listings
          </a>
          <a href="/create" className="border border-gray-600 hover:border-accent px-6 py-3 rounded-lg font-semibold transition">
            Post an Item
          </a>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">Categories</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Housing', 'Jobs', 'Services', 'Food & Restaurants', 'Electronics', 'Fashion', 'Events'].map((cat) => (
            <a
              key={cat}
              href={`/browse?category=${cat.toLowerCase().replace(/[& ]/g, '_')}`}
              className="bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl p-6 text-center transition"
            >
              <div className="text-primary text-3xl mb-2">📦</div>
              <div className="font-medium">{cat}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="py-12">
        <h2 className="text-2xl font-bold mb-6">Featured Listings</h2>
        <p className="text-gray-500">Loading featured listings...</p>
      </section>
    </div>
  );
}
