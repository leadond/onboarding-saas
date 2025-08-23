export default function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Dashboard</h1>
        <p className="text-lg text-gray-600 mb-8">
          Welcome to your onboarding SaaS dashboard
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-gray-700">
            The dashboard features are currently being updated and will be available soon.
          </p>
        </div>
      </div>
    </div>
  );
}
