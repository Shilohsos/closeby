export default function Browse() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Browse Listings</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar filters */}
        <aside className="bg-gray-900 rounded-xl p-6 space-y-6 lg:col-span-1">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Search</label>
            <input
              type="text"
              placeholder="What are you looking for?"
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Category</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
              <option>All Categories</option>
              <option>Housing</option>
              <option>Jobs</option>
              <option>Services</option>
              <option>Food & Restaurants</option>
              <option>Electronics</option>
              <option>Fashion</option>
              <option>Events</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Location</label>
            <select className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
              <option>All Locations</option>
              <option>University of Lagos</option>
              <option>Obafemi Awolowo University</option>
              <option>University of Nigeria Nsukka</option>
              <option>University of Ibadan</option>
              <option>University of Benin</option>
            </select>
          </div>
        </aside>

        {/* Results */}
        <div className="lg:col-span-3">
          <p className="text-gray-500">No listings yet. Be the first to post!</p>
        </div>
      </div>
    </div>
  );
}
