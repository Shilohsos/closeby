export default function HushLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center py-16">
          <h1 className="text-5xl font-extrabold mb-2">
            <span className="text-accent">Hush</span>
          </h1>
          <p className="text-gray-400 text-lg">Campus events, parties, and experiences. Get your ticket.</p>
        </div>
        {/* Event grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <p className="text-gray-500 col-span-full text-center py-12">No upcoming events yet.</p>
        </div>
      </div>
    </div>
  );
}
