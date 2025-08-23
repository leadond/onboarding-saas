export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Onboard Hero
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Client Onboarding Platform
          </p>
          <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Welcome</h2>
            <p className="text-gray-700 mb-6">
              Transform client onboarding with AI automation. Eliminate manual bottlenecks, 
              reduce customer abandonment by 86%, and achieve 3x faster conversion rates.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-800">
                🚀 Application is being updated. Full features will be available soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}