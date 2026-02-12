export default function Header({ lastUpdated, onRefresh }) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-sm">
            CM
          </div>
          <h1 className="text-xl font-semibold">Crypto Monitor</h1>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-gray-500 text-sm hidden sm:block">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 text-sm bg-border rounded-lg hover:bg-gray-600 transition"
          >
            Refresh
          </button>
        </div>
      </div>
    </header>
  );
}
